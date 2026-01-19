const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  accentColor = "#2563eb",
}) => {
  const gradientFrom =
    accentColor === "#10b981"
      ? "from-[#10b981]/10"
      : accentColor === "#22d3ee"
      ? "from-[#22d3ee]/10"
      : accentColor === "#f59e0b"
      ? "from-[#f59e0b]/10"
      : "from-[#2563eb]/10";

  const borderColor =
    accentColor === "#10b981"
      ? "border-[#10b981]/30"
      : accentColor === "#22d3ee"
      ? "border-[#22d3ee]/30"
      : accentColor === "#f59e0b"
      ? "border-[#f59e0b]/30"
      : "border-[#2563eb]/30";

  return (
    <div
      className={`relative rounded-xl bg-gradient-to-br ${gradientFrom} to-[#0f172a]/60 border ${borderColor} overflow-hidden group hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-black/20`}
    >
      {/* Inner glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Content */}
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-xs font-medium text-[#9ca3af] uppercase tracking-wide mb-2">
              {title || "Metric"}
            </p>
            <p className="text-3xl font-bold text-[#f8fafc] mb-1">
              {value !== undefined ? value : "—"}
            </p>
            {subtitle && <p className="text-sm text-[#64748b]">{subtitle}</p>}
          </div>
          {icon && (
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-[#334155]/40 flex items-center justify-center text-xl shadow-inner">
              {icon}
            </div>
          )}
        </div>

        {trend && (
          <div className="flex items-center gap-2 pt-4 border-t border-[#334155]/30">
            <span
              className={`text-xs font-mono ${
                trend.positive ? "text-[#10b981]" : "text-[#f59e0b]"
              }`}
            >
              {trend.positive ? "↗" : "↘"} {trend.value}
            </span>
            <span className="text-xs text-[#64748b]">{trend.label}</span>
          </div>
        )}
      </div>

      {/* Subtle animated accent */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-50"
        style={{ color: accentColor }}
      ></div>
    </div>
  );
};

export default StatCard;
