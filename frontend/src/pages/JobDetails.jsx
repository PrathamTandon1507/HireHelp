import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useJob } from "../context/JobContext";
import { useNotification } from "../context/NotificationContext";
import { api } from "../services/api";
import DashboardLayout from "./components/DashboardLayout";

const JobDetails = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user, isApplicant } = useAuth();
  const { currentJob, fetchJob, applyToJob } = useJob();
  const { success, error } = useNotification();
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationResult, setApplicationResult] = useState(null);
  const [file, setFile] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const canManage = user?.role === "admin" || (user?.role === "recruiter" && user?.companyName === (currentJob?.companyName || currentJob?.company_name || "Independent"));

  useEffect(() => {
    const loadJobAndStatus = async () => {
      setLoading(true);
      await fetchJob(jobId);

      // Check if user has already applied
      if (user && isApplicant) {
        try {
          const myApps = await api.applications.listMine();
          const app = myApps.find(
            (app) => app.jobId === jobId || app.job_id === jobId
          );
          if (app) {
            setHasApplied(true);
            // Fetch full details for the AI insights
            const fullApp = await api.applications.get(app._id || app.id);
            setApplicationResult(fullApp);
          }
        } catch (e) {
          console.error("Failed to check application status:", e);
        }
      }
      setLoading(false);
    };
    loadJobAndStatus();
  }, [jobId, user, isApplicant]);

  const handleApply = async () => {
    // If no file and no saved resume, block
    if (!file && !user?.resumePath) {
      error(
        "No resume found. Please upload a resume or save one to your profile first."
      );
      return;
    }

    setApplying(true);
    // Pass file (null = use profile resume on backend)
    const result = await applyToJob(jobId, file || null);
    setApplying(false);

    if (result.success) {
      success("Application submitted successfully!");
      setHasApplied(true);
      setApplicationResult(result.application);
    } else {
      error(result.error || "Failed to submit application");
    }
  };

  const handleCloseJob = async () => {
    setShowCloseConfirm(true);
  };

  const confirmCloseJob = async () => {
    setShowCloseConfirm(false);
    
    try {
      setApplying(true);
      await api.jobs.update(jobId, { is_active: false });
      await fetchJob(jobId);
      success("Job has been closed successfully.");
    } catch (err) {
      error("Failed to close job.");
    } finally {
      setApplying(false);
    }
  };

  if (!currentJob && !loading) {
    return (
      <DashboardLayout
        title="Job Not Found"
        subtitle="The requested job could not be found"
      >
        <div className="relative rounded-xl bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 border border-[#334155]/40 p-12 text-center">
          <p className="text-[#9ca3af] mb-4">
            This job posting does not exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/jobs")}
            className="px-6 py-2 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-[#f8fafc] font-medium rounded-lg hover:shadow-lg hover:shadow-[#2563eb]/20 transition-all"
          >
            Browse Jobs
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const job = currentJob || {}; 
  const requirementsArray = Array.isArray(job.requirements)
    ? job.requirements
    : typeof job.requirements === "string"
    ? job.requirements.split("\n").filter(Boolean)
    : [];

  return (
    <DashboardLayout 
      title={job.title || "Job Details"} 
      subtitle={
        job.title ? (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-2.5 py-1 bg-[#22d3ee]/10 border border-[#22d3ee]/20 text-[#22d3ee] rounded-lg">
              <span className="text-sm font-semibold tracking-wide">{job.company_name || job.companyName || "Independent"}</span>
            </div>
            <span className="text-[#9ca3af]">•</span>
            <span className="text-[#9ca3af]">{job.department}</span>
            {job.isActive === false && (
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-500 border border-red-500/30 rounded">
                Closed
              </span>
            )}
          </div>
        ) : "Loading..."
      }
      loading={loading}
      loadingMessage="Fetching Position"
      loadingSubtext="Preparing the latest job details for you..."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Overview */}
          <div className="relative rounded-xl bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 border border-[#334155]/40 overflow-hidden shadow-lg shadow-black/20 p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-[#2563eb]/5 to-transparent" />
            <div className="relative">
              <h2 className="text-lg font-semibold text-[#f8fafc] mb-4">
                About this role
              </h2>
              <p className="text-[#cbd5e1] leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </div>
          </div>

          {/* Responsibilities - NEW */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div className="relative rounded-xl bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 border border-[#334155]/40 overflow-hidden shadow-lg shadow-black/20 p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-[#2563eb]/5 to-transparent" />
              <div className="relative">
                <h2 className="text-lg font-semibold text-[#f8fafc] mb-4">
                  Key Responsibilities
                </h2>
                <ul className="space-y-4">
                  {job.responsibilities.map((resp, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-[#cbd5e1] group">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#2563eb]/20 border border-[#2563eb]/40 flex items-center justify-center text-[10px] text-[#22d3ee] font-bold group-hover:bg-[#2563eb]/40 transition-colors">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Requirements */}
          {requirementsArray.length > 0 && (
            <div className="relative rounded-xl bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 border border-[#334155]/40 overflow-hidden shadow-lg shadow-black/20 p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/5 to-transparent" />
              <div className="relative">
                <h2 className="text-lg font-semibold text-[#f8fafc] mb-4">
                  Requirements
                </h2>
                <ul className="space-y-2">
                  {requirementsArray.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-[#cbd5e1]">
                      <span className="text-[#10b981] mt-1">✓</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Technical Skills - NEW */}
          {job.skills && job.skills.length > 0 && (
            <div className="relative rounded-xl bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 border border-[#334155]/40 overflow-hidden shadow-lg shadow-black/20 p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-[#22d3ee]/5 to-transparent" />
              <div className="relative">
                <h2 className="text-lg font-semibold text-[#f8fafc] mb-4">
                  Desired Technical Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, idx) => (
                    <span 
                      key={idx} 
                      className="px-3 py-1.5 bg-[#22d3ee]/10 border border-[#22d3ee]/20 text-[#22d3ee] text-xs font-mono rounded-lg shadow-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Job Info */}
          <div className="relative rounded-xl bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 border border-[#334155]/40 overflow-hidden shadow-lg shadow-black/20 p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-[#2563eb]/5 to-transparent" />
            <div className="relative space-y-4">
              <div>
                <p className="text-xs font-medium text-[#9ca3af] uppercase tracking-wide mb-1">
                  Location
                </p>
                <p className="text-sm text-[#f8fafc]">{job.location}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#9ca3af] uppercase tracking-wide mb-1">
                  Employment Type
                </p>
                <p className="text-sm text-[#f8fafc]">{job.type}</p>
              </div>
              {job.salary && (
                <div>
                  <p className="text-xs font-medium text-[#9ca3af] uppercase tracking-wide mb-1">
                    Salary Range
                  </p>
                  <p className="text-sm text-[#f8fafc]">{job.salary}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-medium text-[#9ca3af] uppercase tracking-wide mb-1">
                  Posted
                </p>
                <p className="text-sm text-[#f8fafc]">
                  {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          {isApplicant ? (
            <div className="space-y-4">
              {!hasApplied && (
                <>
                  {/* Default resume banner */}
                  {user?.resumePath && !showUpload && (
                    <div className="p-4 rounded-lg bg-[#10b981]/10 border border-[#10b981]/30">
                      <div className="flex items-start gap-3">
                        <span className="text-xl">📄</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#10b981] mb-0.5">
                            Saved resume will be used
                          </p>
                          <p className="text-xs text-[#9ca3af]">
                            {user.resumePath.split("/").pop()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowUpload(true)}
                        className="mt-3 text-xs text-[#22d3ee] hover:underline"
                      >
                        Use a different resume for this job →
                      </button>
                    </div>
                  )}

                  {/* Upload section (shown when no default resume or user wants to upload) */}
                  {(!user?.resumePath || showUpload) && (
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-[#9ca3af] uppercase tracking-wide">
                        {user?.resumePath
                          ? "Upload Different Resume (optional)"
                          : "Upload Resume (PDF/DOCX) *"}
                      </label>
                      <div className="relative group">
                        <input
                          type="file"
                          accept=".pdf,.docx"
                          onChange={(e) => setFile(e.target.files[0])}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div
                          className={`px-4 py-3 rounded-lg bg-[#0f172a] border ${
                            file ? "border-[#10b981]/50" : "border-[#334155]"
                          } group-hover:border-[#475569] transition-all flex items-center justify-between`}
                        >
                          <span
                            className={`text-sm ${
                              file ? "text-[#f8fafc]" : "text-[#64748b]"
                            }`}
                          >
                            {file ? file.name : "Choose file..."}
                          </span>
                          <span className="text-lg">
                            {file ? "📄" : "📁"}
                          </span>
                        </div>
                      </div>
                      {showUpload && user?.resumePath && (
                        <button
                          onClick={() => {
                            setShowUpload(false);
                            setFile(null);
                          }}
                          className="text-xs text-[#64748b] hover:text-[#9ca3af]"
                        >
                          ← Use saved resume instead
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}

              <button
                onClick={handleApply}
                disabled={applying || hasApplied}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#10b981] to-[#14b8a6] text-[#f8fafc] font-medium rounded-lg hover:shadow-lg hover:shadow-[#10b981]/20 transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {hasApplied
                  ? "Applied ✓"
                  : applying
                  ? "Submitting..."
                  : "Apply Now"}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {canManage && (
                <>
                  <button
                    onClick={() => navigate(`/jobs/${jobId}/shortlist`)}
                    className="w-full px-6 py-3 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-[#f8fafc] font-medium rounded-lg hover:shadow-lg hover:shadow-[#2563eb]/20 transition-all duration-200 hover:scale-[1.02]"
                  >
                    View Candidates
                  </button>
                  {job.isActive !== false && (
                    <button
                      onClick={handleCloseJob}
                      disabled={applying}
                      className="w-full px-6 py-3 border border-red-500/40 text-red-500 font-medium rounded-lg hover:bg-red-500/10 transition-all duration-200 hover:scale-[1.02] disabled:opacity-50"
                    >
                      {applying ? "Closing..." : "Close Job Posting"}
                    </button>
                  )}
                  {job.isActive === false && (
                    <div className="w-full px-6 py-3 bg-red-500/5 border border-red-500/20 text-red-500/60 font-medium rounded-lg text-center text-sm">
                      Job Already Closed
                    </div>
                  )}
                </>
              )}
              <button
                onClick={() => navigate("/jobs")}
                className="w-full px-6 py-3 bg-[#0f172a] border border-[#334155] text-[#e5e7eb] font-medium rounded-lg hover:border-[#475569] hover:bg-[#1e293b] transition-all duration-200"
              >
                Back to Jobs
              </button>
            </div>
          )}

          {/* AI Matching Insights (Relocated to Sidebar) */}
          {hasApplied && applicationResult && (
            <div className="relative rounded-xl bg-gradient-to-br from-[#1e293b]/95 to-[#0f172a]/90 border border-[#22d3ee]/30 overflow-hidden shadow-[0_0_25px_rgba(34,211,238,0.1)] p-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-[#22d3ee]/5 to-transparent" />
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-[#f8fafc]">Your AI Match</h3>
                  <div className="px-3 py-1 bg-[#22d3ee]/10 border border-[#22d3ee]/30 text-[#22d3ee] text-xs font-bold rounded-full">
                    {Math.round(applicationResult.aiMatchScore || 0)}%
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Score Visualization */}
                  <div className="relative h-2 bg-[#334155] rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#2563eb] to-[#22d3ee] transition-all duration-1000 ease-out"
                      style={{ width: `${applicationResult.aiMatchScore || 0}%` }}
                    />
                  </div>

                  {/* Summary */}
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#22d3ee]/20 to-[#2563eb]/20 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    <div className="relative text-xs text-[#cbd5e1] leading-relaxed border-l-2 border-[#22d3ee] pl-4 py-1 whitespace-pre-wrap italic">
                      {applicationResult.aiExplanation || "Analysis complete. Review your alignment below."}
                    </div>
                  </div>

                  {/* Growth Areas (Weaknesses) - Enhanced Premium Look */}
                  {applicationResult.aiCons?.length > 0 && (
                    <div className="relative rounded-xl bg-red-500/5 border border-red-500/20 p-4 overflow-hidden group">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-full blur-2xl -mr-8 -mt-8"></div>
                      <h4 className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                        Critical Growth Areas
                      </h4>
                      <div className="space-y-3">
                        {applicationResult.aiCons.map((con, i) => (
                          <div key={i} className="flex gap-3 text-[11px] text-[#cbd5e1] items-start group/item">
                            <span className="text-red-400/50 mt-0.5 group-hover/item:text-red-400 transition-colors">→</span>
                            <span className="leading-relaxed">{con}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing Skills - Tag Cloud Style */}
                  {applicationResult.aiSkillGaps?.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-bold text-[#f59e0b] uppercase tracking-widest pl-1">Missing Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {applicationResult.aiSkillGaps.map((skill, i) => (
                          <div 
                            key={i} 
                            className="px-2.5 py-1 bg-gradient-to-br from-[#f59e0b]/10 to-[#b45309]/10 border border-[#f59e0b]/20 text-[#fbbf24] text-[10px] font-mono rounded-md shadow-sm hover:border-[#f59e0b]/40 transition-colors"
                          >
                            {skill}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pros - Refined Minimalist Look */}
                  {applicationResult.aiPros?.length > 0 && (
                    <div className="pt-2 border-t border-[#334155]/50">
                      <h4 className="text-[10px] font-bold text-[#10b981] uppercase tracking-widest mb-3 pl-1">Key Strengths</h4>
                      <div className="grid grid-cols-1 gap-2.5">
                        {applicationResult.aiPros.map((pro, i) => (
                          <div key={i} className="flex gap-3 text-[11px] text-[#9ca3af] items-start hover:text-[#cbd5e1] transition-colors">
                            <div className="mt-1 w-1 h-1 rounded-full bg-[#10b981]"></div>
                            <span className="leading-snug">{pro}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showCloseConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-[#020617]/80 backdrop-blur-sm"
            onClick={() => setShowCloseConfirm(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-[#334155] shadow-2xl p-6 overflow-hidden">
            <div className="absolute top-0 right-0 p-8 bg-red-500/10 rounded-full blur-3xl -mr-4 -mt-4" />
            
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-2xl mb-4">
                ⚠️
              </div>
              <h3 className="text-xl font-bold text-[#f8fafc] mb-2">Close Job Posting?</h3>
              <p className="text-[#9ca3af] text-sm leading-relaxed mb-6">
                Are you sure you want to close this job posting? No new applications will be accepted once closed. This action is permanent.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCloseConfirm(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-[#0f172a] border border-[#334155] text-[#e5e7eb] font-medium hover:bg-[#1e293b] transition-all"
                >
                   Keep Active
                </button>
                <button
                  onClick={confirmCloseJob}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all"
                >
                  Confirm Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default JobDetails;
