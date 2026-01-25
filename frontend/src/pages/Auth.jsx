import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../HireHelpLogo.png";

const Auth = () => {
  const navigate = useNavigate();
  const { login, register, user } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "applicant",
    fullName: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const roles = [
    {
      value: "applicant",
      label: "Applicant",
      description: "Search and apply for jobs",
      icon: "👤",
    },
    {
      value: "recruiter",
      label: "Recruiter",
      description: "Manage candidates and hiring",
      icon: "💼",
    },
    {
      value: "admin",
      label: "Admin",
      description: "Full system access",
      icon: "⚙️",
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

    setSubmitting(true);
    setErrors({});

    try {
      const result = isLogin
        ? await login(formData.email, formData.password)
        : await register({
            email: formData.email,
            password: formData.password,
            fullName: formData.fullName,
            role: formData.role,
          });

      if (result.success) {
        // Navigation will happen via useEffect when user state updates
      } else {
        setErrors({
          submit: result.error || "Authentication failed. Please try again.",
        });
      }
    } catch (error) {
      setErrors({ submit: "An unexpected error occurred. Please try again." });
    } finally {
      setSubmitting(false);
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
    <div className="min-h-screen bg-gradient-to-br from-[#0b1220] via-[#0f172a] to-[#111827] flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-[#2563eb] rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-[#10b981] rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-[#22d3ee] rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-block mb-4">
            <div className="w-40 h-40 mx-auto bg-gradient-to-br from-[#2563eb] to-[#3b82f6] rounded-2xl flex items-center justify-center shadow-lg shadow-[#2563eb]/30 transform hover:scale-110 transition-all duration-300 hover:rotate-3">
              {" "}
              <img src={logo} alt="HireHelp Logo" className="w-30 h-30" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-[#f8fafc] mb-3 tracking-tight">
            HireHelp
          </h1>
          <p className="text-[#9ca3af] text-sm font-mono tracking-wide">
            AI-Assisted Recruitment Platform
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse shadow-lg shadow-[#10b981]/50"></div>
            <span className="text-xs text-[#64748b]">System Online</span>
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-[#1e293b]/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/40 p-8 border border-[#334155]/50 hover:border-[#334155]/80 transition-all duration-300 hover:shadow-[#2563eb]/10 hover:shadow-2xl animate-slide-up">
          {/* Subtle top gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2563eb] via-[#22d3ee] to-[#10b981] rounded-t-2xl"></div>

          {/* Mode Toggle */}
          <div className="flex gap-3 mb-8 p-1.5 bg-[#0f172a]/60 rounded-xl border border-[#334155]/30 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 px-6 rounded-lg text-sm font-semibold transition-all duration-300 ${
                isLogin
                  ? "bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-[#f8fafc] shadow-lg shadow-[#2563eb]/30 scale-105"
                  : "text-[#9ca3af] hover:text-[#f8fafc] hover:bg-[#1e293b]/50"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 px-6 rounded-lg text-sm font-semibold transition-all duration-300 ${
                !isLogin
                  ? "bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-[#f8fafc] shadow-lg shadow-[#2563eb]/30 scale-105"
                  : "text-[#9ca3af] hover:text-[#f8fafc] hover:bg-[#1e293b]/50"
              }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name - Register Only */}
            {!isLogin && (
              <div className="animate-slide-in">
                <label
                  htmlFor="fullName"
                  className="block text-sm font-semibold text-[#e5e7eb] mb-2.5"
                >
                  Full name
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`w-full px-5 py-3.5 bg-[#0f172a]/60 border ${
                      errors.fullName ? "border-[#f59e0b]" : "border-[#334155]"
                    } rounded-xl text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all duration-300 hover:border-[#475569] backdrop-blur-sm group-hover:bg-[#0f172a]/80`}
                    placeholder="Enter your full name"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#2563eb]/0 via-[#2563eb]/5 to-[#2563eb]/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
                {errors.fullName && (
                  <p className="mt-2 text-sm text-[#f59e0b] flex items-center gap-1.5 animate-shake">
                    <span>⚠️</span>
                    {errors.fullName}
                  </p>
                )}
              </div>
            )}

            {/* Email */}
            <div className="animate-slide-in animation-delay-100">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-[#e5e7eb] mb-2.5"
              >
                Email address
              </label>
              <div className="relative group">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-5 py-3.5 bg-[#0f172a]/60 border ${
                    errors.email ? "border-[#f59e0b]" : "border-[#334155]"
                  } rounded-xl text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all duration-300 hover:border-[#475569] backdrop-blur-sm group-hover:bg-[#0f172a]/80`}
                  placeholder="you@example.com"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#2563eb]/0 via-[#2563eb]/5 to-[#2563eb]/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-[#f59e0b] flex items-center gap-1.5 animate-shake">
                  <span>⚠️</span>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="animate-slide-in animation-delay-200">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-[#e5e7eb] mb-2.5"
              >
                Password
              </label>
              <div className="relative group">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-5 py-3.5 bg-[#0f172a]/60 border ${
                    errors.password ? "border-[#f59e0b]" : "border-[#334155]"
                  } rounded-xl text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all duration-300 hover:border-[#475569] backdrop-blur-sm group-hover:bg-[#0f172a]/80`}
                  placeholder="••••••••"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#2563eb]/0 via-[#2563eb]/5 to-[#2563eb]/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-[#f59e0b] flex items-center gap-1.5 animate-shake">
                  <span>⚠️</span>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password - Register Only */}
            {!isLogin && (
              <div className="animate-slide-in animation-delay-300">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-[#e5e7eb] mb-2.5"
                >
                  Confirm password
                </label>
                <div className="relative group">
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-5 py-3.5 bg-[#0f172a]/60 border ${
                      errors.confirmPassword
                        ? "border-[#f59e0b]"
                        : "border-[#334155]"
                    } rounded-xl text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all duration-300 hover:border-[#475569] backdrop-blur-sm group-hover:bg-[#0f172a]/80`}
                    placeholder="••••••••"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#2563eb]/0 via-[#2563eb]/5 to-[#2563eb]/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-[#f59e0b] flex items-center gap-1.5 animate-shake">
                    <span>⚠️</span>
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {/* Role Selection - Register Only */}
            {!isLogin && (
              <div className="animate-slide-in animation-delay-400">
                <label className="block text-sm font-semibold text-[#e5e7eb] mb-3.5">
                  Select your role
                </label>
                <div className="space-y-3">
                  {roles.map((role, index) => (
                    <label
                      key={role.value}
                      className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all duration-300 group hover:scale-[1.02] ${
                        formData.role === role.value
                          ? "border-[#2563eb] bg-gradient-to-r from-[#1e3a8a]/20 to-[#1e3a8a]/10 shadow-lg shadow-[#2563eb]/20 scale-[1.02]"
                          : "border-[#334155] hover:border-[#475569] bg-[#0f172a]/30 hover:bg-[#0f172a]/60"
                      }`}
                      style={{
                        animationDelay: `${(index + 1) * 100}ms`,
                      }}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role.value}
                        checked={formData.role === role.value}
                        onChange={handleChange}
                        className="mt-1 h-4 w-4 text-[#2563eb] border-[#334155] focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-0 bg-[#0f172a] transition-all"
                      />
                      <div className="ml-4 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl group-hover:scale-110 transition-transform">
                            {role.icon}
                          </span>
                          <div className="text-sm font-semibold text-[#f8fafc] group-hover:text-[#22d3ee] transition-colors">
                            {role.label}
                          </div>
                        </div>
                        <div className="text-xs text-[#9ca3af] mt-1.5 group-hover:text-[#cbd5e1] transition-colors">
                          {role.description}
                        </div>
                      </div>
                      {formData.role === role.value && (
                        <div className="ml-2 text-[#10b981] animate-scale-in">
                          ✓
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-4 bg-[#f59e0b]/10 border border-[#f59e0b] rounded-xl backdrop-blur-sm animate-shake">
                <p className="text-sm text-[#f59e0b] flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  {errors.submit}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="relative w-full bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:from-[#1d4ed8] hover:to-[#2563eb] text-[#f8fafc] font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-2xl hover:shadow-[#2563eb]/40 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-2 focus:ring-offset-[#1e293b] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {submitting ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Please wait...
                  </>
                ) : (
                  <>
                    {isLogin ? "Login" : "Create account"}
                    <span className="group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </button>
          </form>

          {/* Toggle Link */}
          <div className="mt-8 pt-6 border-t border-[#334155]/30 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-[#9ca3af] hover:text-[#2563eb] transition-all duration-300 hover:scale-105 inline-block"
            >
              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}
              <span className="font-semibold text-[#2563eb] hover:underline underline-offset-4">
                {isLogin ? "Register" : "Login"}
              </span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 space-y-2 animate-fade-in animation-delay-500">
          <p className="text-xs text-[#64748b] flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
            Secure authentication powered by HireHelp
          </p>
          <p className="text-xs text-[#475569]">
            Protected by industry-standard encryption
          </p>
        </div>
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        .animate-slide-in {
          animation: slide-in 0.5s ease-out;
        }
        .animation-delay-100 {
          animation-delay: 0.1s;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        .animation-delay-500 {
          animation-delay: 0.5s;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Auth;
