import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useJob } from "../context/JobContext";
import { useNotification } from "../context/NotificationContext";
import DashboardLayout from "./components/DashboardLayout";

const JobCreate = () => {
  const navigate = useNavigate();
  const { createJob } = useJob();
  const { success, error } = useNotification();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    location: "",
    type: "Full-time",
    description: "",
    requirements: "",
    responsibilities: "",
    salary: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = "Job title is required";
    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.location) newErrors.location = "Location is required";
    if (!formData.description)
      newErrors.description = "Description is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const result = await createJob(formData);
    setSubmitting(false);

    if (result.success) {
      success("Job posted successfully!");
      navigate("/jobs");
    } else {
      error(result.error || "Failed to create job");
    }
  };

  return (
    <DashboardLayout
      title="Create Job Posting"
      subtitle="Post a new position to attract top talent"
    >
      <div className="max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="relative rounded-xl bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 border border-[#334155]/40 overflow-hidden shadow-lg shadow-black/20 p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-[#2563eb]/5 to-transparent"></div>
            <div className="relative">
              <h2 className="text-lg font-semibold text-[#f8fafc] mb-6">
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#e5e7eb] mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 bg-[#0f172a] border ${
                      errors.title ? "border-[#f59e0b]" : "border-[#334155]"
                    } rounded-lg text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all`}
                    placeholder="e.g., Senior Backend Engineer"
                  />
                  {errors.title && (
                    <p className="mt-1.5 text-sm text-[#f59e0b]">
                      {errors.title}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#e5e7eb] mb-2">
                    Department *
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 bg-[#0f172a] border ${
                      errors.department
                        ? "border-[#f59e0b]"
                        : "border-[#334155]"
                    } rounded-lg text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all`}
                    placeholder="e.g., Engineering"
                  />
                  {errors.department && (
                    <p className="mt-1.5 text-sm text-[#f59e0b]">
                      {errors.department}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#e5e7eb] mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 bg-[#0f172a] border ${
                      errors.location ? "border-[#f59e0b]" : "border-[#334155]"
                    } rounded-lg text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all`}
                    placeholder="e.g., San Francisco, CA / Remote"
                  />
                  {errors.location && (
                    <p className="mt-1.5 text-sm text-[#f59e0b]">
                      {errors.location}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#e5e7eb] mb-2">
                    Employment Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#e5e7eb] mb-2">
                    Salary Range (Optional)
                  </label>
                  <input
                    type="text"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all"
                    placeholder="e.g., $120,000 - $160,000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className="relative rounded-xl bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 border border-[#334155]/40 overflow-hidden shadow-lg shadow-black/20 p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-[#22d3ee]/5 to-transparent"></div>
            <div className="relative space-y-6">
              <h2 className="text-lg font-semibold text-[#f8fafc]">
                Job Details
              </h2>

              <div>
                <label className="block text-sm font-medium text-[#e5e7eb] mb-2">
                  Job Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  className={`w-full px-4 py-2.5 bg-[#0f172a] border ${
                    errors.description ? "border-[#f59e0b]" : "border-[#334155]"
                  } rounded-lg text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all resize-none`}
                  placeholder="Describe the role, team, and what makes this opportunity unique..."
                />
                {errors.description && (
                  <p className="mt-1.5 text-sm text-[#f59e0b]">
                    {errors.description}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#e5e7eb] mb-2">
                  Requirements
                </label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all resize-none"
                  placeholder="List required skills, experience, education, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#e5e7eb] mb-2">
                  Responsibilities
                </label>
                <textarea
                  name="responsibilities"
                  value={formData.responsibilities}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all resize-none"
                  placeholder="Describe key responsibilities and day-to-day tasks..."
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-[#f8fafc] font-medium rounded-lg hover:shadow-lg hover:shadow-[#2563eb]/20 transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {submitting ? "Creating..." : "Post Job"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/jobs")}
              className="px-6 py-3 bg-[#0f172a] border border-[#334155] text-[#e5e7eb] font-medium rounded-lg hover:border-[#475569] hover:bg-[#1e293b] transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default JobCreate;
