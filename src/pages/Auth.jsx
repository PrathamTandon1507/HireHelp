import { useState } from "react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "applicant",
    fullName: "",
  });
  const [errors, setErrors] = useState({});

  const roles = [
    {
      value: "applicant",
      label: "Applicant",
      description: "Search and apply for jobs",
    },
    {
      value: "recruiter",
      label: "Recruiter",
      description: "Manage candidates and hiring",
    },
    { value: "admin", label: "Admin", description: "Full system access" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!isLogin && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!isLogin) {
      if (!formData.fullName) {
        newErrors.fullName = "Full name is required";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    // API integration point
    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : {
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          role: formData.role,
        };

    try {
      // const response = await fetch(endpoint, {
      //   method: 'POST',
      //   headers:  { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload)
      // });
      // const data = await response.json();
      // Handle success:  store token, redirect to dashboard
      console.log("Submit:", endpoint, payload);
    } catch (error) {
      console.error("Auth error:", error);
      setErrors({ submit: "Authentication failed.  Please try again." });
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      role: "applicant",
      fullName: "",
    });
  };

  return (
    <div className="min-h-screen bg-[#0b1220] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.15),rgba(255,255,255,0))] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-10 space-y-2">
          <h1 className="text-4xl font-bold text-white tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            HireHelp
          </h1>
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-slate-700"></div>
            <p className="text-cyan-500/90 text-[10px] font-mono uppercase tracking-[0.2em] font-medium">
              AI-Assisted Recruitment System
            </p>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-slate-700"></div>
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-[#1e293b]/30 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] p-8 ring-1 ring-white/5">
          {/* Mode Toggle */}
          <div className="flex p-1 bg-[#020617]/60 border border-white/5 rounded-lg mb-8 shadow-inner">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md text-xs font-mono font-medium tracking-wide transition-all duration-300 ${
                isLogin
                  ? "bg-[#2563eb] text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-blue-400/20"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              LOGIN_ACCESS
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md text-xs font-mono font-medium tracking-wide transition-all duration-300 ${
                !isLogin
                  ? "bg-[#2563eb] text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-blue-400/20"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              REGISTER_NEW
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name - Register Only */}
            {!isLogin && (
              <div className="group">
                <label
                  htmlFor="fullName"
                  className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-2 group-focus-within:text-cyan-500 transition-colors"
                >
                  Full Identification
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-[#020617]/80 border ${
                    errors.fullName
                      ? "border-[#b91c1c] shadow-[0_0_10px_rgba(185,28,28,0.2)]"
                      : "border-slate-700/60 group-hover:border-slate-600"
                  } rounded-lg text-slate-200 placeholder-slate-700 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all duration-300`}
                  placeholder="ENTER FULL NAME"
                />
                {errors.fullName && (
                  <div className="mt-2 flex items-center gap-2 text-[#f59e0b]">
                    <span className="w-1 h-1 bg-[#f59e0b] rounded-full"></span>
                    <p className="text-xs font-mono">{errors.fullName}</p>
                  </div>
                )}
              </div>
            )}

            {/* Email */}
            <div className="group">
              <label
                htmlFor="email"
                className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-2 group-focus-within:text-cyan-500 transition-colors"
              >
                Email Designation
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-[#020617]/80 border ${
                  errors.email
                    ? "border-[#b91c1c] shadow-[0_0_10px_rgba(185,28,28,0.2)]"
                    : "border-slate-700/60 group-hover:border-slate-600"
                } rounded-lg text-slate-200 placeholder-slate-700 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all duration-300`}
                placeholder="USER@DOMAIN.COM"
              />
              {errors.email && (
                <div className="mt-2 flex items-center gap-2 text-[#f59e0b]">
                  <span className="w-1 h-1 bg-[#f59e0b] rounded-full"></span>
                  <p className="text-xs font-mono">{errors.email}</p>
                </div>
              )}
            </div>

            {/* Password */}
            <div className="group">
              <label
                htmlFor="password"
                className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-2 group-focus-within:text-cyan-500 transition-colors"
              >
                Secure Passcode
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-[#020617]/80 border ${
                  errors.password
                    ? "border-[#b91c1c] shadow-[0_0_10px_rgba(185,28,28,0.2)]"
                    : "border-slate-700/60 group-hover:border-slate-600"
                } rounded-lg text-slate-200 placeholder-slate-700 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all duration-300 font-mono tracking-widest`}
                placeholder="••••••••"
              />
              {errors.password && (
                <div className="mt-2 flex items-center gap-2 text-[#f59e0b]">
                  <span className="w-1 h-1 bg-[#f59e0b] rounded-full"></span>
                  <p className="text-xs font-mono">{errors.password}</p>
                </div>
              )}
            </div>

            {/* Confirm Password - Register Only */}
            {!isLogin && (
              <div className="group">
                <label
                  htmlFor="confirmPassword"
                  className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-2 group-focus-within:text-cyan-500 transition-colors"
                >
                  Verify Passcode
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-[#020617]/80 border ${
                    errors.confirmPassword
                      ? "border-[#b91c1c] shadow-[0_0_10px_rgba(185,28,28,0.2)]"
                      : "border-slate-700/60 group-hover:border-slate-600"
                  } rounded-lg text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 font-mono tracking-widest`}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <div className="mt-2 flex items-center gap-2 text-[#f59e0b]">
                    <span className="w-1 h-1 bg-[#f59e0b] rounded-full"></span>
                    <p className="text-xs font-mono">
                      {errors.confirmPassword}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Role Selection - Register Only */}
            {!isLogin && (
              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Access Level Authorization
                </label>
                <div className="space-y-3">
                  {roles.map((role) => (
                    <label
                      key={role.value}
                      className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all duration-300 group ${
                        formData.role === role.value
                          ? "border-blue-500/40 bg-blue-900/10 shadow-[0_0_15px_-5px_rgba(37,99,235,0.3)]"
                          : "border-slate-800 bg-[#0f172a]/40 hover:border-slate-600 hover:bg-[#0f172a]/60"
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role.value}
                        checked={formData.role === role.value}
                        onChange={handleChange}
                        className="mt-1 h-4 w-4 appearance-none rounded-full border border-slate-600 bg-[#020617] checked:border-blue-500 checked:bg-blue-500 checked:ring-2 checked:ring-blue-900 focus:ring-offset-0 transition-all"
                      />
                      <div className="ml-4">
                        <div
                          className={`text-sm font-semibold transition-colors ${
                            formData.role === role.value
                              ? "text-white"
                              : "text-slate-300 group-hover:text-white"
                          }`}
                        >
                          {role.label}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 font-mono">
                          {role.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-4 bg-[#b91c1c]/10 border border-[#b91c1c]/30 rounded-lg flex items-start gap-3">
                <div className="text-[#b91c1c] mt-0.5">⚠️</div>
                <p className="text-xs font-mono text-[#b91c1c]">
                  {errors.submit}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] hover:to-[#1e40af] text-white text-sm font-bold uppercase tracking-widest py-3.5 px-4 rounded-lg shadow-lg shadow-blue-900/20 hover:shadow-blue-500/20 active:scale-[0.98] transition-all duration-300 border-t border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-[#0f172a]"
            >
              {isLogin ? "Authenticate System" : "Initialize Account"}
            </button>
          </form>

          {/* Toggle Link */}
          <div className="mt-8 text-center border-t border-slate-800/50 pt-6">
            <button
              type="button"
              onClick={toggleMode}
              className="text-xs text-slate-500 hover:text-cyan-400 transition-colors duration-300 font-mono"
            >
              {isLogin ? "NO ACCESS TOKEN? " : "EXISTING CREDENTIALS? "}
              <span className="font-bold underline decoration-slate-700 underline-offset-4 hover:decoration-cyan-400">
                {isLogin ? "REGISTER_USER" : "LOGIN_SYSTEM"}
              </span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] font-mono text-slate-600 mt-8 uppercase tracking-widest opacity-60">
          Secured by HireHelp Intelligence Grid v2.0
        </p>
      </div>
    </div>
  );
};

export default Auth;
