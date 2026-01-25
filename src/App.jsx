import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { JobProvider } from "./context/JobContext";

// Pages
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import RecruiterDashboard from "./pages/dashboard/RecruiterDashboard";
import ApplicantDashboard from "./pages/dashboard/ApplicantDashboard";
import JobCreate from "./pages/JobCreate";
import JobDetails from "./pages/JobDetails";
import JobList from "./pages/JobList";
import ApplicantProfile from "./pages/ApplicantProfile";
import CandidateShortlist from "./pages/CandidateShortlist";
import HiringWorkflow from "./pages/HiringWorkflow";

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b1220] to-[#111827] flex items-center justify-center">
        <div className="text-[#f8fafc] font-mono">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Dashboard Router - redirects based on role
const DashboardRouter = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/auth" replace />;

  switch (user.role) {
    case "admin":
      return <AdminDashboard />;
    case "recruiter":
      return <RecruiterDashboard />;
    case "applicant":
      return <ApplicantDashboard />;
    default:
      return <Navigate to="/auth" replace />;
  }
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <JobProvider>
            <Routes>
              {/* Public Route */}
              <Route path="/auth" element={<Auth />} />

              {/* Protected Dashboard Route */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardRouter />
                  </ProtectedRoute>
                }
              />

              {/* Job Management Routes */}
              <Route
                path="/jobs"
                element={
                  <ProtectedRoute>
                    <JobList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/jobs/create"
                element={
                  <ProtectedRoute allowedRoles={["admin", "recruiter"]}>
                    <JobCreate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/jobs/:jobId"
                element={
                  <ProtectedRoute>
                    <JobDetails />
                  </ProtectedRoute>
                }
              />

              {/* Applicant Profile Route */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={["applicant"]}>
                    <ApplicantProfile />
                  </ProtectedRoute>
                }
              />

              {/* Candidate Shortlisting Route */}
              <Route
                path="/jobs/:jobId/shortlist"
                element={
                  <ProtectedRoute allowedRoles={["admin", "recruiter"]}>
                    <CandidateShortlist />
                  </ProtectedRoute>
                }
              />

              {/* Hiring Workflow Route */}
              <Route
                path="/jobs/:jobId/candidates/:candidateId"
                element={
                  <ProtectedRoute allowedRoles={["admin", "recruiter"]}>
                    <HiringWorkflow />
                  </ProtectedRoute>
                }
              />

              {/* Default Redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </JobProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
