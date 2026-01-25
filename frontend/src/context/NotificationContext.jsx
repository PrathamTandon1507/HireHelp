import { createContext, useContext, useState, useCallback } from "react";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback(
    (message, type = "info", duration = 5000) => {
      const id = Date.now() + Math.random();

      setNotifications((prev) => [...prev, { id, message, type }]);

      if (duration) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }

      return id;
    },
    []
  );

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  const success = useCallback(
    (message, duration) => {
      return addNotification(message, "success", duration);
    },
    [addNotification]
  );

  const error = useCallback(
    (message, duration) => {
      return addNotification(message, "error", duration);
    },
    [addNotification]
  );

  const warning = useCallback(
    (message, duration) => {
      return addNotification(message, "warning", duration);
    },
    [addNotification]
  );

  const info = useCallback(
    (message, duration) => {
      return addNotification(message, "info", duration);
    },
    [addNotification]
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        success,
        error,
        warning,
        info,
      }}
    >
      {children}
      <NotificationContainer
        notifications={notifications}
        onClose={removeNotification}
      />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
};

// Notification Display Component
const NotificationContainer = ({ notifications, onClose }) => {
  if (notifications.length === 0) return null;

  const typeConfig = {
    success: {
      bg: "from-[#10b981]/20 to-[#14b8a6]/10",
      border: "border-[#10b981]/40",
      icon: "✓",
      iconBg: "from-[#10b981] to-[#14b8a6]",
    },
    error: {
      bg: "from-[#b91c1c]/20 to-[#dc2626]/10",
      border: "border-[#b91c1c]/40",
      icon: "✕",
      iconBg: "from-[#b91c1c] to-[#dc2626]",
    },
    warning: {
      bg: "from-[#f59e0b]/20 to-[#f59e0b]/10",
      border: "border-[#f59e0b]/40",
      icon: "⚠",
      iconBg: "from-[#f59e0b] to-[#fb923c]",
    },
    info: {
      bg: "from-[#2563eb]/20 to-[#3b82f6]/10",
      border: "border-[#2563eb]/40",
      icon: "ℹ",
      iconBg: "from-[#2563eb] to-[#3b82f6]",
    },
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3 max-w-md">
      {notifications.map((notif) => {
        const config = typeConfig[notif.type] || typeConfig.info;

        return (
          <div
            key={notif.id}
            className={`relative rounded-xl bg-gradient-to-br ${config.bg} border ${config.border} overflow-hidden shadow-2xl shadow-black/40 backdrop-blur-xl animate-slide-in`}
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>

            <div className="relative p-4 flex items-start gap-3">
              <div
                className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.iconBg} flex items-center justify-center text-[#f8fafc] font-bold shadow-lg flex-shrink-0`}
              >
                {config.icon}
              </div>
              <p className="text-sm text-[#f8fafc] flex-1 pt-1">
                {notif.message}
              </p>
              <button
                onClick={() => onClose(notif.id)}
                className="text-[#9ca3af] hover:text-[#f8fafc] transition-colors flex-shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0f172a]/30">
              <div
                className={`h-full bg-gradient-to-r ${config.iconBg} animate-progress`}
              ></div>
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes progress {
          from { width: 100%; }
          to { width:  0%; }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        .animate-progress {
          animation: progress 5s linear;
        }
      `}</style>
    </div>
  );
};
