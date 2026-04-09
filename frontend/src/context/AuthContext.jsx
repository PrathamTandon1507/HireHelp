import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("hirehelp_token");

      if (token) {
        try {
          const userData = await api.auth.me();
          setUser(userData);
        } catch (error) {
          console.error("Auth check failed:", error);
          localStorage.removeItem("hirehelp_token");
          localStorage.removeItem("hirehelp_user");
          setUser(null);
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await api.auth.login({ email, password });

      // Store token and initial user info
      localStorage.setItem("hirehelp_token", data.access_token || data.accessToken);
      
      // Fetch full user profile after login
      const userData = await api.auth.me();
      localStorage.setItem("hirehelp_user", JSON.stringify(userData));
      setUser(userData);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (formData) => {
    try {
      await api.auth.register({
        email: formData.email,
        full_name: formData.fullName,
        password: formData.password,
        role: formData.role,
        company_name: formData.companyName
      });

      // Automatically log in after registration
      return await login(formData.email, formData.password);
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem("hirehelp_token");
    localStorage.removeItem("hirehelp_user");
    setUser(null);
    window.location.href = "/auth";
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem("hirehelp_user", JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isRecruiter: user?.role === "recruiter",
    isApplicant: user?.role === "applicant",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
