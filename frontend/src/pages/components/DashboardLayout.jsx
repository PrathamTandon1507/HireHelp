import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import LoadingOverlay from "./LoadingOverlay";

const DashboardLayout = ({ children, title, subtitle, loading = false, loadingMessage, loadingSubtext }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const [notifs, countData] = await Promise.all([
        api.notifications.list(),
        api.notifications.getUnreadCount()
      ]);
      setNotifications(notifs);
      setUnreadCount(countData.unreadCount);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await api.notifications.markAsRead(notification.id);
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
        );
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }
    
    if (notification.link) {
      navigate(notification.link);
      setShowNotifications(false);
    }
  };

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

  const handleNavigation = (path) => {
    console.log("Navigating to:", path);
    navigate(path);
  };

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
              onClick={() => handleNavigation(item.path)}
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
        <header className="sticky top-0 bg-gradient-to-r from-[#0f172a]/90 to-[#020617]/90 backdrop-blur-xl border-b border-[#334155]/30 shadow-lg shadow-black/10 z-40">
      <div className="px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#f8fafc] mb-0.5">{title}</h1>
          {subtitle && <p className="text-xs text-[#9ca3af]">{subtitle}</p>}
        </div>

        {/* Notifications & User Actions */}
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 rounded-lg border transition-all duration-200 ${
                unreadCount > 0 
                  ? "border-[#2563eb]/40 bg-[#2563eb]/10 text-[#22d3ee] animate-pulse-subtle" 
                  : "border-[#334155]/40 text-[#9ca3af] hover:text-[#f8fafc] hover:bg-[#1e293b]/40"
              }`}
            >
              <span className="text-xl">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ef4444] text-[10px] font-bold text-white flex items-center justify-center shadow-lg border-2 border-[#0f172a]">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute top-full right-0 mt-3 w-80 rounded-xl bg-[#1e293b] border border-[#334155] shadow-2xl shadow-black overflow-hidden animate-slide-down">
                <div className="p-4 border-b border-[#334155] flex items-center justify-between">
                  <h3 className="font-semibold text-[#f8fafc]">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs text-[#22d3ee]">{unreadCount} unread</span>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-[#9ca3af] text-sm italic">
                      No new updates
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-4 border-b border-[#334155]/50 hover:bg-[#2563eb]/10 cursor-pointer transition-colors ${
                          !notif.isRead ? "bg-[#2563eb]/5" : ""
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                            notif.type === "success" ? "bg-[#10b981]" : "bg-[#2563eb]"
                          } ${!notif.isRead ? "animate-pulse" : "opacity-0"}`} />
                          <div>
                            <p className="text-sm text-[#f8fafc] leading-snug mb-1">
                              {notif.message}
                            </p>
                            <p className="text-[10px] text-[#9ca3af]">
                              {new Date(notif.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Existing User Profile / Info can go here if needed, 
              but the sidebar already has it. */}
        </div>
      </div>
    </header>

        {/* Content */}
        <main className="p-8">{children}</main>
      </div>

      {/* Global Loader */}
      {loading && <LoadingOverlay message={loadingMessage} subtext={loadingSubtext} />}

      {/* CSS for custom animations */}
      <style>{`
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes slide-down {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
        .animate-pulse-slower {
          animation: pulse-slower 12s ease-in-out infinite;
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
        .animate-slide-down {
          animation: slide-down 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
