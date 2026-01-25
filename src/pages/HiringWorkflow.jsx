import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";
import DashboardLayout from "./components/DashboardLayout";

const HiringWorkflow = () => {
  const { jobId, candidateId } = useParams();
  const navigate = useNavigate();
  const { success, error, warning } = useNotification();
  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerDetails, setOfferDetails] = useState({
    salary: "",
    startDate: "",
    benefits: "",
  });

  const stages = ["applied", "screening", "interview", "offer", "hired"];

  const stageConfig = {
    applied: { label: "Applied", color: "#9ca3af", icon: "📝" },
    screening: { label: "Screening", color: "#22d3ee", icon: "🔍" },
    interview: { label: "Interview", color: "#2563eb", icon: "💬" },
    offer: { label: "Offer", color: "#10b981", icon: "📄" },
    hired: { label: "Hired", color: "#10b981", icon: "✓" },
  };

  useEffect(() => {
    fetchCandidate();
  }, [candidateId]);

  const fetchCandidate = async () => {
    setLoading(true);
    // TODO: Fetch from backend

    // Mock data
    setTimeout(() => {
      setCandidate({
        _id: candidateId,
        name: "Sarah Johnson",
        email: "sarah.j@email.com",
        phone: "+1 (555) 123-4567",
        stage: "interview",
        matchScore: 92,
        skills: ["React", "Node.js", "TypeScript", "MongoDB", "AWS"],
        appliedAt: "2026-01-16T00:00:00Z",
        resumeUrl: "/resumes/sarah-johnson.pdf",
        feedbackHistory: [
          {
            stage: "screening",
            feedback: "Strong technical background, good culture fit",
            date: "2026-01-17T00:00:00Z",
            by: "John Doe",
          },
          {
            stage: "interview",
            feedback: "Excellent problem-solving skills, communicated well",
            date: "2026-01-20T00:00:00Z",
            by: "Jane Smith",
          },
        ],
      });
      setLoading(false);
    }, 500);
  };

  const handleStageChange = async (newStage) => {
    const currentIndex = stages.indexOf(candidate.stage);
    const newIndex = stages.indexOf(newStage);

    // Validation: can only move forward one stage at a time
    if (newIndex > currentIndex + 1) {
      warning("Please progress through stages sequentially");
      return;
    }

    // TODO: Call backend
    // await fetch(`/api/candidates/${candidateId}/stage`, {
    //   method: 'PUT',
    //   body: JSON.stringify({ stage: newStage })
    // });

    setCandidate((prev) => ({ ...prev, stage: newStage }));
    success(`Candidate moved to ${stageConfig[newStage].label} stage`);
  };

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim()) {
      error("Please enter feedback");
      return;
    }

    // TODO: Submit to backend
    // await fetch(`/api/candidates/${candidateId}/feedback`, {
    //   method: 'POST',
    //   body: JSON.stringify({ stage: candidate.stage, feedback })
    // });

    const newFeedback = {
      stage: candidate.stage,
      feedback,
      date: new Date().toISOString(),
      by: "Current User",
    };

    setCandidate((prev) => ({
      ...prev,
      feedbackHistory: [...(prev.feedbackHistory || []), newFeedback],
    }));

    setFeedback("");
    success("Feedback submitted successfully");
  };

  const handleOfferSubmit = async () => {
    if (!offerDetails.salary || !offerDetails.startDate) {
      error("Please fill in all required offer details");
      return;
    }

    // TODO: Submit offer to backend and blockchain
    // 1. Create offer record
    // 2. Generate cryptographic hash
    // 3. Store hash on blockchain
    // await fetch(`/api/candidates/${candidateId}/offer`, {
    //   method: 'POST',
    //   body: JSON.stringify(offerDetails)
    // });

    // Mock blockchain hash
    const offerHash = "0x" + Math.random().toString(16).substr(2, 64);

    setShowOfferModal(false);
    handleStageChange("offer");
    success(`Offer extended! Audit hash: ${offerHash.substring(0, 12)}...`);

    // Show audit proof
    setTimeout(() => {
      info("Immutable audit record created on blockchain");
    }, 1000);
  };

  const handleReject = async () => {
    if (!window.confirm("Are you sure you want to reject this candidate?"))
      return;

    // TODO: Update backend
    setCandidate((prev) => ({ ...prev, stage: "rejected" }));
    warning("Candidate rejected");
    setTimeout(() => navigate(`/jobs/${jobId}/shortlist`), 1500);
  };

  if (loading) {
    return (
      <DashboardLayout title="Candidate Workflow" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="text-[#9ca3af] font-mono">Loading candidate...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!candidate) {
    return (
      <DashboardLayout
        title="Candidate Not Found"
        subtitle="Unable to load candidate"
      >
        <div className="relative rounded-xl bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 border border-[#334155]/40 p-12 text-center">
          <p className="text-[#9ca3af]">Candidate not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const currentStageIndex = stages.indexOf(candidate.stage);

  return (
    <DashboardLayout
      title={candidate.name}
      subtitle="Hiring workflow and feedback"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stage Progress */}
          <div className="relative rounded-xl bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 border border-[#334155]/40 overflow-hidden shadow-lg shadow-black/20 p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-[#2563eb]/5 to-transparent"></div>
            <div className="relative">
              <h2 className="text-lg font-semibold text-[#f8fafc] mb-6">
                Hiring Stage
              </h2>

              {/* Progress Bar */}
              <div className="relative">
                <div className="absolute top-6 left-0 right-0 h-1 bg-[#0f172a]">
                  <div
                    className="h-full bg-gradient-to-r from-[#2563eb] to-[#10b981] transition-all duration-500"
                    style={{
                      width: `${
                        (currentStageIndex / (stages.length - 1)) * 100
                      }%`,
                    }}
                  ></div>
                </div>

                <div className="relative flex justify-between">
                  {stages.map((stage, index) => {
                    const config = stageConfig[stage];
                    const isCompleted = index < currentStageIndex;
                    const isCurrent = index === currentStageIndex;
                    const isNext = index === currentStageIndex + 1;

                    return (
                      <div key={stage} className="flex flex-col items-center">
                        <button
                          onClick={() => isNext && handleStageChange(stage)}
                          disabled={!isNext}
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mb-2 transition-all duration-300 ${
                            isCurrent
                              ? "bg-gradient-to-br from-[#2563eb] to-[#3b82f6] shadow-lg shadow-[#2563eb]/30 scale-110"
                              : isCompleted
                              ? "bg-gradient-to-br from-[#10b981] to-[#14b8a6] shadow-lg shadow-[#10b981]/30"
                              : "bg-[#0f172a] border border-[#334155]"
                          } ${
                            isNext
                              ? "cursor-pointer hover:scale-105"
                              : "cursor-default"
                          }`}
                        >
                          {config.icon}
                        </button>
                        <span
                          className={`text-xs font-medium ${
                            isCurrent ? "text-[#22d3ee]" : "text-[#9ca3af]"
                          }`}
                        >
                          {config.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Section */}
          <div className="relative rounded-xl bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 border border-[#334155]/40 overflow-hidden shadow-lg shadow-black/20 p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-[#22d3ee]/5 to-transparent"></div>
            <div className="relative">
              <h2 className="text-lg font-semibold text-[#f8fafc] mb-4">
                Add Feedback
              </h2>

              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                placeholder={`Enter feedback for ${
                  stageConfig[candidate.stage].label
                } stage...`}
                className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all resize-none mb-4"
              />

              <button
                onClick={handleFeedbackSubmit}
                className="px-6 py-2 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-[#f8fafc] font-medium rounded-lg hover:shadow-lg hover:shadow-[#2563eb]/20 transition-all duration-200 hover:scale-[1.02]"
              >
                Submit Feedback
              </button>
            </div>
          </div>

          {/* Feedback History */}
          <div className="relative rounded-xl bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 border border-[#334155]/40 overflow-hidden shadow-lg shadow-black/20 p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/5 to-transparent"></div>
            <div className="relative">
              <h2 className="text-lg font-semibold text-[#f8fafc] mb-4">
                Feedback History
              </h2>

              {candidate.feedbackHistory &&
              candidate.feedbackHistory.length > 0 ? (
                <div className="space-y-4">
                  {candidate.feedbackHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg bg-[#0f172a]/60 border border-[#334155]/40"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-[#22d3ee] capitalize">
                          {stageConfig[item.stage]?.label || item.stage}
                        </span>
                        <span className="text-xs text-[#64748b]">
                          {new Date(item.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-[#cbd5e1] mb-2">
                        {item.feedback}
                      </p>
                      <p className="text-xs text-[#9ca3af]">By: {item.by}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#9ca3af]">
                  No feedback recorded yet
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Candidate Info */}
          <div className="relative rounded-xl bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 border border-[#334155]/40 overflow-hidden shadow-lg shadow-black/20 p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-[#2563eb]/5 to-transparent"></div>
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2563eb] to-[#3b82f6] flex items-center justify-center text-[#f8fafc] font-bold text-2xl mb-4 shadow-lg shadow-[#2563eb]/30">
                {candidate.name.charAt(0)}
              </div>

              <h3 className="text-lg font-semibold text-[#f8fafc] mb-1">
                {candidate.name}
              </h3>

              <div className="space-y-2 mt-4">
                <div className="flex items-center gap-2 text-sm text-[#cbd5e1]">
                  <span>📧</span>
                  <span>{candidate.email}</span>
                </div>
                {candidate.phone && (
                  <div className="flex items-center gap-2 text-sm text-[#cbd5e1]">
                    <span>📱</span>
                    <span>{candidate.phone}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 p-3 rounded-lg bg-[#22d3ee]/10 border border-[#22d3ee]/30">
                <p className="text-xs text-[#9ca3af] mb-1">AI Match Score</p>
                <p className="text-2xl font-bold text-[#22d3ee]">
                  {candidate.matchScore}%
                </p>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="relative rounded-xl bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 border border-[#334155]/40 overflow-hidden shadow-lg shadow-black/20 p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/5 to-transparent"></div>
            <div className="relative">
              <h3 className="text-base font-semibold text-[#f8fafc] mb-3">
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 text-xs font-mono text-[#22d3ee] bg-[#0f172a]/60 border border-[#22d3ee]/20 rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {candidate.resumeUrl && (
              <a
                href={candidate.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-6 py-3 bg-[#0f172a] border border-[#334155] text-[#e5e7eb] font-medium rounded-lg hover:border-[#475569] hover:bg-[#1e293b] transition-all text-center"
              >
                📄 View Resume
              </a>
            )}

            {currentStageIndex >= 2 && candidate.stage !== "offer" && (
              <button
                onClick={() => setShowOfferModal(true)}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#10b981] to-[#14b8a6] text-[#f8fafc] font-medium rounded-lg hover:shadow-lg hover:shadow-[#10b981]/20 transition-all duration-200 hover:scale-[1.02]"
              >
                Extend Offer
              </button>
            )}

            <button
              onClick={handleReject}
              className="w-full px-6 py-3 bg-[#0f172a] border border-[#b91c1c]/40 text-[#b91c1c] font-medium rounded-lg hover:bg-[#b91c1c]/10 transition-all"
            >
              Reject Candidate
            </button>
          </div>
        </div>
      </div>

      {/* Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative rounded-xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-[#334155]/40 max-w-lg w-full p-6 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/10 to-transparent rounded-xl"></div>
            <div className="relative">
              <h2 className="text-xl font-semibold text-[#f8fafc] mb-6">
                Extend Job Offer
              </h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[#e5e7eb] mb-2">
                    Salary Offer *
                  </label>
                  <input
                    type="text"
                    value={offerDetails.salary}
                    onChange={(e) =>
                      setOfferDetails((prev) => ({
                        ...prev,
                        salary: e.target.value,
                      }))
                    }
                    placeholder="e.g., $120,000/year"
                    className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#e5e7eb] mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={offerDetails.startDate}
                    onChange={(e) =>
                      setOfferDetails((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#e5e7eb] mb-2">
                    Benefits & Notes
                  </label>
                  <textarea
                    value={offerDetails.benefits}
                    onChange={(e) =>
                      setOfferDetails((prev) => ({
                        ...prev,
                        benefits: e.target.value,
                      }))
                    }
                    rows={3}
                    placeholder="Health insurance, 401k, stock options, etc."
                    className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-all resize-none"
                  />
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#22d3ee]/10 border border-[#22d3ee]/30 mb-6">
                <p className="text-xs text-[#22d3ee] mb-1">
                  🔐 Blockchain Audit
                </p>
                <p className="text-xs text-[#cbd5e1]">
                  An immutable cryptographic hash will be generated and stored
                  on the blockchain for audit purposes.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleOfferSubmit}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#10b981] to-[#14b8a6] text-[#f8fafc] font-medium rounded-lg hover:shadow-lg hover:shadow-[#10b981]/20 transition-all duration-200 hover:scale-[1.02]"
                >
                  Send Offer
                </button>
                <button
                  onClick={() => setShowOfferModal(false)}
                  className="px-6 py-3 bg-[#0f172a] border border-[#334155] text-[#e5e7eb] font-medium rounded-lg hover:border-[#475569] hover:bg-[#1e293b] transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default HiringWorkflow;
