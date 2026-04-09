"""FAISS-based vector store with memoization for resume indexing"""

import logging
from typing import Dict, List
import numpy as np
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)


class FAISSVectorStore:
    """
    Lightweight FAISS vector store with caching.
    Manages resume embeddings and semantic search.
    """
    
    def __init__(self, embedding_model: str = "all-MiniLM-L6-v2"):
        """Initialize with sentence transformer"""
        self.model = SentenceTransformer(embedding_model)
        self.embeddings_cache: Dict[str, np.ndarray] = {}
        self.chunk_cache: Dict[str, List[str]] = {}
        self.index = None
        self.chunk_metadata: List[Dict] = []
        self._indexed_apps = set()  # Track indexed applications
        
    def chunk_text(self, text: str, chunk_size: int = 150, overlap: int = 50) -> List[str]:
        """
        Split text into overlapping granular chunks with memoization.
        Small chunks (150 words) help with targeted retrieval.
        """
        cache_key = f"{hash(text)}_{chunk_size}_{overlap}"
        
        if cache_key in self.chunk_cache:
            return self.chunk_cache[cache_key]
        
        words = text.split()
        chunks = []
        
        for i in range(0, len(words), chunk_size - overlap):
            chunk = " ".join(words[i:i + chunk_size])
            if chunk.strip():
                chunks.append(chunk)
        
        self.chunk_cache[cache_key] = chunks
        return chunks
    
    def add_resume(self, application_id: str, resume_text: str) -> None:
        """
        Index resume by chunking and embedding.
        Prevents duplicate indexing.
        """
        if application_id in self._indexed_apps:
            logger.debug(f"Application {application_id} already indexed, skipping")
            return
        
        if not resume_text or not resume_text.strip():
            logger.warning(f"Empty resume for application {application_id}")
            return
        
        try:
            chunks = self.chunk_text(resume_text)
            embeddings = self.model.encode(chunks, convert_to_numpy=True)
            
            if self.index is None:
                import faiss
                embedding_dim = embeddings.shape[1]
                self.index = faiss.IndexFlatL2(embedding_dim)
            
            self.index.add(embeddings.astype(np.float32))
            
            # Store metadata
            for i, chunk in enumerate(chunks):
                self.chunk_metadata.append({
                    "application_id": application_id,
                    "chunk_idx": i,
                    "text": chunk
                })
            
            self._indexed_apps.add(application_id)
            logger.info(f"Indexed {len(chunks)} chunks for application {application_id}")
            
        except Exception as e:
            logger.error(f"Error indexing resume {application_id}: {e}")
    
    def search(self, query_text: str, top_k: int = 5, application_id: str = None) -> List[str]:
        """
        Semantic search using FAISS.
        Returns top-k most relevant resume chunks, optionally filtered by application_id.
        """
        if self.index is None or len(self.chunk_metadata) == 0:
            return []
        
        try:
            query_embedding = self.model.encode([query_text], convert_to_numpy=True)
            
            # Search for more than top_k to account for filtering
            search_k = top_k * 5 if application_id else top_k
            distances, indices = self.index.search(
                query_embedding.astype(np.float32),
                min(search_k, self.index.ntotal)
            )
            
            results = []
            seen_chunks = set()
            
            for idx in indices[0]:
                if 0 <= idx < len(self.chunk_metadata):
                    meta = self.chunk_metadata[idx]
                    
                    # Filter by application_id if provided
                    if application_id and meta["application_id"] != application_id:
                        continue
                        
                    chunk_text = meta["text"]
                    if chunk_text not in seen_chunks:
                        results.append(chunk_text)
                        seen_chunks.add(chunk_text)
                
                if len(results) >= top_k:
                    break
            
            return results
            
        except Exception as e:
            logger.error(f"Search error: {e}")
            return []
    
    def clear(self) -> None:
        """Reset vector store (for testing/resets)"""
        self.index = None
        self.chunk_metadata = []
        self._indexed_apps.clear()
        self.chunk_cache.clear()
        logger.info("Vector store cleared")