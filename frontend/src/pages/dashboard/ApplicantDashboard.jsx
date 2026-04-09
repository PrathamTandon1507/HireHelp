import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import JobCard from "../components/JobCard";
import { api } from "../../services/api";

const ApplicantDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    applicationsSubmitted: 0,
    inReview: 0,
    interviews: 0,
    offers: 0,
  });
  const [myApplications, setMyApplications] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, appsData, jobsData] = await Promise.all([
          api.applications.getStats(),
          api.applications.listMine(),
          api.jobs.list({ limit: 4 }) // For now just show recent jobs as recommended
        ]);

        setStats(statsData);
        setMyApplications(appsData);
        setRecommendedJobs(jobsData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <DashboardLayout
      title="Applicant Dashboard"
      subtitle="Track your applications and discover opportunities"
      loading={loading}
      loadingMessage="Preparing Your Career Dashboard"
      loadingSubtext="Fetching your latest stats and personalized recommendations..."
    >
      {/* Pending Offers Alert */}
      {myApplications.filter(app => app.stage === "offer").length > 0 && (
        <div className="mb-8 p-6 bg-gradient-to-br from-[#10b981]/20 to-[#059669]/10 border border-[#10b981]/40 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.15)] flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h3 className="text-xl font-bold text-[#10b981] mb-1">🎉 You have pending job offers!</h3>
                <p className="text-[#cbd5e1]">Companies have extended offers. Please review them promptly.</p>
            </div>
            <button
                onClick={() => navigate(`/applications/${myApplications.find(a => a.stage === "offer")._id}/offer`)}
                className="px-6 py-3 bg-gradient-to-r from-[#10b981] to-[#059669] text-[#f8fafc] font-bold rounded-lg hover:shadow-lg hover:shadow-[#10b981]/30 transition-transform hover:scale-105 whitespace-nowrap"
            >
                Review Offer Details
            </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Applications"
          value={stats.applicationsSubmitted}
          subtitle="Total submitted"
          icon="◆"
          accentColor="#2563eb"
        />
        <StatCard
          title="In Review"
          value={stats.inReview}
          subtitle="Being reviewed"
          icon="◇"
          accentColor="#22d3ee"
        />
        <StatCard
          title="Interviews"
          value={stats.interviews}
          subtitle="Scheduled"
          icon="●"
          accentColor="#10b981"
          trend={{ value: "+1", label: "this week", positive: true }}
        />
        <StatCard
          title="Active Offers"
          value={stats.offers}
          subtitle="Received"
          icon="✓"
          accentColor="#f59e0b"
        />
      </div>

      {/* Application Timeline */}
      <div className="mb-8">
        <div className="relative rounded-xl bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 border border-[#334155]/40 overflow-hidden shadow-lg shadow-black/20 p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/5 to-transparent"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#f8fafc]">
                Application Progress
              </h2>
              <Link to="/my-applications" className="text-xs font-semibold text-[#22d3ee] hover:text-[#f8fafc] transition-colors">
                View All →
              </Link>
            </div>
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#2563eb] via-[#22d3ee] to-[#10b981]"></div>

              {/* Timeline Items */}
              <div className="space-y-6">
                {myApplications.length === 0 ? (
                  <div className="text-center text-[#9ca3af] py-8">
                    No applications yet. Start applying to see your progress!
                  </div>
                ) : (
                  myApplications.slice(0, 3).map((app, index) => (
                    <div key={app._id} className="flex items-start gap-4 relative">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${
                        app.stage === 'offer' ? 'from-[#10b981] to-[#14b8a6]' :
                        app.stage === 'interview' ? 'from-[#2563eb] to-[#3b82f6]' :
                        'from-[#22d3ee] to-[#06b6d4]'
                      } flex items-center justify-center text-[#f8fafc] font-semibold shadow-lg z-10`}>
                        {index + 1}
                      </div>
                      <div className={`flex-1 p-4 rounded-lg bg-[#0f172a]/60 border ${
                        app.stage === 'offer' ? 'border-[#10b981]/30' :
                        app.stage === 'interview' ? 'border-[#2563eb]/30' :
                        'border-[#22d3ee]/30'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-semibold text-[#f8fafc]">
                            {app.title} - {app.stage.charAt(0).toUpperCase() + app.stage.slice(1)}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-mono rounded ${
                            app.stage === 'offer' ? 'text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/30' :
                            app.stage === 'interview' ? 'text-[#2563eb] bg-[#2563eb]/10 border border-[#2563eb]/30' :
                            'text-[#22d3ee] bg-[#22d3ee]/10 border border-[#22d3ee]/30'
                          }`}>
                            {app.stage}
                          </span>
                        </div>
                        <p className="text-xs text-[#9ca3af]">
                          {app.stage === 'offer' ? 'Review and respond to your offer' :
                           app.stage === 'interview' ? 'Interview in progress' :
                           'Application is being reviewed'} • {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* My Applications */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[#f8fafc]">
            My Applications
          </h2>
          <button className="px-4 py-2 text-sm font-medium text-[#22d3ee] hover:text-[#f8fafc] transition-colors">
            View all →
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {myApplications.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              showActions={true}
              actionType="status"
            />
          ))}
        </div>
      </div>

      {/* Recommended Jobs */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-[#f8fafc] mb-1">
              Recommended for You
            </h2>
            <p className="text-sm text-[#9ca3af]">
              Based on your profile and preferences
            </p>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-[#22d3ee] hover:text-[#f8fafc] transition-colors">
            Browse all jobs →
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {recommendedJobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              showActions={true}
              actionType="apply"
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ApplicantDashboard;
