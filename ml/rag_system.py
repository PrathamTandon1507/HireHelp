"""Production-ready RAG system for HireHelp candidate-job matching"""

import json
import re
import logging
from typing import Optional

from groq import Groq

from .models import JobModel, CandidateProfile, RAGOutput
from .vector_store import FAISSVectorStore

logger = logging.getLogger(__name__)


class RAGAnalyzer:
    """
    Core RAG engine for candidate-job matching.
    Multi-vector retrieval + Groq LLM analysis with deterministic outputs.
    """
    
    def __init__(self, groq_api_key: str, vector_store: Optional[FAISSVectorStore] = None):
        """Initialize RAG analyzer"""
        if not groq_api_key:
            raise ValueError("Groq API key is required")
        
        self.client = Groq(api_key=groq_api_key)
        self.vector_store = vector_store or FAISSVectorStore()
    
    def _multi_vector_retrieval(self, job: JobModel, application_id: str) -> str:
        """
        Multi-vector retrieval: search for skills + requirements.
        Deduplicates and limits to top 25 unique chunks for better context.
        Filtered by application_id to ensure candidate-specific data.
        """
        context_fragments = {}
        
        # Search for each skill
        for skill in job.skills:
            results = self.vector_store.search(skill, top_k=8, application_id=application_id)
            for result in results:
                context_fragments[result] = True  # Use dict for dedup
        
        # Search for each requirement
        for requirement in job.requirements:
            results = self.vector_store.search(requirement, top_k=8, application_id=application_id)
            for result in results:
                context_fragments[result] = True
        
        # If still little context, search with job title and description
        if len(context_fragments) < 5:
            results = self.vector_store.search(job.title, top_k=8, application_id=application_id)
            for result in results:
                context_fragments[result] = True
        
        # Format context
        context = "\n---\n".join(list(context_fragments.keys())[:25])
        return context if len(context_fragments) > 0 else "[No relevant detailed resume content found for this candidate]"
    
    def _build_prompt(
        self,
        job: JobModel,
        candidate: CandidateProfile,
        context: str
    ) -> str:
        """Build structured prompt for LLM analysis"""
        
        # Fallback to raw resume text if RAG fragments are missing
        if context == "[No relevant detailed resume content found for this candidate]" or len(context) < 100:
            raw_preview = candidate.resume_text[:2000] if candidate.resume_text else "[No resume text available]"
            context = f"RETRIEVAL NOTE: Semantic search returned sparse results. Using raw resume excerpt:\n{raw_preview}"

        prompt = f"""You are an expert hiring analyst. Evaluate the candidate's alignment with the job using the provided resume fragments and profile.

## Resume Context (retrieved fragments for this candidate):
{context}

## Candidate Profile:
Bio: {candidate.bio}
Skills: {', '.join(candidate.skills)}

## Job Requirements:
Position: {job.title}
Company: {job.company_name}
Description: {job.description}
Key Requirements: {', '.join(job.requirements)}
Required Skills: {', '.join(job.skills)}

---

SCORING CRITERIA:
- 90-100: Exceptional match, all core skills and requirements met.
- 70-89: Strong match, most key requirements met with some minor gaps.
- 50-69: Moderate match, has foundational skills but lacks specific experience.
- <50: Poor match, significant missing skills or irrelevant background.

Output ONLY valid JSON (no markdown, no text before/after). 
The 'analysis_report' MUST follow this EXACT format with STRENGTHS and IMPROVEMENTS sections:

{{
  "match_score": <Integer 0-100>,
  "analysis_report": "STRENGTHS:\n• <A specific, evidence-based strength from the resume>\n• <Another specific strength>\n\nIMPROVEMENTS:\n• <A specific gap relative to the job requirements>\n• <Another specific area for improvement>",
  "pros": [<3-5 concise strengths>],
  "cons": [<3-5 concise specific improvement areas>],
  "skill_gaps": [<missing required skills>],
  "interview_questions": [<3-4 targeted questions based on the candidate's gaps>]
}}"""
        
        return prompt
    
    def analyze_candidate(
        self,
        application_id: str,
        job: JobModel,
        candidate: CandidateProfile
    ) -> RAGOutput:
        """
        Execute full RAG pipeline:
        1. Index resume (if not already)
        2. Multi-vector retrieval (candidate-filtered)
        3. LLM analysis
        4. Parse and validate output
        """
        try:
            # Index resume if needed (ensure application_id is tracked)
            self.vector_store.add_resume(candidate.application_id, candidate.resume_text)
            
            # Multi-vector retrieval with filtering
            context = self._multi_vector_retrieval(job, candidate.application_id)
            
            # Build prompt
            prompt = self._build_prompt(job, candidate, context)
            
            # LLM inference with low temperature and JSON mode
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=2000,
                response_format={"type": "json_object"}
            )
            
            response_text = response.choices[0].message.content.strip()
            
            # Extract JSON
            json_match = re.search(r'\{[\s\S]*\}', response_text)
            if not json_match:
                logger.error(f"No JSON found in response for {application_id}")
                return self._default_output()
            
            result = json.loads(json_match.group())
            
            # Validate and construct output
            raw_score = result.get("match_score", 0)
            try:
                score_val = float(raw_score)
                # If score is a decimal (e.g. 0.85), convert to percentage
                if 0 < score_val <= 1.0:
                    score_val *= 100
                match_score = max(0, min(100, int(round(score_val))))
            except (ValueError, TypeError):
                match_score = 0

            output = RAGOutput(
                match_score=match_score,
                explanation=str(result.get("analysis_report", result.get("strengths_and_weaknesses", "Unable to analyze")))[:2000],
                pros=list(result.get("pros", []))[:5],
                cons=list(result.get("cons", []))[:5],
                skill_gaps=list(result.get("skill_gaps", []))[:10],
                interview_questions=list(result.get("interview_questions", []))[:4]
            )
            
            logger.info(f"Analysis complete for {application_id}: score={output.match_score}")
            return output
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error for {application_id}: {e}")
            return self._default_output()
        except Exception as e:
            logger.error(f"RAG analysis error for {application_id}: {e}")
            return self._default_output()
    
    @staticmethod
    def _default_output() -> RAGOutput:
        """Fallback output on error"""
        return RAGOutput(
            match_score=0,
            explanation="Analysis failed. Please try again.",
            pros=[],
            cons=["Unable to process"],
            skill_gaps=[],
            interview_questions=[]
        )


