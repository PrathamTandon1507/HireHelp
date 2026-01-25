import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useJob } from "../context/JobContext";
import DashboardLayout from "./components/DashboardLayout";
import JobCard from "./components/JobCard";

const JobList = () => {
  const navigate = useNavigate();
  const { isApplicant } = useAuth();
  const { jobs, fetchJobs, loading } = useJob();
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    status: "all",
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
      job.department?.toLowerCase().includes(filters.search.toLowerCase());
    const matchesType = filters.type === "all" || job.type === filters.type;
    const matchesStatus =
      filters.status === "all" || job.status === filters.status;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <DashboardLayout
      title={isApplicant ? "Browse Jobs" : "All Job Postings"}
      subtitle={
        isApplicant
          ? "Find your next opportunity"
          : "Manage job postings and applications"
      }
    >
      {/* Filters */}
      <div className="mb-8 relative rounded-xl bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 border border-[#334155]/40 overflow-hidden shadow-lg shadow-black/20 p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2563eb]/5 to-transparent"></div>
        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Search jobs by title or department..."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all"
            />
          </div>
          <select
            value={filters.type}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, type: e.target.value }))
            }
            className="px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all"
          >
            <option value="all">All Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, status: e.target.value }))
            }
            className="px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Create Job Button (Admin/Recruiter only) */}
      {!isApplicant && (
        <div className="mb-6">
          <button
            onClick={() => navigate("/jobs/create")}
            className="px-6 py-3 bg-gradient-to-r from-[#10b981] to-[#14b8a6] text-[#f8fafc] font-medium rounded-lg hover:shadow-lg hover:shadow-[#10b981]/20 transition-all duration-200 hover:scale-[1.02]"
          >
            + Create New Job
          </button>
        </div>
      )}

      {/* Job Listings */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-[#9ca3af] font-mono">Loading jobs...</div>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="relative rounded-xl bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 border border-[#334155]/40 p-12 text-center">
          <p className="text-[#9ca3af]">No jobs found matching your criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              showActions={true}
              actionType={isApplicant ? "apply" : "view"}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default JobList;
