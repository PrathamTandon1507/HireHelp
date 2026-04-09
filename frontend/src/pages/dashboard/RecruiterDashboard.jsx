import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useJob } from "../../context/JobContext";
import { api } from "../../services/api";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import JobCard from "../components/JobCard";
import CandidateCard from "../components/CandidateCard";

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const { jobs, fetchJobs, loading: jobsLoading } = useJob();
  const [stats, setStats] = useState({
    myJobs: 0,
    totalApplications: 0,
    interviews: 0,
    offers: 0,
  });
  const [myJobs, setMyJobs] = useState([]);
  const [recentCandidates, setRecentCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Load stats, candidates, and my jobs
        const [statsData, candidatesData, myJobsData] = await Promise.all([
          api.applications.getStats(),
          api.applications.listMyCandidates(),
          api.jobs.listMyJobs()
        ]);
        
        setStats(statsData);
        setRecentCandidates(candidatesData);
        setMyJobs(myJobsData.slice(0, 2)); // Save top 2
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <DashboardLayout
      title="Recruiter Dashboard"
      subtitle="Manage your job postings and candidates"
      loading={loading || jobsLoading}
      loadingMessage="Assembling Your Pipeline"
      loadingSubtext="Fetching your active jobs and recent candidate applications..."
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="My Jobs"
          value={stats.myJobs}
          subtitle="Active postings"
          icon="◆"
          accentColor="#2563eb"
        />
        <StatCard
          title="Applications"
          value={stats.totalApplications}
          subtitle="In pipeline"
          icon="●"
          accentColor="#22d3ee"
          trend={{ value: "+5", label: "this week", positive: true }}
        />
        <StatCard
          title="Interviews"
          value={stats.interviews}
          subtitle="Scheduled"
          icon="◇"
          accentColor="#10b981"
        />
        <StatCard
          title="Active Offers"
          value={stats.offers}
          subtitle="In progress"
          icon="✓"
          accentColor="#f59e0b"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        {/* My Jobs */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[#f8fafc]">
              My Active Jobs
            </h2>
            <button
              onClick={() => navigate("/jobs")}
              className="px-4 py-2 text-sm font-medium text-[#22d3ee] hover:text-[#f8fafc] transition-colors"
            >
              View all →
            </button>
          </div>
          {myJobs.length === 0 ? (
            <div className="text-center text-[#9ca3af] py-12">
              No jobs posted yet. Create your first job!
            </div>
          ) : (
            <div className="space-y-4">
              {myJobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  showActions={true}
                  actionType="view"
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-[#f8fafc] mb-6">
            Quick Actions
          </h2>
          <div className="space-y-4">
            <button
              onClick={() => navigate("/jobs/create")}
              className="w-full p-6 rounded-xl bg-gradient-to-br from-[#2563eb]/20 to-[#3b82f6]/10 border border-[#2563eb]/30 hover:border-[#2563eb]/50 transition-all duration-300 group text-left shadow-lg shadow-black/20"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#2563eb] to-[#3b82f6] flex items-center justify-center text-xl shadow-lg shadow-[#2563eb]/20 group-hover:scale-110 transition-transform">
                  +
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#f8fafc] mb-1">
                    Create New Job
                  </h3>
                  <p className="text-sm text-[#9ca3af]">
                    Post a new job opening
                  </p>
                </div>
              </div>
            </button>

            <button className="w-full p-6 rounded-xl bg-gradient-to-br from-[#10b981]/20 to-[#14b8a6]/10 border border-[#10b981]/30 hover:border-[#10b981]/50 transition-all duration-300 group text-left shadow-lg shadow-black/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#10b981] to-[#14b8a6] flex items-center justify-center text-xl shadow-lg shadow-[#10b981]/20 group-hover:scale-110 transition-transform">
                  ⚡
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#f8fafc] mb-1">
                    AI Shortlist
                  </h3>
                  <p className="text-sm text-[#9ca3af]">
                    Generate candidate rankings
                  </p>
                </div>
              </div>
            </button>

            <button className="w-full p-6 rounded-xl bg-gradient-to-br from-[#22d3ee]/20 to-[#22d3ee]/10 border border-[#22d3ee]/30 hover:border-[#22d3ee]/50 transition-all duration-300 group text-left shadow-lg shadow-black/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#22d3ee] to-[#06b6d4] flex items-center justify-center text-xl shadow-lg shadow-[#22d3ee]/20 group-hover:scale-110 transition-transform">
                  📊
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#f8fafc] mb-1">
                    View Analytics
                  </h3>
                  <p className="text-sm text-[#9ca3af]">
                    Hiring pipeline insights
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Candidates */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[#f8fafc]">
            Recent Candidates
          </h2>
          <button className="px-4 py-2 text-sm font-medium text-[#22d3ee] hover:text-[#f8fafc] transition-colors">
            View all →
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {recentCandidates.map((candidate) => (
            <CandidateCard
              key={candidate._id}
              candidate={candidate}
              jobId={candidate.job_id || candidate.jobId}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RecruiterDashboard;
