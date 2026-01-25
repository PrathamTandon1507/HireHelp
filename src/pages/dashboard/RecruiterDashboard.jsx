import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useJob } from "../../context/JobContext"; // ADD THIS
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import JobCard from "../components/JobCard";
import CandidateCard from "../components/CandidateCard";

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const { jobs, fetchJobs, loading } = useJob(); // USE CONTEXT

  useEffect(() => {
    fetchJobs();
  }, []);

  const stats = {
    myJobs: jobs.length,
    activeCandidates: 28,
    interviewsScheduled: 7,
    offersInProgress: 3,
  };

  const myJobs = jobs.slice(0, 2); // Show first 2 jobs

  // Mock candidates (can be moved to context later)
  const recentCandidates = [
    {
      _id: "1",
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      stage: "interview",
      matchScore: 92,
      skills: ["React", "Node.js", "TypeScript", "MongoDB", "AWS"],
      appliedAt: "2026-01-16T00:00:00Z",
    },
    {
      _id: "2",
      name: "Michael Chen",
      email: "mchen@email.com",
      stage: "screening",
      matchScore: 88,
      skills: ["Python", "Django", "PostgreSQL", "Docker"],
      appliedAt: "2026-01-17T00:00:00Z",
    },
    {
      _id: "3",
      name: "Emily Rodriguez",
      email: "emily.r@email.com",
      stage: "offer",
      matchScore: 95,
      skills: ["Java", "Spring Boot", "Kubernetes", "GraphQL"],
      appliedAt: "2026-01-15T00:00:00Z",
    },
  ];

  if (loading) {
    return (
      <DashboardLayout
        title="Recruiter Dashboard"
        subtitle="Manage your job postings and candidates"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-[#9ca3af] font-mono">Loading dashboard...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Recruiter Dashboard"
      subtitle="Manage your job postings and candidates"
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
          title="Active Candidates"
          value={stats.activeCandidates}
          subtitle="In pipeline"
          icon="●"
          accentColor="#22d3ee"
          trend={{ value: "+5", label: "this week", positive: true }}
        />
        <StatCard
          title="Interviews"
          value={stats.interviewsScheduled}
          subtitle="Scheduled"
          icon="◇"
          accentColor="#10b981"
        />
        <StatCard
          title="Offers"
          value={stats.offersInProgress}
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
              jobId="1"
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RecruiterDashboard;
