"""Data models for RAG system"""

from dataclasses import dataclass
from typing import List


@dataclass
class JobModel:
    """Job posting model"""
    job_id: str
    title: str
    description: str
    company_name: str
    requirements: List[str]
    skills: List[str]


@dataclass
class CandidateProfile:
    """Candidate profile model"""
    application_id: str
    resume_text: str
    bio: str
    skills: List[str]


@dataclass
class RAGOutput:
    """Structured RAG analysis output"""
    match_score: int
    explanation: str
    pros: List[str]
    cons: List[str]
    skill_gaps: List[str]
    interview_questions: List[str]