import os
from typing import List, Tuple, Optional
from core.config import settings

class AIService:
    """Lazily-initialized AI service to prevent heavy model loading at import time."""
    
    def __init__(self):
        self._embedding_model = None
        self._chroma_client = None
        self._collection = None

    @property
    def embedding_model(self):
        if self._embedding_model is None:
            from sentence_transformers import SentenceTransformer
            print("Loading embedding model (first-time, may take a moment)...")
            self._embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
            print("Embedding model loaded.")
        return self._embedding_model

    @property
    def collection(self):
        if self._chroma_client is None:
            import chromadb
            self._chroma_client = chromadb.PersistentClient(
                path=settings.chroma_persist_dir
            )
            self._collection = self._chroma_client.get_or_create_collection(
                name="resumes",
                metadata={"hnsw:space": "cosine"}
            )
        return self._collection

    def extract_text_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF file."""
        text = ""
        try:
            import PyPDF2
            with open(file_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                for page in reader.pages:
                    text += page.extract_text() or ""
            print(f"--- AI DEBUG: Extracted {len(text)} chars from PDF {file_path} ---")
        except Exception as e:
            print(f"Error reading PDF: {e}")
        return text

    def extract_text_from_docx(self, file_path: str) -> str:
        """Extract text from DOCX file."""
        text = ""
        try:
            from docx import Document
            doc = Document(file_path)
            for para in doc.paragraphs:
                text += para.text + "\n"
            print(f"--- AI DEBUG: Extracted {len(text)} chars from DOCX {file_path} ---")
        except Exception as e:
            print(f"Error reading DOCX: {e}")
        return text

    def extract_resume_text(self, file_path: str) -> str:
        """Extract text from resume (PDF or DOCX)."""
        if not file_path:
            return ""
        if file_path.endswith('.pdf'):
            return self.extract_text_from_pdf(file_path)
        elif file_path.endswith('.docx'):
            return self.extract_text_from_docx(file_path)
        return ""

    def chunk_text(self, text: str, chunk_size: int = 500) -> List[str]:
        """Split text into chunks."""
        words = text.split()
        chunks = []
        for i in range(0, len(words), chunk_size):
            chunk = " ".join(words[i:i + chunk_size])
            chunks.append(chunk)
        return chunks

    def add_resume_to_vector_db(self, application_id: str, resume_text: str) -> None:
        """Add resume to ChromaDB."""
        try:
            chunks = self.chunk_text(resume_text)
            if not chunks:
                return
            embeddings = self.embedding_model.encode(chunks)
            self.collection.upsert(
                ids=[f"{application_id}_{i}" for i in range(len(chunks))],
                embeddings=embeddings.tolist(),
                documents=chunks,
                metadatas=[{"application_id": application_id, "chunk": i} for i in range(len(chunks))]
            )
        except OSError as e:
            print(f"⚠️ AI Service Warning: Vector DB indexing skipped due to environment error: {e}")
        except Exception as e:
            print(f"⚠️ AI Service Error: Failed to add resume to vector DB: {e}")

    def search_similar_resumes(self, job_description: str, top_k: int = 5) -> List[Tuple[str, float]]:
        """Search for similar resumes based on job description."""
        try:
            query_embedding = self.embedding_model.encode(job_description)
            results = self.collection.query(
                query_embeddings=[query_embedding.tolist()],
                n_results=top_k
            )
            candidates = []
            if results['ids'] and len(results['ids']) > 0:
                for doc_id, distance in zip(results['ids'][0], results['distances'][0]):
                    app_id = doc_id.split('_')[0]
                    score = 1 - (distance / 2)
                    candidates.append((app_id, score))
            return candidates
        except OSError as e:
            print(f"⚠️ AI Service Warning: Search skipped due to environment error: {e}")
            return []
        except Exception as e:
            print(f"⚠️ AI Service Error: Search failed: {e}")
            return []

    def generate_match_explanation(
        self,
        job_description: str,
        resume_text: str
    ) -> Tuple[float, str, List[str], List[str]]:
        """Generate AI-powered match explanation using Groq LLM."""
        try:
            from groq import Groq
            client = Groq(api_key=settings.groq_api_key)
            response = client.chat.completions.create(
                model=settings.groq_model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert recruiter. Evaluate candidate alignment with the job. Focus on strengths and improvements (weaknesses) for the candidate. Respond ONLY with valid JSON."
                    },
                    {
                        "role": "user",
                        "content": f"""Analyze the candidate's resume against the job description.
                        
SCORING SCALE: 0-100 (90+ is perfect, <50 is poor).

Job Description:
{job_description}

Resume:
{resume_text}

Respond with JSON:
{{
    "match_score": 95,
    "explanation": "STRENGTHS:\n• <Strength 1>\n\nIMPROVEMENTS (Focus on weaknesses wrt Job):\n• <Gap 1>\n• <Gap 2>",
    "skill_gaps": ["Skill A", "Skill B"],
    "interview_questions": ["Question 1", "Question 2"]
}}"""
                    }
                ],
                temperature=0.1,
                response_format={"type": "json_object"}
            )
            import json
            import re
            
            content = response.choices[0].message.content.strip() if (response.choices and response.choices[0].message.content) else ""
            
            if not content:
                print("❌ Groq returned empty content.")
                return 0.0, "Analysis currently unavailable.", [], []

            # Extract JSON block
            match = re.search(r'\{[\s\S]*\}', content)
            parse_target = match.group(0) if match else content

            try:
                result = json.loads(parse_target)
            except Exception as e:
                print(f"❌ JSON parse failed: {e}")
                return 0.0, "Analysis synthesis failed. Please retry.", [], []

            raw_score = result.get("match_score", 0.0)
            try:
                # Normalize to 0-100
                score_val = float(raw_score)
                if 0 < score_val <= 1.0:
                    score_val *= 100
                final_score = max(0.0, min(100.0, score_val))
            except:
                final_score = 0.0

            return (
                final_score,
                result.get("explanation", ""),
                result.get("skill_gaps", []),
                result.get("interview_questions", [])
            )
        except Exception as e:
            print(f"Error generating explanation: {e}")
            return 0.0, "Unable to analyze at this time", [], []
        except Exception as e:
            print(f"Error generating explanation: {e}")
            return 0.0, "Unable to analyze at this time", [], []


# Singleton instance — no heavy init at import time
ai_service = AIService()