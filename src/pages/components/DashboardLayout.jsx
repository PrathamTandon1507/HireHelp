import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const DashboardLayout = ({ children, title, subtitle }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navigation = {
    admin: [
      { name: "Dashboard", path: "/dashboard", icon: "◆" },
      { name: "All Jobs", path: "/jobs", icon: "◇" },
      { name: "Create Job", path: "/jobs/create", icon: "+" },
    ],
    recruiter: [
      { name: "Dashboard", path: "/dashboard", icon: "◆" },
      { name: "All Jobs", path: "/jobs", icon: "◇" },
      { name: "Create Job", path: "/jobs/create", icon: "+" },
    ],
    applicant: [
      { name: "Dashboard", path: "/dashboard", icon: "◆" },
      { name: "Browse Jobs", path: "/jobs", icon: "◇" },
      { name: "Profile", path: "/profile", icon: "●" },
    ],
  };

  const navItems = navigation[user?.role] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1220] via-[#0f172a] to-[#020617] relative overflow-hidden">
      {/* Atmospheric Background Effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#2563eb] rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#10b981] rounded-full blur-[120px] animate-pulse-slower"></div>
      </div>

      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-[#0f172a]/80 to-[#020617]/80 backdrop-blur-xl border-r border-[#334155]/30 z-50">
        {/* Logo */}
        <div className="p-6 border-b border-[#334155]/30">
          <h1 className="text-2xl font-bold text-[#f8fafc] mb-1">HireHelp</h1>
          <p className="text-xs font-mono text-[#22d3ee]">AI Recruitment</p>
        </div>

        {/* User Info */}
        <div className="p-4 mx-4 mt-4 rounded-lg bg-gradient-to-br from-[#1e293b]/60 to-[#0f172a]/60 border border-[#334155]/40 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2563eb] to-[#3b82f6] flex items-center justify-center text-[#f8fafc] font-semibold shadow-lg shadow-[#2563eb]/20">
              {user?.fullName?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#f8fafc] truncate">
                {user?.fullName}
              </p>
              <p className="text-xs text-[#9ca3af] capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 mt-4">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#e5e7eb] hover:text-[#f8fafc] rounded-lg hover:bg-gradient-to-r hover:from-[#2563eb]/20 hover:to-[#3b82f6]/10 transition-all duration-200 group"
            >
              <span className="text-[#22d3ee] group-hover:scale-110 transition-transform duration-200">
                {item.icon}
              </span>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-6 left-4 right-4">
          <button
            onClick={logout}
            className="w-full px-4 py-2.5 text-sm font-medium text-[#9ca3af] hover:text-[#f8fafc] rounded-lg border border-[#334155]/40 hover:border-[#475569] hover:bg-[#1e293b]/40 transition-all duration-200"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64 relative z-10">
        {/* Header */}
        <header className="sticky top-0 bg-gradient-to-r from-[#0f172a]/90 to-[#020617]/90 backdrop-blur-xl border-b border-[#334155]/30 shadow-lg shadow-black/10 z-40">
          <div className="px-8 py-6">
            <h1 className="text-2xl font-bold text-[#f8fafc] mb-1">{title}</h1>
            {subtitle && <p className="text-sm text-[#9ca3af]">{subtitle}</p>}
          </div>
        </header>

        {/* Content */}
        <main className="p-8">{children}</main>
      </div>

      {/* CSS for custom animations */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }
        @keyframes pulse-slower {
          0%, 100% { opacity:  0.2; }
          50% { opacity: 0.4; }
        }
        . animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
        .animate-pulse-slower {
          animation: pulse-slower 12s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
