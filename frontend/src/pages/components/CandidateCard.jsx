import { useNavigate } from "react-router-dom";

const CandidateCard = ({ candidate, jobId, rank }) => {
  const navigate = useNavigate();

  if (!candidate) return null;

  const stageConfig = {
    applied:   { label: "Applied",   color: "#9ca3af", bgColor: "bg-[#475569]/20" },
    screening: { label: "Screening", color: "#22d3ee", bgColor: "bg-[#22d3ee]/10" },
    interview: { label: "Interview", color: "#2563eb", bgColor: "bg-[#2563eb]/10" },
    offer:     { label: "Offer",     color: "#10b981", bgColor: "bg-[#10b981]/10" },
    hired:     { label: "Hired",     color: "#10b981", bgColor: "bg-[#10b981]/10" },
    rejected:  { label: "Rejected",  color: "#64748b", bgColor: "bg-[#64748b]/10" },
  };

  const stage = stageConfig[candidate.stage] || stageConfig.applied;

  // Resolve the actual job ID to use for navigation
  const resolvedJobId = candidate.jobId || jobId;

  // Build resume URL
  const resumeUrl = candidate.resumeUrl
    ? `/uploads/${candidate.resumeUrl.replace(/^uploads[\/\\]/, "")}`
    : null;

  const handleViewDetails = () => {
    if (!resolvedJobId || !candidate._id) return;
    navigate(`/jobs/${resolvedJobId}/candidates/${candidate._id}`);
  };

  const handleViewResume = (e) => {
    if (!resumeUrl) {
      e.preventDefault();
      return;
    }
    window.open(resumeUrl, "_blank", "noopener,noreferrer");
  };

  // Rank Badge Config
  const getRankConfig = (r) => {
    if (!r) return null;
    if (r === 1) return { color: "from-[#f59e0b] to-[#fbbf24]", shadow: "shadow-[#f59e0b]/30", icon: "🏆" };
    if (r === 2) return { color: "from-[#94a3b8] to-[#cbd5e1]", shadow: "shadow-[#94a3b8]/30", icon: "🥈" };
    if (r === 3) return { color: "from-[#b45309] to-[#d97706]", shadow: "shadow-[#b45309]/30", icon: "🥉" };
    return { color: "from-[#1e293b] to-[#334155]", shadow: "shadow-black/20", icon: `#${r}` };
  };

  const rankConfig = getRankConfig(rank);

  return (
    <div className="relative rounded-xl bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 border border-[#334155]/40 overflow-hidden group hover:border-[#475569]/60 transition-all duration-300 shadow-lg shadow-black/20">
      {/* Rank Badge */}
      {rankConfig && (
        <div className={`absolute -left-1 -top-1 z-20 w-10 h-10 rounded-br-2xl bg-gradient-to-br ${rankConfig.color} flex items-center justify-center text-[#f8fafc] font-bold text-xs shadow-lg ${rankConfig.shadow} border-r border-b border-white/10`}>
          {rankConfig.icon}
        </div>
      )}

      {/* Hover glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2563eb] to-[#3b82f6] flex items-center justify-center text-[#f8fafc] font-semibold text-lg shadow-lg shadow-[#2563eb]/20 shrink-0">
              {candidate.name ? candidate.name.charAt(0).toUpperCase() : "?"}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-[#f8fafc] mb-0.5 truncate">
                {candidate.name || "Unknown"}
              </h3>
              <p className="text-sm text-[#9ca3af] truncate">
                {candidate.email || "No email"}
              </p>
              {candidate.location && (
                <p className="text-xs text-[#64748b] mt-0.5">
                  📍 {candidate.location}
                </p>
              )}
            </div>
          </div>
          <span
            className={`px-3 py-1 text-xs font-mono rounded-full ${stage.bgColor} border border-current/30 shrink-0 ml-2`}
            style={{ color: stage.color }}
          >
            {stage.label}
          </span>
        </div>

        {/* AI Match Score */}
        {typeof candidate.matchScore === "number" && candidate.matchScore > 0 && (
          <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-[#0f172a]/60 to-[#1e293b]/40 border border-[#334155]/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#9ca3af] uppercase tracking-wide">
                AI Match Score
              </span>
              <span className="text-sm font-mono font-bold text-[#22d3ee]">
                {Math.min(100, Math.round(candidate.matchScore <= 1 && candidate.matchScore > 0 ? candidate.matchScore * 100 : candidate.matchScore))}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#0f172a] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#2563eb] to-[#22d3ee] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, candidate.matchScore <= 1 && candidate.matchScore > 0 ? candidate.matchScore * 100 : candidate.matchScore)}%` }}
              />
            </div>
          </div>
        )}

        {/* Skills */}
        {Array.isArray(candidate.skills) && candidate.skills.length > 0 && (
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
            onClick={handleViewDetails}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-[#f8fafc] text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-[#2563eb]/20 transition-all duration-200 hover:scale-[1.02]"
          >
            View Details
          </button>
          <button
            onClick={handleViewResume}
            disabled={!resumeUrl}
            className="px-4 py-2 bg-[#0f172a] border border-[#334155] text-[#e5e7eb] text-sm font-medium rounded-lg hover:border-[#475569] hover:bg-[#1e293b] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            title={resumeUrl ? "View Resume" : "No resume available"}
          >
            📄 Resume
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
