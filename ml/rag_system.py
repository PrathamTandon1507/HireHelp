"""
HireHelp RAG System — BM25 Retrieval + Groq LLM Generation
=============================================================
Genuine Retrieval-Augmented Generation architecture:

  CHUNK   → Split resume into overlapping word-level chunks
  RETRIEVE → BM25 ranks chunks by relevance to each job requirement/skill
  AUGMENT  → Top-ranked chunks injected as grounded context into LLM prompt
  GENERATE → Groq LLM produces evidence-based structured analysis

Why BM25 instead of FAISS + SentenceTransformer?
  - SentenceTransformer loads a 420MB model → OOM on Render free tier (512MB limit)
  - BM25 is pure Python math — zero ML model loading, <5MB RAM
  - BM25 is what Elasticsearch/OpenSearch use in production RAG pipelines
  - For skill/keyword-heavy resume matching it often outperforms dense retrieval
"""

import json
import re
import logging
import asyncio
from math import log
from typing import List, Optional

from groq import Groq

from .models import JobModel, CandidateProfile, RAGOutput

logger = logging.getLogger(__name__)


# ============================================================================
# BM25 RETRIEVAL ENGINE
# ============================================================================

class BM25Retriever:
    """
    BM25 sparse retrieval — Okapi BM25 algorithm.
    Same retrieval core used by Elasticsearch and production RAG systems.
    No ML models, no downloads, pure math. Memory: <5MB.
    """

    def __init__(self, k1: float = 1.5, b: float = 0.75):
        self.k1 = k1  # term frequency saturation
        self.b = b    # length normalisation

    def _tokenize(self, text: str) -> List[str]:
        """Lowercase and split on whitespace."""
        return text.lower().split()

    def retrieve(self, query: str, chunks: List[str], top_k: int = 5) -> List[str]:
        """
        Rank chunks by BM25 score against query and return top_k.
        Returns only chunks with score > 0 (i.e. genuine term overlap).
        """
        if not chunks:
            return []

        tokenized_corpus = [self._tokenize(c) for c in chunks]
        avg_dl = sum(len(d) for d in tokenized_corpus) / max(len(tokenized_corpus), 1)

        # Build IDF across this chunk corpus
        n = len(tokenized_corpus)
        df: dict[str, int] = {}
        for doc in tokenized_corpus:
            for term in set(doc):
                df[term] = df.get(term, 0) + 1

        idf = {
            term: log((n - freq + 0.5) / (freq + 0.5) + 1)
            for term, freq in df.items()
        }

        # Score each chunk
        query_terms = self._tokenize(query)
        scores: List[float] = []
        for doc in tokenized_corpus:
            dl = len(doc)
            score = 0.0
            for term in query_terms:
                if term not in idf:
                    continue
                tf = doc.count(term)
                denom = tf + self.k1 * (1 - self.b + self.b * dl / avg_dl)
                score += idf[term] * (tf * (self.k1 + 1)) / denom
            scores.append(score)

        # Sort descending and return top_k with positive score
        ranked = sorted(zip(scores, chunks), key=lambda x: x[0], reverse=True)
        return [chunk for score, chunk in ranked[:top_k] if score > 0]


# ============================================================================
# RAG ANALYZER
# ============================================================================

