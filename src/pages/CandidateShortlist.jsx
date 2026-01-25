import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";
import DashboardLayout from "./components/DashboardLayout";
import CandidateCard from "./components/CandidateCard";

const CandidateShortlist = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { success, info } = useNotification();
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);

  useEffect(() => {
    fetchCandidates();
  }, [jobId]);

  const fetchCandidates = async () => {
    setLoading(true);
    // TODO: Fetch from backend
    // const response = await fetch(`/api/jobs/${jobId}/candidates`);

    // Mock data
    setTimeout(() => {
      setCandidates([
        {
          _id: "1",
          name: "Sarah Johnson",
          email: "sarah.j@email.com",
          stage: "applied",
          matchScore: 92,
          skills: ["React", "Node.js", "TypeScript", "MongoDB", "AWS"],
          appliedAt: "2026-01-16T00:00:00Z",
        },
        {
          _id: "2",
          name: "Michael Chen",
          email: "mchen@email.com",
          stage: "applied",
          matchScore: 88,
          skills: ["Python", "Django", "PostgreSQL", "Docker", "Redis"],
          appliedAt: "2026-01-17T00:00:00Z",
        },
        {
          _id: "3",
          name: "Emily Rodriguez",
          email: "emily.r@email.com",
          stage: "applied",
          matchScore: 95,
          skills: [
            "Java",
            "Spring Boot",
            "Kubernetes",
            "GraphQL",
            "Microservices",
          ],
          appliedAt: "2026-01-15T00:00:00Z",
        },
        {
          _id: "4",
          name: "David Kim",
          email: "dkim@email.com",
          stage: "applied",
          matchScore: 85,
          skills: ["JavaScript", "Vue.js", "Express", "MySQL"],
          appliedAt: "2026-01-18T00:00:00Z",
        },
      ]);
      setLoading(false);
    }, 500);
  };

  const handleAIAnalysis = async (candidate) => {
    setAnalyzing(true);
    setSelectedCandidate(candidate);

    // TODO: Call Python ML/RAG service
    // const response = await fetch('/api/ai/analyze-candidate', {
    //   method: 'POST',
    //   body: JSON.stringify({ jobId, candidateId: candidate._id })
    // });

    // Mock AI analysis
    setTimeout(() => {
      setAiInsights({
        summary: `Strong candidate with ${candidate.matchScore}% match to job requirements. Demonstrates solid technical foundation and relevant experience.`,
        strengths: [
          "Extensive experience with required tech stack",
          "Strong problem-solving capabilities",
          "Excellent communication skills based on application",
          "Relevant project experience",
        ],
        skillGaps: [
          {
            skill: "Kubernetes",
            severity: "medium",
            note: "Listed in job requirements but not in resume",
          },
          {
            skill: "CI/CD pipelines",
            severity: "low",
            note: "Would strengthen deployment knowledge",
          },
        ],
        interviewQuestions: [
          "Can you describe your experience building scalable microservices architectures?",
          "Walk me through how you would optimize a slow database query in production.",
          "Tell me about a time you had to debug a complex distributed system issue.",
          "How do you approach code reviews and ensuring code quality in a team?",
          "What strategies do you use for handling technical debt?",
        ],
      });
      setAnalyzing(false);
      success("AI analysis completed!");
    }, 2000);
  };

  const sortedCandidates = [...candidates].sort(
    (a, b) => b.matchScore - a.matchScore,
  );

  return (
    <DashboardLayout
      title="Candidate Shortlist"
      subtitle="AI-powered candidate ranking and insights"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Candidates List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#f8fafc]">
              {candidates.length} Candidates
            </h2>
            <button
              onClick={() =>
                info("AI ranking based on resume-job description similarity")
              }
              className="px-4 py-2 text-sm font-medium text-[#22d3ee] hover:text-[#f8fafc] transition-colors"
            >
              ⓘ How ranking works
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-[#9ca3af] font-mono">
                Loading candidates...
              </div>
            </div>
          ) : sortedCandidates.length === 0 ? (
            <div className="relative rounded-xl bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 border border-[#334155]/40 p-12 text-center">
              <p className="text-[#9ca3af]">No candidates have applied yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedCandidates.map((candidate, index) => (
                <div key={candidate._id} className="relative">
                  {/* Rank Badge */}
                  <div className="absolute -left-3 top-6 z-10 w-8 h-8 rounded-full bg-gradient-to-br from-[#2563eb] to-[#3b82f6] flex items-center justify-center text-[#f8fafc] font-bold text-sm shadow-lg shadow-[#2563eb]/30">
                    {index + 1}
                  </div>
                  <div className="pl-8">
                    <CandidateCard candidate={candidate} jobId={jobId} />
                    <button
                      onClick={() => handleAIAnalysis(candidate)}
                      className="mt-3 w-full px-4 py-2 bg-gradient-to-r from-[#22d3ee] to-[#06b6d4] text-[#f8fafc] text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-[#22d3ee]/20 transition-all duration-200 hover:scale-[1.01]"
                    >
                      🤖 Generate AI Insights
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Insights Panel */}
        <div className="space-y-6">
          {!selectedCandidate ? (
            <div className="relative rounded-xl bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 border border-[#334155]/40 overflow-hidden shadow-lg shadow-black/20 p-8 text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-[#22d3ee]/5 to-transparent"></div>
              <div className="relative">
                <div className="text-5xl mb-4">🤖</div>
                <h3 className="text-lg font-semibold text-[#f8fafc] mb-2">
                  AI Analysis
                </h3>
                <p className="text-sm text-[#9ca3af]">
                  Select a candidate and click "Generate AI Insights" to see
                  detailed analysis
                </p>
              </div>
            </div>
          ) : analyzing ? (
            <div className="relative rounded-xl bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 border border-[#334155]/40 overflow-hidden shadow-lg shadow-black/20 p-8 text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-[#22d3ee]/10 to-transparent animate-pulse"></div>
              <div className="relative">
                <div className="text-5xl mb-4 animate-bounce">🤖</div>
                <h3 className="text-lg font-semibold text-[#f8fafc] mb-2">
                  Analyzing...
                </h3>
                <p className="text-sm text-[#9ca3af] font-mono">
                  Processing resume and generating insights
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="relative rounded-xl bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 border border-[#22d3ee]/40 overflow-hidden shadow-lg shadow-black/20 p-6">
                <div className="absolute inset-0 bg-gradient-to-br from-[#22d3ee]/10 to-transparent"></div>
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">🤖</span>
                    <h3 className="text-base font-semibold text-[#f8fafc]">
                      AI Analysis
                    </h3>
                  </div>
                  <p className="text-sm text-[#cbd5e1] leading-relaxed">
                    {aiInsights?.summary}
                  </p>
                </div>
              </div>

              {/* Strengths */}
              <div className="relative rounded-xl bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 border border-[#10b981]/40 overflow-hidden shadow-lg shadow-black/20 p-6">
                <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/10 to-transparent"></div>
                <div className="relative">
                  <h3 className="text-base font-semibold text-[#f8fafc] mb-3">
                    Key Strengths
                  </h3>
                  <ul className="space-y-2">
                    {aiInsights?.strengths.map((strength, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-sm text-[#cbd5e1]"
                      >
                        <span className="text-[#10b981] mt-0.5">✓</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Skill Gaps */}
              <div className="relative rounded-xl bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 border border-[#f59e0b]/40 overflow-hidden shadow-lg shadow-black/20 p-6">
                <div className="absolute inset-0 bg-gradient-to-br from-[#f59e0b]/10 to-transparent"></div>
                <div className="relative">
                  <h3 className="text-base font-semibold text-[#f8fafc] mb-3">
                    Skill Gaps
                  </h3>
                  <div className="space-y-3">
                    {aiInsights?.skillGaps.map((gap, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-[#0f172a]/60 border border-[#334155]/40"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-[#f8fafc]">
                            {gap.skill}
                          </span>
                          <span
                            className={`text-xs font-mono px-2 py-0.5 rounded ${
                              gap.severity === "high"
                                ? "bg-[#b91c1c]/20 text-[#b91c1c]"
                                : gap.severity === "medium"
                                ? "bg-[#f59e0b]/20 text-[#f59e0b]"
                                : "bg-[#64748b]/20 text-[#64748b]"
                            }`}
                          >
                            {gap.severity}
                          </span>
                        </div>
                        <p className="text-xs text-[#9ca3af]">{gap.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Interview Questions */}
              <div className="relative rounded-xl bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 border border-[#2563eb]/40 overflow-hidden shadow-lg shadow-black/20 p-6">
                <div className="absolute inset-0 bg-gradient-to-br from-[#2563eb]/10 to-transparent"></div>
                <div className="relative">
                  <h3 className="text-base font-semibold text-[#f8fafc] mb-3">
                    Suggested Interview Questions
                  </h3>
                  <ol className="space-y-3">
                    {aiInsights?.interviewQuestions.map((question, idx) => (
                      <li
                        key={idx}
                        className="flex gap-3 text-sm text-[#cbd5e1]"
                      >
                        <span className="text-[#22d3ee] font-mono font-semibold">
                          {idx + 1}.
                        </span>
                        <span>{question}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CandidateShortlist;
