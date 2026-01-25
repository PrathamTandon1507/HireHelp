import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import DashboardLayout from "./components/DashboardLayout";

const ApplicantProfile = () => {
  const { user, updateUser } = useAuth();
  const { success, error } = useNotification();
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    bio: "",
    skills: [],
  });
  const [resumeFile, setResumeFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      error("Please upload a PDF file");
      return;
    }

    setResumeFile(file);
    setUploading(true);

    // TODO: Upload to backend
    // const formData = new FormData();
    // formData.append('resume', file);
    // await fetch('/api/applicant/upload-resume', { method: 'POST', body: formData });

    setTimeout(() => {
      setUploading(false);
      success("Resume uploaded successfully! Processing will begin shortly.");
    }, 1500);
  };

  const handleSave = () => {
    updateUser(profileData);
    setEditing(false);
    success("Profile updated successfully!");
  };

  return (
    <DashboardLayout
      title="My Profile"
      subtitle="Manage your profile and resume"
    >
      <div className="max-w-4xl space-y-6">
        {/* Resume Upload */}
        <div className="relative rounded-xl bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 border border-[#334155]/40 overflow-hidden shadow-lg shadow-black/20 p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/5 to-transparent"></div>
          <div className="relative">
            <h2 className="text-lg font-semibold text-[#f8fafc] mb-4">
              Resume
            </h2>

            <div className="flex items-center gap-4">
              <label className="flex-1 cursor-pointer">
                <div className="p-8 border-2 border-dashed border-[#334155] rounded-lg hover:border-[#2563eb] transition-all text-center">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleResumeUpload}
                    className="hidden"
                  />
                  <div className="text-[#22d3ee] text-3xl mb-2">📄</div>
                  <p className="text-sm text-[#e5e7eb] mb-1">
                    {resumeFile ? resumeFile.name : "Click to upload resume"}
                  </p>
                  <p className="text-xs text-[#64748b]">PDF only, max 5MB</p>
                  {uploading && (
                    <div className="mt-3 text-xs font-mono text-[#22d3ee]">
                      Processing...
                    </div>
                  )}
                </div>
              </label>
            </div>

            {resumeFile && !uploading && (
              <div className="mt-4 p-4 rounded-lg bg-[#10b981]/10 border border-[#10b981]/30">
                <p className="text-sm text-[#10b981]">
                  ✓ Resume uploaded. AI processing will extract skills and
                  experience.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Profile Information */}
        <div className="relative rounded-xl bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 border border-[#334155]/40 overflow-hidden shadow-lg shadow-black/20 p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-[#2563eb]/5 to-transparent"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#f8fafc]">
                Profile Information
              </h2>
              <button
                onClick={() => setEditing(!editing)}
                className="px-4 py-2 text-sm font-medium text-[#22d3ee] hover:text-[#f8fafc] transition-colors"
              >
                {editing ? "Cancel" : "Edit"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#e5e7eb] mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={profileData.fullName}
                  onChange={handleChange}
                  disabled={!editing}
                  className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#e5e7eb] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleChange}
                  disabled={!editing}
                  className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#e5e7eb] mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#e5e7eb] mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={profileData.location}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="San Francisco, CA"
                  className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#e5e7eb] mb-2">
                  LinkedIn
                </label>
                <input
                  type="url"
                  name="linkedin"
                  value={profileData.linkedin}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="linkedin.com/in/username"
                  className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#e5e7eb] mb-2">
                  GitHub
                </label>
                <input
                  type="url"
                  name="github"
                  value={profileData.github}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="github.com/username"
                  className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all disabled:opacity-60"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#e5e7eb] mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleChange}
                  disabled={!editing}
                  rows={4}
                  placeholder="Tell us about yourself..."
                  className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all resize-none disabled:opacity-60"
                />
              </div>
            </div>

            {editing && (
              <div className="mt-6 flex gap-4">
                <button
                  onClick={handleSave}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#10b981] to-[#14b8a6] text-[#f8fafc] font-medium rounded-lg hover:shadow-lg hover:shadow-[#10b981]/20 transition-all duration-200 hover:scale-[1.02]"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ApplicantProfile;