class RAGAnalyzer:
    """
    Production RAG pipeline: BM25 Retrieval + Groq LLM Generation.

    Per-request flow (stateless — no global FAISS index to maintain):
      1. Chunk the candidate's resume into overlapping word windows
      2. For each job skill and requirement, BM25-retrieve the most relevant chunks
      3. Deduplicate and assemble a compact context (≤10 chunks)
      4. Inject context into a structured prompt for Groq LLM
      5. Parse and validate the structured JSON response
    """

    def __init__(self, groq_api_key: str):
        if not groq_api_key:
            raise ValueError("Groq API key is required")
        self.client = Groq(api_key=groq_api_key)
        self.retriever = BM25Retriever()
        logger.info("RAGAnalyzer initialised (BM25 + Groq)")

    # ------------------------------------------------------------------
    # CHUNKING
    # ------------------------------------------------------------------

    def _chunk_resume(
        self,
        text: str,
        chunk_size: int = 100,
        overlap: int = 25
    ) -> List[str]:
        """
        Split resume text into overlapping word-level chunks.
        Small chunks (100 words) enable fine-grained BM25 retrieval.
        """
        words = text.split()
        if not words:
            return []
        step = max(chunk_size - overlap, 1)
        return [
            " ".join(words[i: i + chunk_size])
            for i in range(0, len(words), step)
            if words[i: i + chunk_size]
        ]

    # ------------------------------------------------------------------
    # RETRIEVAL
    # ------------------------------------------------------------------

    def _retrieve_context(self, resume_text: str, job: JobModel) -> str:
        """
        BM25 multi-query retrieval:
          - Query per job skill (up to 8)
          - Query per job requirement (up to 8)
          - Fallback query: job title
        Retrieved chunks deduplicated, capped at 10 for prompt efficiency.
        """
        if not resume_text or not resume_text.strip():
            return "[No resume text available for this candidate]"

        chunks = self._chunk_resume(resume_text)
        if not chunks:
            return resume_text[:2000]

        retrieved: dict[str, bool] = {}  # ordered-dict dedup

        queries = (
            list(job.skills[:8])
            + list(job.requirements[:8])
            + [job.title]
        )

        for query in queries:
            for chunk in self.retriever.retrieve(query, chunks, top_k=3):
                retrieved[chunk] = True

        # If BM25 found nothing (no term overlap), fall back gracefully
        if not retrieved:
            return resume_text[:2000]

        return "\n---\n".join(list(retrieved.keys())[:10])

    # ------------------------------------------------------------------
    # PROMPT BUILDING
    # ------------------------------------------------------------------

    def _build_prompt(
        self,
        job: JobModel,
        candidate: CandidateProfile,
        context: str
    ) -> str:
        """Structured RAG prompt with retrieved resume context."""
        skills_str = ", ".join(candidate.skills) if candidate.skills else "Not specified"
        bio_str = candidate.bio or "Not provided"
        req_str = ", ".join(job.requirements[:10]) if job.requirements else "Not specified"
        jskills_str = ", ".join(job.skills[:10]) if job.skills else "Not specified"

        return f"""You are an expert hiring analyst. Using the retrieved resume sections below as your PRIMARY evidence, evaluate the candidate's fit for the role.

## RETRIEVED RESUME SECTIONS (BM25-ranked by relevance to job requirements):
{context}

## CANDIDATE PROFILE:
Skills listed: {skills_str}
Bio: {bio_str}

## ROLE: {job.title} at {job.company_name}
## DESCRIPTION: {job.description[:600]}
## REQUIRED SKILLS: {jskills_str}
## KEY REQUIREMENTS: {req_str}

Base your analysis on evidence from the retrieved sections above.

SCORING GUIDE:
- 85-100: Exceptional — nearly all requirements met with clear evidence
- 70-84: Strong — most requirements met, minor gaps
- 50-69: Moderate — foundational fit, missing specific experience
- <50: Poor — significant skills or experience mismatch

Output ONLY valid JSON (no markdown fences, no extra text):

{{
  "match_score": <integer 0-100>,
  "analysis_report": "STRENGTHS:\\n• <evidence-based strength>\\n• <another strength>\\n\\nIMPROVEMENTS:\\n• <specific gap>\\n• <another gap>",
  "pros": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "cons": ["<gap 1>", "<gap 2>", "<gap 3>"],
  "skill_gaps": ["<missing skill>", "<missing skill>"],
  "interview_questions": ["<targeted question 1>", "<targeted question 2>", "<targeted question 3>"]
}}"""

    # ------------------------------------------------------------------
    # FULL PIPELINE
    # ------------------------------------------------------------------

    def analyze_candidate(
        self,
        application_id: str,
        job: JobModel,
        candidate: CandidateProfile
    ) -> RAGOutput:
        """
        Execute the full RAG pipeline:
          1. RETRIEVE  — BM25 finds the most job-relevant resume chunks
          2. AUGMENT   — Chunks injected into structured prompt
          3. GENERATE  — Groq LLM produces grounded structured analysis
        """
        try:
            # Step 1 — Retrieve
            context = self._retrieve_context(candidate.resume_text, job)

            # Step 2 — Augment
            prompt = self._build_prompt(job, candidate, context)

            # Step 3 — Generate
            response = self.client.chat.completions.create(
                model="llama-3.1-8b-instant",   # fast structured extraction model
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=900,
                response_format={"type": "json_object"}
            )

            response_text = response.choices[0].message.content.strip()

            # Parse JSON
            json_match = re.search(r'\{[\s\S]*\}', response_text)
            if not json_match:
                logger.error(f"No JSON in LLM response for {application_id}")
                return self._default_output()

            result = json.loads(json_match.group())

            # Normalise score
            raw_score = result.get("match_score", 0)
            try:
                score_val = float(raw_score)
                if 0 < score_val <= 1.0:
                    score_val *= 100
                match_score = max(0, min(100, int(round(score_val))))
            except (ValueError, TypeError):
                match_score = 0

            output = RAGOutput(
                match_score=match_score,
                explanation=str(result.get("analysis_report", ""))[:2000],
                pros=list(result.get("pros", []))[:5],
                cons=list(result.get("cons", []))[:5],
                skill_gaps=list(result.get("skill_gaps", []))[:10],
                interview_questions=list(result.get("interview_questions", []))[:4]
            )
            logger.info(
                f"RAG analysis complete for {application_id}: score={output.match_score}"
            )
            return output

        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error for {application_id}: {e}")
            return self._default_output()
        except Exception as e:
            logger.error(f"RAG analysis error for {application_id}: {e}")
            return self._default_output()

    @staticmethod
    def _default_output() -> RAGOutput:
        """Safe fallback when pipeline fails."""
        return RAGOutput(
            match_score=0,
            explanation="Analysis failed. Please try again.",
            pros=[],
            cons=["Unable to process analysis"],
            skill_gaps=[],
            interview_questions=[]
        )


