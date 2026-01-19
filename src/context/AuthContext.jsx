import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("hirehelp_token");
      const storedUser = localStorage.getItem("hirehelp_user");

      if (token && storedUser) {
        try {
          // TODO: Uncomment when backend is ready
          // const response = await fetch('/api/auth/verify', {
          //   headers: {
          //     'Authorization': `Bearer ${token}`,
          //     'Content-Type': 'application/json'
          //   }
          // });

          // if (response.ok) {
          //   const userData = await response. json();
          //   setUser(userData. user);
          // } else {
          //   localStorage.removeItem('hirehelp_token');
          //   localStorage.removeItem('hirehelp_user');
          //   setUser(null);
          // }

          // Mock:  Load user from localStorage
          setUser(JSON.parse(storedUser));
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
      // TODO: Uncomment when backend is ready
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers:  { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password })
      // });

      // const data = await response.json();

      // if (! response.ok) {
      //   throw new Error(data.message || 'Login failed');
      // }

      // Mock login - accept any credentials
      const mockUser = {
        _id: "mock-user-id",
        email: email,
        fullName: "Demo User",
        role: "recruiter", // See Admin Dashboard
      };

      const mockToken = "mock-jwt-token-" + Date.now();

      // Store token and user data
      localStorage.setItem("hirehelp_token", mockToken);
      localStorage.setItem("hirehelp_user", JSON.stringify(mockUser));
      setUser(mockUser);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (formData) => {
    try {
      // TODO: Uncomment when backend is ready
      // const response = await fetch('/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body:  JSON.stringify(formData)
      // });

      // const data = await response.json();

      // if (!response.ok) {
      //   throw new Error(data.message || 'Registration failed');
      // }

      // Mock registration
      const mockUser = {
        _id: "mock-user-id-" + Date.now(),
        email: formData.email,
        fullName: formData.fullName,
        role: formData.role,
      };

      const mockToken = "mock-jwt-token-" + Date.now();

      // Store token and user data
      localStorage.setItem("hirehelp_token", mockToken);
      localStorage.setItem("hirehelp_user", JSON.stringify(mockUser));
      setUser(mockUser);

      return { success: true };
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
