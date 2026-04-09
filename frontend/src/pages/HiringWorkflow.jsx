import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { api } from "../services/api";
import DashboardLayout from "./components/DashboardLayout";
import AIAnalysisDisplay from "./components/AIAnalysisDisplay";

const HiringWorkflow = () => {
  const { jobId, candidateId } = useParams();
  const navigate = useNavigate();
  const { user, isRecruiter, isAdmin } = useAuth();
  const { success, error, warning } = useNotification();
  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerDetails, setOfferDetails] = useState({
    salary: "",
    startDate: "",
    benefits: "",
  });
  const [interviewDetails, setInterviewDetails] = useState({
    dateTime: "",
    interviewer: "",
    notes: ""
  });
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);

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
    try {
      const appData = await api.applications.get(candidateId);
      setCandidate({
        ...appData,
        name: appData.applicantName || appData.applicant_name || "Candidate",
        email: appData.applicantEmail || appData.applicant_email || "",
        phone: appData.phone || null,
        location: appData.location || null,
        bio: appData.bio || "",
        skills: Array.isArray(appData.skills) ? appData.skills : [],
        matchScore:
          typeof appData.aiMatchScore === "number" ? appData.aiMatchScore : (typeof appData.ai_match_score === "number" ? appData.ai_match_score : 0),
        resumeUrl: appData.resumeUrl || appData.resume_url || null,
        feedbackHistory: Array.isArray(appData.feedbackHistory)
          ? appData.feedbackHistory
          : [],
      });

      // Permission check
      if (isRecruiter && !isAdmin) {
        const userCompany = user?.companyName || "Independent";
        const jobCompany = appData.jobCompany || appData.job_company || "Independent";
        
        if (userCompany !== jobCompany) {
          error("Unauthorized: This application belongs to another company.");
          navigate("/jobs");
        }
      }

      // Fetch audit logs
      try {
        const auditData = await api.audit.get(candidateId);
        setAuditLogs(Array.isArray(auditData) ? auditData : []);
      } catch (err) {
        console.error("Failed to load audit logs", err);
      }
    } catch (err) {
      console.error("Failed to fetch candidate:", err);
      error("Failed to load candidate details");
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = async (newStage, transitionFeedback = "") => {
    const currentIndex = stages.indexOf(candidate.stage);
    const newIndex = stages.indexOf(newStage);

    if (newIndex > currentIndex + 1) {
      warning("Please progress through stages sequentially");
      return;
    }

    try {
      setSubmitting(true);
      await api.applications.transition({
        application_id: candidateId,
        new_stage: newStage,
        feedback: transitionFeedback || feedback || null,
        interview_details: newStage === "interview" ? interviewDetails : null,
        offer_details: newStage === "offer" ? offerDetails : null
      });

      setCandidate((prev) => ({ ...prev, stage: newStage }));
      success(`Candidate moved to ${stageConfig[newStage].label} stage`);
      setFeedback("");
      fetchCandidate();
    } catch (err) {
      error(err.message || "Failed to update stage");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim()) {
      error("Please enter feedback");
      return;
    }

    try {
      setSubmitting(true);
      await api.applications.transition({
        application_id: candidateId,
        new_stage: candidate.stage,
        feedback: feedback,
      });

      setFeedback("");
      success("Feedback submitted successfully");
      fetchCandidate();
    } catch (err) {
      error(err.message || "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOfferSubmit = async () => {
    if (!offerDetails.salary || !offerDetails.startDate) {
      error("Please fill in all required offer details");
      return;
    }

    const offerFeedback = `Offer — Salary: ${offerDetails.salary}, Start Date: ${offerDetails.startDate}${
      offerDetails.benefits ? `. Benefits: ${offerDetails.benefits}` : ""
    }`;

    setShowOfferModal(false);
    await handleStageChange("offer", offerFeedback);
  };

  const handleReject = async () => {
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    try {
      setShowRejectModal(false);
      setSubmitting(true);
      await api.applications.transition({
        application_id: candidateId,
        new_stage: "rejected",
        feedback: "Candidate rejected",
      });
      warning("Candidate rejected");
      navigate(`/jobs/${jobId}/shortlist`);
    } catch (err) {
      error(err.message || "Failed to reject candidate");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInterviewSubmit = async () => {
    if (!interviewDetails.dateTime || !interviewDetails.interviewer) {
      error("Please fill in scheduled time and interviewer name");
      return;
    }

    const interviewFeedback = `Interview scheduled for ${interviewDetails.dateTime} with ${interviewDetails.interviewer}.${
      interviewDetails.notes ? ` Notes: ${interviewDetails.notes}` : ""
    }`;

    await handleStageChange("interview", interviewFeedback);
  };

  const currentStageIndex = candidate ? stages.indexOf(candidate.stage) : 0;
  const resumeFileUrl = candidate?.resumeUrl
    ? `/uploads/${candidate.resumeUrl.replace(/^uploads[\/\\]/, "")}`
    : null;

  return (
    <DashboardLayout 
      title={candidate ? candidate.name : "Candidate Workflow"} 
      subtitle={candidate ? "Hiring workflow and feedback" : "Loading..."}
      loading={loading || submitting}
      loadingMessage={loading ? "Synchronizing Candidate" : "Updating Workflow"}
      loadingSubtext={loading ? "Fetching latest profile and feedback history..." : "Sealing the decision and updating records..."}
    >
      {!candidate && !loading && (
        <div className="relative rounded-xl bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 border border-[#334155]/40 p-12 text-center">
          <p className="text-[#9ca3af]">Candidate not found</p>
        </div>
      )}

      {candidate && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stage Progress */}
          <div className="relative rounded-xl bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 border border-[#334155]/40 overflow-hidden shadow-lg shadow-black/20 p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-[#2563eb]/5 to-transparent" />
            <div className="relative">
              <h2 className="text-lg font-semibold text-[#f8fafc] mb-6">
                Hiring Stage
              </h2>

              <div className="relative">
                <div className="absolute top-6 left-0 right-0 h-1 bg-[#0f172a]">
                  <div
                    className="h-full bg-gradient-to-r from-[#2563eb] to-[#10b981] transition-all duration-500"
                    style={{
                      width: `${
                        (currentStageIndex / (stages.length - 1)) * 100
                      }%`,
                    }}
                  />
                </div>

                <div className="relative flex justify-between">
                  {stages.map((stage, index) => {
                    const config = stageConfig[stage];
                    const isCompleted = index < currentStageIndex;
                    const isCurrent = index === currentStageIndex;
                    const isNext = index === currentStageIndex + 1;

                    return (
                      <div key={stage} className="flex flex-col items-center">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mb-2 transition-all duration-300 ${
                            isCurrent
                              ? "bg-gradient-to-br from-[#2563eb] to-[#3b82f6] shadow-lg shadow-[#2563eb]/30 scale-110"
                              : isCompleted
                              ? "bg-gradient-to-br from-[#10b981] to-[#14b8a6] shadow-lg shadow-[#10b981]/30"
                              : "bg-[#0f172a] border border-[#334155]"
                          } cursor-default`}
                        >
                          {config.icon}
                        </div>
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

          {/* Stage Action Section */}
          <div className="relative rounded-xl bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 border border-[#334155]/40 overflow-hidden shadow-lg shadow-black/20 p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-[#22d3ee]/5 to-transparent" />
            <div className="relative">
              {candidate.stage === "applied" && (
                <>
                  <h2 className="text-lg font-semibold text-[#f8fafc] mb-4">Proceed to Screening</h2>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={3}
                    placeholder="Screening notes (optional)..."
                    className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all resize-none mb-4"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleStageChange("screening", feedback)}
                      disabled={submitting}
                      className="flex-1 px-6 py-2 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-[#f8fafc] font-medium rounded-lg hover:shadow-lg hover:shadow-[#2563eb]/20 transition-all duration-200 hover:scale-[1.02] disabled:opacity-60"
                    >
                      {submitting ? "Processing..." : "Pass to Screening"}
                    </button>
                  </div>
                </>
              )}

              {candidate.stage === "screening" && (
                <>
                  <h2 className="text-lg font-semibold text-[#f8fafc] mb-4">Schedule Interview</h2>
                  <div className="space-y-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-[#e5e7eb] mb-1">Date & Time *</label>
                      <input
                        type="datetime-local"
                        value={interviewDetails.dateTime}
                        onChange={(e) => setInterviewDetails((p) => ({ ...p, dateTime: e.target.value }))}
                        className="w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#e5e7eb] mb-1">Interviewer Name *</label>
                      <input
                        type="text"
                        value={interviewDetails.interviewer}
                        onChange={(e) => setInterviewDetails((p) => ({ ...p, interviewer: e.target.value }))}
                        placeholder="e.g. Jane Doe"
                        className="w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#e5e7eb] mb-1">Interview Notes</label>
                      <textarea
                        value={interviewDetails.notes}
                        onChange={(e) => setInterviewDetails((p) => ({ ...p, notes: e.target.value }))}
                        rows={2}
                        placeholder="Format, links, or specific areas to focus on..."
                        className="w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#2563eb] resize-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleInterviewSubmit}
                      disabled={submitting}
                      className="flex-1 px-6 py-2 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-[#f8fafc] font-medium rounded-lg hover:shadow-lg hover:shadow-[#2563eb]/20 transition-all duration-200 hover:scale-[1.02] disabled:opacity-60"
                    >
                      {submitting ? "Processing..." : "Schedule Interview"}
                    </button>
                  </div>
                </>
              )}

              {candidate.stage === "interview" && (
                <>
                  <h2 className="text-lg font-semibold text-[#f8fafc] mb-4">Extend Offer</h2>
                  <div className="space-y-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-[#e5e7eb] mb-1">Salary Offer *</label>
                      <input
                        type="text"
                        value={offerDetails.salary}
                        onChange={(e) => setOfferDetails((p) => ({ ...p, salary: e.target.value }))}
                        placeholder="e.g., $120,000/year"
                        className="w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#e5e7eb] mb-1">Start Date *</label>
                      <input
                        type="date"
                        value={offerDetails.startDate}
                        onChange={(e) => setOfferDetails((p) => ({ ...p, startDate: e.target.value }))}
                        className="w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#e5e7eb] mb-1">Benefits & Notes</label>
                      <textarea
                        value={offerDetails.benefits}
                        onChange={(e) => setOfferDetails((p) => ({ ...p, benefits: e.target.value }))}
                        rows={2}
                        placeholder="Health insurance, stock options..."
                        className="w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#10b981] resize-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleOfferSubmit}
                      disabled={submitting}
                      className="flex-1 px-6 py-2 bg-gradient-to-r from-[#10b981] to-[#14b8a6] text-[#f8fafc] font-medium rounded-lg hover:shadow-lg hover:shadow-[#10b981]/20 transition-all duration-200 hover:scale-[1.02] disabled:opacity-60"
                    >
                      {submitting ? "Processing..." : "Send Offer"}
                    </button>
                  </div>
                </>
              )}

              {candidate.stage === "offer" && (
                <div className="text-center py-6">
                  <div className="text-4xl mb-4">⌛</div>
                  <h3 className="text-xl font-semibold text-[#f8fafc] mb-2">Awaiting Candidate Response</h3>
                  <p className="text-[#9ca3af]">An offer has been extended to this candidate. They must log in to accept or decline the offer.</p>
                </div>
              )}

              {(candidate.stage === "hired" || candidate.stage === "rejected") && (
                <div className="text-center py-6">
                  <div className="text-4xl mb-4">{candidate.stage === "hired" ? "🎉" : "🛑"}</div>
                  <h3 className="text-xl font-semibold text-[#f8fafc] mb-2">Workflow Completed</h3>
                  <p className="text-[#9ca3af]">This application has reached a terminal state ({candidate.stage}).</p>
                </div>
              )}
            </div>
          </div>

          {/* Feedback History */}
          <div className="relative rounded-xl bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 border border-[#334155]/40 overflow-hidden shadow-lg shadow-black/20 p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/5 to-transparent" />
            <div className="relative">
              <h2 className="text-lg font-semibold text-[#f8fafc] mb-4">
                Feedback History
              </h2>

              {candidate.feedbackHistory && candidate.feedbackHistory.length > 0 ? (
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
                          {item.date
                            ? new Date(item.date).toLocaleDateString()
                            : ""}
                        </span>
                      </div>
                      <p className="text-sm text-[#cbd5e1] mb-2">
                        {typeof item.feedback === "string"
                          ? item.feedback
                          : JSON.stringify(item.feedback)}
                      </p>
                      <p className="text-xs text-[#9ca3af]">
                        By: {item.by || "Recruiter"}
                      </p>
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

          {/* Trust & Audit Logs */}
          <div className="relative rounded-xl bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 border border-[#334155]/40 overflow-hidden shadow-lg shadow-black/20 p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/5 to-transparent" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🔗</span>
                <h2 className="text-lg font-semibold text-[#f8fafc]">
                  Blockchain Audit Trail
                </h2>
              </div>
              
              {auditLogs.length > 0 ? (
                <div className="space-y-3">
                  {auditLogs.map((log, idx) => (
                    <div key={idx} className="p-3 bg-[#0f172a]/60 border border-[#8b5cf6]/20 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-[#c4b5fd]">{log.action || "Decision Logged"}</span>
                        <span className="text-xs text-[#64748b]">
                          {new Date(log.created_at || log.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-2 text-xs font-mono text-[#cbd5e1] break-all bg-[#020617]/50 p-2 rounded">
                        <span className="text-[#8b5cf6]">Hash:</span> {log.decision_hash || log.decisionHash}
                      </div>
                      {log.blockchain_tx && (
                        <div className="mt-1 text-xs font-mono text-[#cbd5e1] break-all bg-[#020617]/50 p-2 rounded">
                          <span className="text-[#10b981]">Tx:</span> {log.blockchain_tx}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#64748b]">No audit logs available for this candidate.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Candidate Info */}
          <div className="relative rounded-xl bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 border border-[#334155]/40 overflow-hidden shadow-lg shadow-black/20 p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-[#2563eb]/5 to-transparent" />
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2563eb] to-[#3b82f6] flex items-center justify-center text-[#f8fafc] font-bold text-2xl mb-4 shadow-lg shadow-[#2563eb]/30">
                {candidate.name.charAt(0).toUpperCase()}
              </div>

              <h3 className="text-lg font-semibold text-[#f8fafc] mb-1">
                {candidate.name}
              </h3>

              <div className="space-y-2 mt-4">
                <div className="flex items-center gap-2 text-sm text-[#cbd5e1]">
                  <span>📧</span>
                  <span className="truncate">{candidate.email}</span>
                </div>
                {candidate.phone && (
                  <div className="flex items-center gap-2 text-sm text-[#cbd5e1]">
                    <span>📱</span>
                    <span>{candidate.phone}</span>
                  </div>
                )}
                {candidate.location && (
                  <div className="flex items-center gap-2 text-sm text-[#cbd5e1]">
                    <span>📍</span>
                    <span>{candidate.location}</span>
                  </div>
                )}
              </div>

              {candidate.bio && (
                <p className="mt-4 text-xs text-[#9ca3af] leading-relaxed">
                  {candidate.bio}
                </p>
              )}

              {/* AI Deep Analysis Section */}
              <div className="mt-6 space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#22d3ee]/20 to-[#2563eb]/10 border border-[#22d3ee]/30 shadow-lg shadow-[#22d3ee]/5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-[#22d3ee] font-bold opacity-80">AI Match Score</p>
                      <p className="text-3xl font-black text-[#f8fafc]">
                        {(() => {
                          const score = candidate.aiMatchScore || candidate.matchScore || 0;
                          return Math.min(100, Math.round(score <= 1 && score > 0 ? score * 100 : score));
                        })()}%
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-full border-2 border-[#22d3ee]/30 flex items-center justify-center text-xl bg-[#0f172a]">
                      🤖
                    </div>
                  </div>
                  
                  {candidate.aiExplanation && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-[#f8fafc] mb-1">AI Matching Insights</p>
                      <div className="text-[11px] text-[#9ca3af] leading-relaxed pl-2">
                        <AIAnalysisDisplay text={candidate.aiExplanation} />
                      </div>
                    </div>
                  )}

                  {/* Suggested Questions (Keep for recruiters) */}
                  {candidate.aiInterviewQuestions && candidate.aiInterviewQuestions.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[#334155]/40">
                      <p className="text-[10px] font-bold text-[#22d3ee] uppercase tracking-tight mb-2">Suggested Interview Questions</p>
                      <div className="space-y-2">
                        {candidate.aiInterviewQuestions.map((q, i) => (
                          <div key={i} className="p-2 bg-[#0f172a]/40 rounded-lg border border-[#334155]/20 text-[10px] text-[#9ca3af] leading-tight">
                            {q}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          {candidate.skills.length > 0 && (
            <div className="relative rounded-xl bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 border border-[#334155]/40 overflow-hidden shadow-lg shadow-black/20 p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/5 to-transparent" />
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
          )}

          {/* Actions */}
          <div className="space-y-3">
            {resumeFileUrl && (
              <a
                href={resumeFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-6 py-3 bg-[#0f172a] border border-[#334155] text-[#e5e7eb] font-medium rounded-lg hover:border-[#475569] hover:bg-[#1e293b] transition-all text-center"
              >
                📄 View Resume
              </a>
            )}

            {/* No Extend Offer button since it's inline now */}

            {candidate.stage !== "hired" && candidate.stage !== "rejected" && candidate.stage !== "offer" && (
              <button
                onClick={handleReject}
                disabled={submitting}
                className="w-full px-6 py-3 bg-[#0f172a] border border-[#b91c1c]/40 text-[#b91c1c] font-medium rounded-lg hover:bg-[#b91c1c]/10 transition-all disabled:opacity-60"
              >
                Reject Candidate
              </button>
            )}

            <button
              onClick={() => navigate(`/jobs/${jobId}/shortlist`)}
              className="w-full px-6 py-3 bg-[#0f172a] border border-[#334155] text-[#9ca3af] font-medium rounded-lg hover:border-[#475569] hover:text-[#e5e7eb] transition-all"
            >
              ← Back to Shortlist
            </button>
          </div>
        </div>
      </div>
      
      {/* Reject Confirmation Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-[#020617]/80 backdrop-blur-sm animate-fade-in" 
            onClick={() => setShowRejectModal(false)}
          />
          <div className="relative w-full max-w-md bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-red-500/20 rounded-2xl shadow-2xl p-8 animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-3xl mb-6 mx-auto">
              🛑
            </div>
            <h3 className="text-xl font-bold text-[#f8fafc] text-center mb-2">
              Reject Candidate?
            </h3>
            <p className="text-[#9ca3af] text-center mb-8">
              Are you sure you want to reject <span className="text-[#f8fafc] font-semibold">{candidate.name}</span>? This action will move them out of the hiring pipeline.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-6 py-3 bg-[#0f172a] border border-[#334155] text-[#9ca3af] font-medium rounded-xl hover:text-[#f8fafc] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-medium rounded-xl shadow-lg shadow-red-600/20 transition-all hover:scale-[1.02]"
              >
                Yes, Reject
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </DashboardLayout>
  );
};

export default HiringWorkflow;
