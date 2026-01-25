import { useEffect } from "react";
import { useJob } from "../../context/JobContext"; // ADD THIS
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import JobCard from "../components/JobCard";

const AdminDashboard = () => {
  const { jobs, fetchJobs, loading } = useJob(); // USE CONTEXT

  useEffect(() => {
    fetchJobs(); // Fetch jobs on mount
  }, []);

  const stats = {
    totalJobs: jobs.length,
    activeJobs: jobs.filter((j) => j.status === "active").length,
    totalApplicants: jobs.reduce((sum, job) => sum + (job.applicants || 0), 0),
    offersExtended: 15,
  };

  const recentJobs = jobs.slice(0, 3); // Show first 3 jobs

  if (loading) {
    return (
      <DashboardLayout
        title="Admin Dashboard"
        subtitle="System overview and job management"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-[#9ca3af] font-mono">Loading dashboard...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Admin Dashboard"
      subtitle="System overview and job management"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Jobs"
          value={stats.totalJobs}
          subtitle="All time"
          icon="◆"
          accentColor="#2563eb"
          trend={{ value: "+3", label: "this month", positive: true }}
        />
        <StatCard
          title="Active Jobs"
          value={stats.activeJobs}
          subtitle="Currently hiring"
          icon="◇"
          accentColor="#10b981"
          trend={{
            value: `${stats.activeJobs}`,
            label: "open positions",
            positive: true,
          }}
        />
        <StatCard
          title="Total Applicants"
          value={stats.totalApplicants}
          subtitle="All positions"
          icon="●"
          accentColor="#22d3ee"
          trend={{ value: "+42", label: "this week", positive: true }}
        />
        <StatCard
          title="Offers Extended"
          value={stats.offersExtended}
          subtitle="Pending acceptance"
          icon="✓"
          accentColor="#f59e0b"
        />
      </div>

      {/* System Activity */}
      <div className="mb-8">
        <div className="relative rounded-xl bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 border border-[#334155]/40 overflow-hidden shadow-lg shadow-black/20 p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-[#22d3ee]/5 to-transparent"></div>
          <div className="relative">
            <h2 className="text-lg font-semibold text-[#f8fafc] mb-4">
              System Activity
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f172a]/60 border border-[#334155]/30">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#10b981] shadow-lg shadow-[#10b981]/50"></div>
                  <div>
                    <p className="text-sm text-[#f8fafc]">
                      New application received
                    </p>
                    <p className="text-xs text-[#64748b] font-mono">
                      Senior Backend Engineer
                    </p>
                  </div>
                </div>
                <span className="text-xs text-[#9ca3af]">2 min ago</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f172a]/60 border border-[#334155]/30">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#2563eb] shadow-lg shadow-[#2563eb]/50"></div>
                  <div>
                    <p className="text-sm text-[#f8fafc]">
                      Interview scheduled
                    </p>
                    <p className="text-xs text-[#64748b] font-mono">
                      Product Designer position
                    </p>
                  </div>
                </div>
                <span className="text-xs text-[#9ca3af]">1 hour ago</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f172a]/60 border border-[#334155]/30">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#22d3ee] shadow-lg shadow-[#22d3ee]/50"></div>
                  <div>
                    <p className="text-sm text-[#f8fafc]">Offer accepted</p>
                    <p className="text-xs text-[#64748b] font-mono">
                      Data Scientist position
                    </p>
                  </div>
                </div>
                <span className="text-xs text-[#9ca3af]">3 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Jobs */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[#f8fafc]">
            Active Job Postings
          </h2>
          <button
            onClick={() => (window.location.href = "/jobs")}
            className="px-4 py-2 text-sm font-medium text-[#22d3ee] hover:text-[#f8fafc] transition-colors"
          >
            View all →
          </button>
        </div>
        {recentJobs.length === 0 ? (
          <div className="text-center text-[#9ca3af] py-12">
            No jobs posted yet. Create your first job!
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {recentJobs.map((job) => (
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
    </DashboardLayout>
  );
};

export default AdminDashboard;
