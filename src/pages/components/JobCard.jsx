import { useNavigate } from "react-router-dom";

const JobCard = ({ job, showActions = false, actionType = "view" }) => {
  const navigate = useNavigate();

  // Safety check
  if (!job) {
    return null;
  }

  const statusConfig = {
    active: {
      label: "Active",
      color: "#10b981",
      bgColor: "bg-[#10b981]/10",
      borderColor: "border-[#10b981]/30",
    },
    closed: {
      label: "Closed",
      color: "#64748b",
      bgColor: "bg-[#64748b]/10",
      borderColor: "border-[#64748b]/30",
    },
    draft: {
      label: "Draft",
      color: "#f59e0b",
      bgColor: "bg-[#f59e0b]/10",
      borderColor: "border-[#f59e0b]/30",
    },
  };

  const status = statusConfig[job.status] || statusConfig.active;

  return (
    <div className="relative rounded-xl bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 border border-[#334155]/40 overflow-hidden group hover:border-[#475569]/60 transition-all duration-300 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30">
      {/* Hover glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2563eb]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Content */}
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[#f8fafc] mb-2 group-hover:text-[#22d3ee] transition-colors">
              {job.title || "Untitled Position"}
            </h3>
            <p className="text-sm text-[#9ca3af] mb-3">
              {job.department || "No department"}
            </p>
          </div>
          <span
            className={`px-3 py-1 text-xs font-mono rounded-full ${status.bgColor} ${status.borderColor} border`}
            style={{ color: status.color }}
          >
            {status.label}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-[#cbd5e1] line-clamp-2 mb-4">
          {job.description || "No description available"}
        </p>

        {/* Meta Info */}
        <div className="flex flex-wrap gap-4 mb-4 pb-4 border-b border-[#334155]/30">
          {job.location && (
            <div className="flex items-center gap-2">
              <span className="text-[#22d3ee]">📍</span>
              <span className="text-xs text-[#9ca3af]">{job.location}</span>
            </div>
          )}
          {job.type && (
            <div className="flex items-center gap-2">
              <span className="text-[#22d3ee]">💼</span>
              <span className="text-xs text-[#9ca3af]">{job.type}</span>
            </div>
          )}
          {job.applicants !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-[#22d3ee]">👥</span>
              <span className="text-xs font-mono text-[#9ca3af]">
                {job.applicants} applicants
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2">
            {actionType === "view" && (
              <>
                <button
                  onClick={() => navigate(`/jobs/${job._id}`)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-[#f8fafc] text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-[#2563eb]/20 transition-all duration-200 hover:scale-[1.02]"
                >
                  View Details
                </button>
                <button
                  onClick={() => navigate(`/jobs/${job._id}/shortlist`)}
                  className="px-4 py-2 bg-[#0f172a] border border-[#334155] text-[#e5e7eb] text-sm font-medium rounded-lg hover:border-[#475569] hover:bg-[#1e293b] transition-all duration-200"
                >
                  Shortlist
                </button>
              </>
            )}
            {actionType === "apply" && (
              <button
                onClick={() => navigate(`/jobs/${job._id}`)}
                className="w-full px-4 py-2 bg-gradient-to-r from-[#10b981] to-[#14b8a6] text-[#f8fafc] text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-[#10b981]/20 transition-all duration-200 hover:scale-[1.02]"
              >
                Apply Now
              </button>
            )}
            {actionType === "status" && job.applicationStatus && (
              <div className="w-full px-4 py-2 bg-[#0f172a]/60 border border-[#334155]/40 rounded-lg">
                <p className="text-xs text-[#9ca3af] mb-1">Status</p>
                <p className="text-sm font-medium text-[#22d3ee] capitalize">
                  {job.applicationStatus}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Posted Date */}
        {job.createdAt && (
          <p className="text-xs font-mono text-[#64748b] mt-4">
            Posted {new Date(job.createdAt).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#2563eb] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  );
};

export default JobCard;
