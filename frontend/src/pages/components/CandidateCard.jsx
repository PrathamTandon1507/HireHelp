import { useNavigate } from "react-router-dom";

const CandidateCard = ({ candidate, jobId }) => {
  const navigate = useNavigate();

  // Safety check
  if (!candidate) {
    return null;
  }

  const stageConfig = {
    applied: { label: "Applied", color: "#9ca3af", bgColor: "bg-[#475569]/20" },
    screening: {
      label: "Screening",
      color: "#22d3ee",
      bgColor: "bg-[#22d3ee]/10",
    },
    interview: {
      label: "Interview",
      color: "#2563eb",
      bgColor: "bg-[#2563eb]/10",
    },
    offer: { label: "Offer", color: "#10b981", bgColor: "bg-[#10b981]/10" },
    rejected: {
      label: "Rejected",
      color: "#64748b",
      bgColor: "bg-[#64748b]/10",
    },
  };

  const stage = stageConfig[candidate.stage] || stageConfig.applied;

  return (
    <div className="relative rounded-xl bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 border border-[#334155]/40 overflow-hidden group hover:border-[#475569]/60 transition-all duration-300 shadow-lg shadow-black/20">
      {/* Hover effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover: opacity-100 transition-opacity duration-300"></div>

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2563eb] to-[#3b82f6] flex items-center justify-center text-[#f8fafc] font-semibold text-lg shadow-lg shadow-[#2563eb]/20">
              {candidate.name ? candidate.name.charAt(0).toUpperCase() : "? "}
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#f8fafc] mb-1">
                {candidate.name || "Unknown"}
              </h3>
              <p className="text-sm text-[#9ca3af]">
                {candidate.email || "No email"}
              </p>
            </div>
          </div>
          <span
            className={`px-3 py-1 text-xs font-mono rounded-full ${stage.bgColor} border border-current/30`}
            style={{ color: stage.color }}
          >
            {stage.label}
          </span>
        </div>

        {/* Match Score (if available) */}
        {candidate.matchScore && (
          <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-[#0f172a]/60 to-[#1e293b]/40 border border-[#334155]/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#9ca3af] uppercase tracking-wide">
                AI Match Score
              </span>
              <span className="text-sm font-mono font-bold text-[#22d3ee]">
                {candidate.matchScore}%
              </span>
            </div>
            <div className="w-full h-1. 5 bg-[#0f172a] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#2563eb] to-[#22d3ee] rounded-full transition-all duration-500"
                style={{ width: `${candidate.matchScore}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Skills */}
        {candidate.skills && candidate.skills.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-[#9ca3af] uppercase tracking-wide mb-2">
              Key Skills
            </p>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.slice(0, 4).map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 text-xs font-mono text-[#22d3ee] bg-[#0f172a]/60 border border-[#22d3ee]/20 rounded"
                >
                  {skill}
                </span>
              ))}
              {candidate.skills.length > 4 && (
                <span className="px-2 py-1 text-xs text-[#64748b]">
                  +{candidate.skills.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-[#334155]/30">
          <button
            onClick={() =>
              navigate(`/jobs/${jobId}/candidates/${candidate._id}`)
            }
            className="flex-1 px-4 py-2 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-[#f8fafc] text-sm font-medium rounded-lg hover:shadow-lg hover: shadow-[#2563eb]/20 transition-all duration-200 hover:scale-[1.02]"
          >
            View Details
          </button>
          <button className="px-4 py-2 bg-[#0f172a] border border-[#334155] text-[#e5e7eb] text-sm font-medium rounded-lg hover:border-[#475569] hover: bg-[#1e293b] transition-all duration-200">
            Resume
          </button>
        </div>

        {/* Applied date */}
        {candidate.appliedAt && (
          <p className="text-xs font-mono text-[#64748b] mt-3">
            Applied {new Date(candidate.appliedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default CandidateCard;
