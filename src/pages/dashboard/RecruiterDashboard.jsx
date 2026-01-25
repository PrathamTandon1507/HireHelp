import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import JobCard from "../components/JobCard";
import CandidateCard from "../components/CandidateCard";

const RecruiterDashboard = () => {
  const [stats, setStats] = useState({
    myJobs: 0,
    activeCandidates: 0,
    interviewsScheduled: 0,
    offersInProgress: 0,
  });
  const [myJobs, setMyJobs] = useState([]);
  const [recentCandidates, setRecentCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Mock data
        setStats({
          myJobs: 5,
          activeCandidates: 28,
          interviewsScheduled: 7,
          offersInProgress: 3,
        });

        setMyJobs([
          {
            _id: "1",
            title: "Senior Backend Engineer",
            department: "Engineering",
            description:
              "We are looking for an experienced backend engineer.. .",
            location: "San Francisco, CA",
            type: "Full-time",
            status: "active",
            applicants: 45,
            createdAt: "2026-01-10T00:00:00Z",
          },
          {
            _id: "2",
            title: "Frontend Developer",
            department: "Engineering",
            description: "Join our team to build beautiful web applications...",
            location: "Remote",
            type: "Full-time",
            status: "active",
            applicants: 38,
            createdAt: "2026-01-12T00:00:00Z",
          },
        ]);

        setRecentCandidates([
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
            email: "emily.r@email. com",
            stage: "offer",
            matchScore: 95,
            skills: ["Java", "Spring Boot", "Kubernetes", "GraphQL"],
            appliedAt: "2026-01-15T00:00:00Z",
          },
        ]);

        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout
        title="Recruiter Dashboard"
        subtitle="Manage your job postings and candidates"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-[#9ca3af] font-mono">Loading dashboard... </div>
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
            <button className="px-4 py-2 text-sm font-medium text-[#22d3ee] hover:text-[#f8fafc] transition-colors">
              View all →
            </button>
          </div>
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
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-[#f8fafc] mb-6">
            Quick Actions
          </h2>
          <div className="space-y-4">
            <button className="w-full p-6 rounded-xl bg-gradient-to-br from-[#2563eb]/20 to-[#3b82f6]/10 border border-[#2563eb]/30 hover:border-[#2563eb]/50 transition-all duration-300 group text-left shadow-lg shadow-black/20">
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
