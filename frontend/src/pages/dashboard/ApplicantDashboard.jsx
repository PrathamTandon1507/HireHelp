import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import JobCard from "../components/JobCard";

const ApplicantDashboard = () => {
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
        // Mock data
        setStats({
          applicationsSubmitted: 8,
          inReview: 3,
          interviews: 2,
          offers: 1,
        });

        setMyApplications([
          {
            _id: "1",
            title: "Senior Backend Engineer",
            department: "Engineering",
            description:
              "We are looking for an experienced backend engineer...",
            location: "San Francisco, CA",
            type: "Full-time",
            status: "active",
            applicationStatus: "interview",
            createdAt: "2026-01-10T00:00:00Z",
          },
          {
            _id: "2",
            title: "Full Stack Developer",
            department: "Engineering",
            description: "Join our team to build scalable applications...",
            location: "Remote",
            type: "Full-time",
            status: "active",
            applicationStatus: "screening",
            createdAt: "2026-01-12T00:00:00Z",
          },
          {
            _id: "3",
            title: "Software Engineer",
            department: "Engineering",
            description: "Work on cutting-edge technologies...",
            location: "New York, NY",
            type: "Full-time",
            status: "active",
            applicationStatus: "offer",
            createdAt: "2026-01-08T00:00:00Z",
          },
        ]);

        setRecommendedJobs([
          {
            _id: "4",
            title: "DevOps Engineer",
            department: "Infrastructure",
            description:
              "Help us build and maintain our cloud infrastructure...",
            location: "Remote",
            type: "Full-time",
            status: "active",
            applicants: 23,
            createdAt: "2026-01-15T00:00:00Z",
          },
          {
            _id: "5",
            title: "Cloud Solutions Architect",
            department: "Engineering",
            description: "Design and implement cloud-native solutions...",
            location: "Seattle, WA",
            type: "Full-time",
            status: "active",
            applicants: 31,
            createdAt: "2026-01-16T00:00:00Z",
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
        title="Applicant Dashboard"
        subtitle="Track your applications and discover opportunities"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-[#9ca3af] font-mono">Loading dashboard...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Applicant Dashboard"
      subtitle="Track your applications and discover opportunities"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md: grid-cols-2 lg: grid-cols-4 gap-6 mb-8">
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
          title="Offers"
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
            <h2 className="text-lg font-semibold text-[#f8fafc] mb-6">
              Application Progress
            </h2>
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#2563eb] via-[#22d3ee] to-[#10b981]"></div>

              {/* Timeline Items */}
              <div className="space-y-6">
                <div className="flex items-start gap-4 relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#10b981] to-[#14b8a6] flex items-center justify-center text-[#f8fafc] font-semibold shadow-lg shadow-[#10b981]/30 z-10">
                    1
                  </div>
                  <div className="flex-1 p-4 rounded-lg bg-[#0f172a]/60 border border-[#10b981]/30">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-[#f8fafc]">
                        Software Engineer - Offer Received
                      </h3>
                      <span className="px-2 py-1 text-xs font-mono text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/30 rounded">
                        Offer
                      </span>
                    </div>
                    <p className="text-xs text-[#9ca3af]">
                      Review and respond to your offer • 3 days remaining
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2563eb] to-[#3b82f6] flex items-center justify-center text-[#f8fafc] font-semibold shadow-lg shadow-[#2563eb]/30 z-10">
                    2
                  </div>
                  <div className="flex-1 p-4 rounded-lg bg-[#0f172a]/60 border border-[#2563eb]/30">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-[#f8fafc]">
                        Senior Backend Engineer - Interview Scheduled
                      </h3>
                      <span className="px-2 py-1 text-xs font-mono text-[#2563eb] bg-[#2563eb]/10 border border-[#2563eb]/30 rounded">
                        Interview
                      </span>
                    </div>
                    <p className="text-xs text-[#9ca3af]">
                      Technical interview on Jan 22, 2026 at 2:00 PM
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#22d3ee] to-[#06b6d4] flex items-center justify-center text-[#f8fafc] font-semibold shadow-lg shadow-[#22d3ee]/30 z-10">
                    3
                  </div>
                  <div className="flex-1 p-4 rounded-lg bg-[#0f172a]/60 border border-[#22d3ee]/30">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-[#f8fafc]">
                        Full Stack Developer - Under Review
                      </h3>
                      <span className="px-2 py-1 text-xs font-mono text-[#22d3ee] bg-[#22d3ee]/10 border border-[#22d3ee]/30 rounded">
                        Screening
                      </span>
                    </div>
                    <p className="text-xs text-[#9ca3af]">
                      Application is being reviewed by the hiring team
                    </p>
                  </div>
                </div>
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