# ============================================================================
# INTEGRATION FUNCTIONS (Call from backend)
# ============================================================================

_rag_analyzer = None  # Singleton instance


def initialize_rag(groq_api_key: str) -> RAGAnalyzer:
    """
    Initialize RAG system (call once at backend startup).
    Returns singleton analyzer.
    """
    global _rag_analyzer
    if _rag_analyzer is None:
        _rag_analyzer = RAGAnalyzer(groq_api_key=groq_api_key)
        logger.info("RAG system initialized")
    return _rag_analyzer


def get_rag_analyzer() -> RAGAnalyzer:
    """Get singleton RAG analyzer instance"""
    if _rag_analyzer is None:
        raise RuntimeError("RAG system not initialized. Call initialize_rag() first.")
    return _rag_analyzer


async def analyze_application(
    application_id: str,
    job: JobModel,
    candidate: CandidateProfile
) -> dict:
    """
    Async wrapper for backend integration.
    Returns dict ready for MongoDB persistence.
    """
    analyzer = get_rag_analyzer()
    output = analyzer.analyze_candidate(application_id, job, candidate)
    
    return {
        "ai_match_score": output.match_score,
        "ai_explanation": output.explanation,
        "ai_pros": output.pros,
        "ai_cons": output.cons,
        "ai_skill_gaps": output.skill_gaps,
        "ai_interview_questions": output.interview_questions
    }