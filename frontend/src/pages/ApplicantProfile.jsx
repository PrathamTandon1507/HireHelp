import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { api } from "../services/api";
import DashboardLayout from "./components/DashboardLayout";

const ApplicantProfile = () => {
  const { user, updateUser } = useAuth();
  const { success, error } = useNotification();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [profileData, setProfileData] = useState({
    full_name: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    location: user?.location || "",
    linkedin: user?.linkedin || "",
    github: user?.github || "",
    bio: user?.bio || "",
    skills: user?.skills || [],
  });
  const [skillInput, setSkillInput] = useState("");

  // Sync form when user context loads / updates
  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        location: user.location || "",
        linkedin: user.linkedin || "",
        github: user.github || "",
        bio: user.bio || "",
        skills: user.skills || [],
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = (e) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      const trimmed = skillInput.trim();
      if (!profileData.skills.includes(trimmed)) {
        setProfileData((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
      }
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill) => {
    setProfileData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      error("Please upload a PDF file");
      return;
    }

    setUploading(true);
    setResumeFile(file);
    try {
      const result = await api.auth.uploadResume(file);
      // Refresh user data from the server
      const freshUser = await api.auth.me();
      updateUser(freshUser);
      success("Resume uploaded successfully!");
    } catch (err) {
      error("Failed to upload resume: " + (err.message || "Unknown error"));
      setResumeFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Build the payload for the API — only send updatable fields (not email)
      const payload = {
        full_name: profileData.full_name,
        phone: profileData.phone || "",
        location: profileData.location || "",
        linkedin: profileData.linkedin || "",
        github: profileData.github || "",
        bio: profileData.bio || "",
        skills: profileData.skills,
      };

      const updated = await api.auth.updateProfile(payload);
      // Sync the returned server data back to context
      updateUser(updated);
      setEditing(false);
      success("Profile updated successfully!");
    } catch (err) {
      error("Failed to save profile: " + (err.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const resumePath = user?.resumePath;
  const resumeDisplayName = resumeFile
    ? resumeFile.name
    : resumePath
    ? resumePath.split("/").pop()
    : null;

  return (
    <DashboardLayout title="My Profile" subtitle="Manage your profile and resume">
      <div className="max-w-4xl space-y-6">

        {/* Resume Upload */}
        <div className="relative rounded-xl bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 border border-[#334155]/40 overflow-hidden shadow-lg shadow-black/20 p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/5 to-transparent" />
          <div className="relative">
            <h2 className="text-lg font-semibold text-[#f8fafc] mb-4">Resume</h2>

            {/* Current resume indicator */}
            {resumePath && !uploading && (
              <div className="mb-4 p-4 rounded-lg bg-[#10b981]/10 border border-[#10b981]/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📄</span>
                  <div>
                    <p className="text-sm font-medium text-[#10b981]">
                      Current Resume: {resumeDisplayName}
                    </p>
                    <p className="text-xs text-[#9ca3af] mt-0.5">
                      This resume is used by default when applying for jobs
                    </p>
                  </div>
                </div>
                <a
                  href={`/uploads/${resumePath.replace(/^uploads\//, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-xs font-medium text-[#22d3ee] border border-[#22d3ee]/30 rounded-lg hover:bg-[#22d3ee]/10 transition-all"
                >
                  View →
                </a>
              </div>
            )}

            <label className="flex-1 cursor-pointer">
              <div className="p-8 border-2 border-dashed border-[#334155] rounded-lg hover:border-[#2563eb] transition-all text-center">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleResumeUpload}
                  className="hidden"
                />
                <div className="text-[#22d3ee] text-3xl mb-2">📤</div>
                <p className="text-sm text-[#e5e7eb] mb-1">
                  {uploading ? "Uploading..." : resumePath ? "Click to replace resume" : "Click to upload resume"}
                </p>
                <p className="text-xs text-[#64748b]">PDF only, max 5MB</p>
                {uploading && (
                  <div className="mt-3 text-xs font-mono text-[#22d3ee] animate-pulse">
                    Processing...
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Profile Information */}
        <div className="relative rounded-xl bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 border border-[#334155]/40 overflow-hidden shadow-lg shadow-black/20 p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-[#2563eb]/5 to-transparent" />
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#f8fafc]">Profile Information</h2>
              <button
                onClick={() => {
                  if (editing) {
                    // Reset changes on cancel
                    if (user) {
                      setProfileData({
                        full_name: user.fullName || "",
                        email: user.email || "",
                        phone: user.phone || "",
                        location: user.location || "",
                        linkedin: user.linkedin || "",
                        github: user.github || "",
                        bio: user.bio || "",
                        skills: user.skills || [],
                      });
                    }
                  }
                  setEditing(!editing);
                }}
                className="px-4 py-2 text-sm font-medium text-[#22d3ee] hover:text-[#f8fafc] transition-colors"
              >
                {editing ? "Cancel" : "Edit"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#e5e7eb] mb-2">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={profileData.full_name}
                  onChange={handleChange}
                  disabled={!editing}
                  className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#e5e7eb] mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  disabled
                  className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-[#f8fafc] opacity-60 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#e5e7eb] mb-2">Phone</label>
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
                <label className="block text-sm font-medium text-[#e5e7eb] mb-2">Location</label>
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
                <label className="block text-sm font-medium text-[#e5e7eb] mb-2">LinkedIn</label>
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
                <label className="block text-sm font-medium text-[#e5e7eb] mb-2">GitHub</label>
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
                <label className="block text-sm font-medium text-[#e5e7eb] mb-2">Bio</label>
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

              {/* Skills */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#e5e7eb] mb-2">Skills</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {profileData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono text-[#22d3ee] bg-[#0f172a]/60 border border-[#22d3ee]/20 rounded-full"
                    >
                      {skill}
                      {editing && (
                        <button
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-[#64748b] hover:text-[#b91c1c] transition-colors leading-none"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                  {profileData.skills.length === 0 && !editing && (
                    <span className="text-sm text-[#64748b]">No skills added yet</span>
                  )}
                </div>
                {editing && (
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleAddSkill}
                    placeholder="Type a skill and press Enter..."
                    className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all"
                  />
                )}
              </div>
            </div>

            {editing && (
              <div className="mt-6 flex gap-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#10b981] to-[#14b8a6] text-[#f8fafc] font-medium rounded-lg hover:shadow-lg hover:shadow-[#10b981]/20 transition-all duration-200 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Changes"}
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
