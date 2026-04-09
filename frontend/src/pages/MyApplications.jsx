import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "./components/DashboardLayout";
import { api } from "../services/api";

const MyApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [detailedAppData, setDetailedAppData] = useState({});
  const [fetchingDetails, setFetchingDetails] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await api.applications.listMine();
      setApplications(data);
    } catch (error) {
      console.error("Failed to fetch applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = async (appId) => {
    if (expandedId === appId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(appId);
    
    // Fetch details if not already loaded
    if (!detailedAppData[appId]) {
      try {
        setFetchingDetails(true);
        const details = await api.applications.get(appId);
        setDetailedAppData(prev => ({ ...prev, [appId]: details }));
      } catch (error) {
        console.error("Failed to fetch application details:", error);
      } finally {
        setFetchingDetails(false);
      }
    }
  };

  const filteredApps = applications.filter(app => {
    if (filter === "all") return true;
    if (filter === "active") return ["applied", "screening", "interview", "offer"].includes(app.stage);
    return app.stage === filter;
  });

  const getStageColor = (stage) => {
    switch (stage) {
      case "applied": return "text-[#9ca3af] bg-[#9ca3af]/10 border-[#334155]";
      case "screening": return "text-[#22d3ee] bg-[#22d3ee]/10 border-[#22d3ee]/30";
      case "interview": return "text-[#2563eb] bg-[#2563eb]/10 border-[#2563eb]/30";
      case "offer": return "text-[#10b981] bg-[#10b981]/10 border-[#10b981]/30 animate-pulse";
      case "accepted": return "text-[#10b981] bg-[#10b981]/10 border-[#10b981]/30";
      case "rejected": return "text-red-500 bg-red-500/10 border-red-500/30";
      default: return "text-[#9ca3af] bg-[#0f172a] border-[#334155]";
    }
  };

  return (
    <DashboardLayout 
      title="My Applications" 
      subtitle={`Tracking ${applications.length} applications across your career journey`}
      loading={loading}
      loadingMessage="Synchronizing Applications"
      loadingSubtext="Fetching your latest application statuses and AI matching data..."
    >
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full lg:w-64 space-y-4">
          <div className="p-6 rounded-xl bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 border border-[#334155]/40 shadow-lg shadow-black/20">
            <h3 className="text-sm font-semibold text-[#f8fafc] mb-4 uppercase tracking-wider">Status Filter</h3>
            <div className="space-y-2">
              {["all", "active", "applied", "interview", "offer", "rejected"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`w-full px-4 py-2 text-left text-sm rounded-lg transition-all ${
                    filter === f 
                      ? "bg-[#2563eb] text-white shadow-lg shadow-[#2563eb]/20 font-semibold" 
                      : "text-[#9ca3af] hover:bg-[#1e293b] hover:text-[#f8fafc]"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-4 py-2 text-sm text-[#9ca3af] hover:text-[#22d3ee] transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Applications List */}
        <div className="flex-1 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-[#9ca3af] font-mono animate-pulse">Loading all applications...</div>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="p-12 text-center rounded-xl bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 border border-[#334155]/40">
              <p className="text-[#9ca3af]">No applications found for this filter.</p>
            </div>
          ) : (
            filteredApps.map((app) => (
              <div 
                key={app._id}
                className={`relative group rounded-xl bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 border ${expandedId === app._id ? 'border-[#22d3ee]/50 shadow-[#22d3ee]/10' : 'border-[#334155]/40'} p-6 shadow-lg shadow-black/10 transition-all duration-300`}
              >
                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-[#f8fafc] group-hover:text-[#22d3ee] transition-colors">
                        {app.title}
                      </h3>
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${getStageColor(app.stage)}`}>
                        {app.stage}
                      </span>
                      {app.aiMatchScore > 0 && (
                        <span className="px-2 py-0.5 bg-[#22d3ee]/10 border border-[#22d3ee]/30 text-[#22d3ee] text-[10px] font-bold rounded">
                          {Math.min(100, Math.round(app.aiMatchScore <= 1 ? app.aiMatchScore * 100 : app.aiMatchScore))}% Match
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[#9ca3af]">
                      <span>🏢 {app.company || "Independent"}</span>
                      <span>📍 {app.location}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <button
                      onClick={() => toggleExpand(app._id)}
                      className="px-5 py-2.5 bg-[#0f172a] border border-[#334155] text-[#cbd5e1] text-sm font-medium rounded-lg hover:border-[#22d3ee]/50 transition-all"
                    >
                      {expandedId === app._id ? "Close Insights" : "AI Insights"}
                    </button>
                    {app.stage === "offer" && (
                      <button
                        onClick={() => navigate(`/applications/${app._id}/offer`)}
                        className="px-5 py-2.5 bg-gradient-to-r from-[#10b981] to-[#059669] text-white text-sm font-bold rounded-lg hover:shadow-lg hover:shadow-[#10b981]/30 transition-all hover:scale-105"
                      >
                        Review Offer
                      </button>
                    )}
                  </div>
                </div>

                {/* AI Insights Panel */}
                {expandedId === app._id && (
                  <div className="mt-8 pt-6 border-t border-[#334155]/60 animate-in fade-in slide-in-from-top-4 duration-300">
                    {fetchingDetails ? (
                      <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <div className="w-8 h-8 border-4 border-[#22d3ee]/20 border-t-[#22d3ee] rounded-full animate-spin"></div>
                        <p className="text-sm font-mono text-[#9ca3af]">Retrieving AI matching data...</p>
                      </div>
                    ) : detailedAppData[app._id] ? (
                      <div className="space-y-8">
                        {/* Summary & Match */}
                        <div className="space-y-6">
                          <div className="relative group p-6 rounded-xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-[#22d3ee]/20 overflow-hidden shadow-xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#22d3ee]/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[#22d3ee]/10 transition-colors duration-700"></div>
                            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                              <div>
                                <h4 className="text-xs font-black text-[#22d3ee] uppercase tracking-[0.3em] mb-1">AI Matching Report</h4>
                                <p className="text-[10px] text-[#64748b]">Real-time compatibility analysis</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-4xl font-black text-[#f8fafc]">
                                  {Math.min(100, Math.round(detailedAppData[app._id].aiMatchScore <= 1 && detailedAppData[app._id].aiMatchScore > 0 ? detailedAppData[app._id].aiMatchScore * 100 : (detailedAppData[app._id].aiMatchScore || 0)))}%
                                </div>
                                <div className="w-px h-8 bg-[#334155]"></div>
                                <div className="text-[10px] font-bold text-[#9ca3af] uppercase vertical-text">Match</div>
                              </div>
                            </div>
                            <div className="relative text-sm text-[#cbd5e1] leading-relaxed border-l-2 border-[#22d3ee] pl-6 whitespace-pre-wrap italic">
                              {detailedAppData[app._id].aiExplanation || "Analysis complete. Review your alignment below."}
                            </div>
                          </div>

                          {detailedAppData[app._id].aiSkillGaps?.length > 0 && (
                            <div className="space-y-3">
                              <h4 className="text-[10px] font-bold text-[#f59e0b] uppercase tracking-widest pl-1">Target Development Skills</h4>
                              <div className="flex flex-wrap gap-2">
                                {detailedAppData[app._id].aiSkillGaps.map((skill, i) => (
                                  <span key={i} className="px-3 py-1 bg-[#f59e0b]/10 border border-[#f59e0b]/20 text-[#fbbf24] text-[10px] font-mono rounded-lg shadow-sm">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Pros & Cons Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                          {detailedAppData[app._id].aiPros?.length > 0 && (
                            <div className="space-y-4">
                              <h4 className="text-[10px] font-bold text-[#10b981] uppercase tracking-[0.2em] flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-[#10b981]"></span>
                                Competitive Advantages
                              </h4>
                              <div className="space-y-3">
                                {detailedAppData[app._id].aiPros.map((pro, i) => (
                                  <div key={i} className="flex gap-3 text-sm text-[#cbd5e1] items-start group">
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full border border-[#10b981] group-hover:bg-[#10b981] transition-all"></div>
                                    <span className="leading-relaxed group-hover:text-[#f8fafc] transition-colors">{pro}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {detailedAppData[app._id].aiCons?.length > 0 && (
                            <div className="space-y-4">
                              <h4 className="text-[10px] font-bold text-red-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-red-400 animate-pulse"></span>
                                Strategic Improvements
                              </h4>
                              <div className="space-y-3">
                                {detailedAppData[app._id].aiCons.map((con, i) => (
                                  <div key={i} className="flex gap-3 text-sm text-[#cbd5e1] items-start group">
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full border border-red-400 group-hover:bg-red-400 transition-all"></div>
                                    <span className="leading-relaxed group-hover:text-red-300 transition-colors">{con}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-center text-[#9ca3af] py-8">Analysis temporarily unavailable.</p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyApplications;
