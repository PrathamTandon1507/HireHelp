import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useJob } from "../context/JobContext";
import { useNotification } from "../context/NotificationContext";
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

  useEffect(() => {
    const loadJob = async () => {
      await fetchJob(jobId);
      setLoading(false);
      // TODO: Check if user has already applied
      // setHasApplied(check from backend);
    };
    loadJob();
  }, [jobId]);

  const handleApply = async () => {
    setApplying(true);
    const result = await applyToJob(jobId, { userId: user._id });
    setApplying(false);

    if (result.success) {
      success("Application submitted successfully!");
      setHasApplied(true);
    } else {
      error(result.error || "Failed to submit application");
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Job Details" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="text-[#9ca3af] font-mono">Loading job details...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!currentJob) {
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

  return (
    <DashboardLayout title={currentJob.title} subtitle={currentJob.department}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Overview */}
          <div className="relative rounded-xl bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 border border-[#334155]/40 overflow-hidden shadow-lg shadow-black/20 p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-[#2563eb]/5 to-transparent"></div>
            <div className="relative">
              <h2 className="text-lg font-semibold text-[#f8fafc] mb-4">
                About this role
              </h2>
              <p className="text-[#cbd5e1] leading-relaxed whitespace-pre-line">
                {currentJob.description}
              </p>
            </div>
          </div>

          {/* Responsibilities */}
          {currentJob.responsibilities && (
            <div className="relative rounded-xl bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 border border-[#334155]/40 overflow-hidden shadow-lg shadow-black/20 p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-[#22d3ee]/5 to-transparent"></div>
              <div className="relative">
                <h2 className="text-lg font-semibold text-[#f8fafc] mb-4">
                  Responsibilities
                </h2>
                <p className="text-[#cbd5e1] leading-relaxed whitespace-pre-line">
                  {currentJob.responsibilities}
                </p>
              </div>
            </div>
          )}

          {/* Requirements */}
          {currentJob.requirements && (
            <div className="relative rounded-xl bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 border border-[#334155]/40 overflow-hidden shadow-lg shadow-black/20 p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/5 to-transparent"></div>
              <div className="relative">
                <h2 className="text-lg font-semibold text-[#f8fafc] mb-4">
                  Requirements
                </h2>
                <p className="text-[#cbd5e1] leading-relaxed whitespace-pre-line">
                  {currentJob.requirements}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Job Info */}
          <div className="relative rounded-xl bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 border border-[#334155]/40 overflow-hidden shadow-lg shadow-black/20 p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-[#2563eb]/5 to-transparent"></div>
            <div className="relative space-y-4">
              <div>
                <p className="text-xs font-medium text-[#9ca3af] uppercase tracking-wide mb-1">
                  Location
                </p>
                <p className="text-sm text-[#f8fafc]">{currentJob.location}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#9ca3af] uppercase tracking-wide mb-1">
                  Employment Type
                </p>
                <p className="text-sm text-[#f8fafc]">{currentJob.type}</p>
              </div>
              {currentJob.salary && (
                <div>
                  <p className="text-xs font-medium text-[#9ca3af] uppercase tracking-wide mb-1">
                    Salary Range
                  </p>
                  <p className="text-sm text-[#f8fafc]">{currentJob.salary}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-medium text-[#9ca3af] uppercase tracking-wide mb-1">
                  Posted
                </p>
                <p className="text-sm text-[#f8fafc]">
                  {new Date(currentJob.createdAt).toLocaleDateString()}
                </p>
              </div>
              {currentJob.applicants !== undefined && !isApplicant && (
                <div>
                  <p className="text-xs font-medium text-[#9ca3af] uppercase tracking-wide mb-1">
                    Applicants
                  </p>
                  <p className="text-sm font-mono text-[#22d3ee]">
                    {currentJob.applicants}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {isApplicant ? (
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
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/jobs/${jobId}/shortlist`)}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-[#f8fafc] font-medium rounded-lg hover:shadow-lg hover:shadow-[#2563eb]/20 transition-all duration-200 hover:scale-[1.02]"
              >
                View Candidates
              </button>
              <button
                onClick={() => navigate("/jobs")}
                className="w-full px-6 py-3 bg-[#0f172a] border border-[#334155] text-[#e5e7eb] font-medium rounded-lg hover:border-[#475569] hover:bg-[#1e293b] transition-all duration-200"
              >
                Back to Jobs
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JobDetails;