# ============================================================================
# SINGLETON MANAGEMENT
# ============================================================================

_rag_analyzer: Optional[RAGAnalyzer] = None


def initialize_rag(groq_api_key: str) -> RAGAnalyzer:
    """Initialise singleton. Safe to call multiple times."""
    global _rag_analyzer
    if _rag_analyzer is None:
        _rag_analyzer = RAGAnalyzer(groq_api_key=groq_api_key)
        logger.info("RAG system initialised")
    return _rag_analyzer


def get_rag_analyzer() -> RAGAnalyzer:
    """Get singleton — auto-initialises if called before startup completes."""
    global _rag_analyzer
    if _rag_analyzer is None:
        from core.config import settings
        if settings.groq_api_key:
            logger.warning("RAG not initialised at startup — emergency init")
            return initialize_rag(settings.groq_api_key)
        raise RuntimeError("RAG system not initialised and GROQ_API_KEY not found.")
    return _rag_analyzer


# ============================================================================
# ASYNC INTEGRATION (called from backend API)
# ============================================================================

async def analyze_application(
    application_id: str,
    job: JobModel,
    candidate: CandidateProfile
) -> dict:
    """
    Async wrapper for FastAPI integration.
    Groq HTTP call runs in a thread pool — event loop stays unblocked.
    """
    analyzer = get_rag_analyzer()
    output = await asyncio.to_thread(
        analyzer.analyze_candidate, application_id, job, candidate
    )
    return {
        "ai_match_score": output.match_score,
        "ai_explanation": output.explanation,
        "ai_pros": output.pros,
        "ai_cons": output.cons,
        "ai_skill_gaps": output.skill_gaps,
        "ai_interview_questions": output.interview_questions
    }


async def sync_rag_with_db(db) -> int:
    """
    Stateless BM25 mode — no persistent index to sync.
    Retrieval is computed fresh per-request from stored resume_text.
    """
    logger.info("BM25 RAG is stateless — no DB sync required")
    return 0