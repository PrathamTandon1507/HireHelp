import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
          submit: result.error || "Authentication failed.  Please try again.",
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
    <div className="min-h-screen bg-gradient-to-br from-[#0b1220] to-[#111827] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#f8fafc] mb-2">HireHelp</h1>
          <p className="text-[#9ca3af] text-sm font-mono">
            AI-Assisted Recruitment Platform
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-[#1e293b] rounded-lg shadow-xl p-8">
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6 p-1 bg-[#0f172a] rounded-lg">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                isLogin
                  ? "bg-[#2563eb] text-[#f8fafc] shadow-md"
                  : "text-[#9ca3af] hover:text-[#f8fafc]"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                !isLogin
                  ? "bg-[#2563eb] text-[#f8fafc] shadow-md"
                  : "text-[#9ca3af] hover:text-[#f8fafc]"
              }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name - Register Only */}
            {!isLogin && (
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-[#e5e7eb] mb-2"
                >
                  Full name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 bg-[#0f172a] border ${
                    errors.fullName ? "border-[#f59e0b]" : "border-[#334155]"
                  } rounded-lg text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all`}
                  placeholder="Enter your full name"
                />
                {errors.fullName && (
                  <p className="mt-1.5 text-sm text-[#f59e0b]">
                    {errors.fullName}
                  </p>
                )}
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#e5e7eb] mb-2"
              >
                Email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-[#0f172a] border ${
                  errors.email ? "border-[#f59e0b]" : "border-[#334155]"
                } rounded-lg text-[#f8fafc] placeholder-[#64748b] focus: outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1.5 text-sm text-[#f59e0b]">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#e5e7eb] mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-[#0f172a] border ${
                  errors.password ? "border-[#f59e0b]" : "border-[#334155]"
                } rounded-lg text-[#f8fafc] placeholder-[#64748b] focus: outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1.5 text-sm text-[#f59e0b]">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password - Register Only */}
            {!isLogin && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-[#e5e7eb] mb-2"
                >
                  Confirm password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 bg-[#0f172a] border ${
                    errors.confirmPassword
                      ? "border-[#f59e0b]"
                      : "border-[#334155]"
                  } rounded-lg text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus: ring-2 focus:ring-[#2563eb] focus: border-transparent transition-all`}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-sm text-[#f59e0b]">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {/* Role Selection - Register Only */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-[#e5e7eb] mb-3">
                  Select your role
                </label>
                <div className="space-y-2">
                  {roles.map((role) => (
                    <label
                      key={role.value}
                      className={`flex items-start p-3 border rounded-lg cursor-pointer transition-all ${
                        formData.role === role.value
                          ? "border-[#2563eb] bg-[#1e3a8a]/10"
                          : "border-[#334155] hover:border-[#475569]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role.value}
                        checked={formData.role === role.value}
                        onChange={handleChange}
                        className="mt-0.5 h-4 w-4 text-[#2563eb] border-[#334155] focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-0 bg-[#0f172a]"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-[#f8fafc]">
                          {role.label}
                        </div>
                        <div className="text-xs text-[#9ca3af] mt-0.5">
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
              <div className="p-3 bg-[#f59e0b]/10 border border-[#f59e0b] rounded-lg">
                <p className="text-sm text-[#f59e0b]">{errors.submit}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-[#f8fafc] font-medium py-2. 5 px-4 rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-2 focus:ring-offset-[#1e293b] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {submitting
                ? "Please wait..."
                : isLogin
                ? "Login"
                : "Create account"}
            </button>
          </form>

          {/* Toggle Link */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-[#9ca3af] hover:text-[#2563eb] transition-colors"
            >
              {isLogin
                ? "Don't have an account?  "
                : "Already have an account? "}
              <span className="font-medium text-[#2563eb]">
                {isLogin ? "Register" : "Login"}
              </span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#64748b] mt-6">
          Secure authentication powered by HireHelp
        </p>
      </div>
    </div>
  );
};

export default Auth;
