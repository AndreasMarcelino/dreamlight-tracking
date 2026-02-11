import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import MainLayout from "./layouts/MainLayout";

// Pages
import Login from "./pages/auth/Login";
import Profile from "./pages/profile/Profile";
import ProjectList from "./pages/projects/ProjectList";
import ProjectCreate from "./pages/projects/ProjectCreate";
import ProjectEdit from "./pages/projects/ProjectEdit";
import ProjectDetail from "./pages/projects/ProjectDetail";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import ProducerDashboard from "./pages/dashboard/ProducerDashboard";
import CrewDashboard from "./pages/dashboard/CrewDashboard";
import BroadcasterDashboard from "./pages/dashboard/BroadcasterDashboard";
import InvestorDashboard from "./pages/dashboard/InvestorDashboard";
import FinanceList from "./pages/finance/FinanceList";
import FinanceCreate from "./pages/finance/FinanceCreate";
import PayrollManagement from "./pages/finance/PayrollManagement";
import UserManagement from "./pages/users/UserManagement";

// Broadcaster Pages
import BroadcasterProjectList from "./pages/broadcaster/BroadcasterProjectList";
import BroadcasterProjectDetail from "./pages/broadcaster/BroadcasterProjectDetail";

// Protected Route Component
function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fa-solid fa-circle-notch fa-spin text-4xl text-ocean-500 mb-4"></i>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// Public Route (redirect if already logged in)
function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fa-solid fa-circle-notch fa-spin text-4xl text-ocean-500 mb-4"></i>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// Dashboard Router based on role
function DashboardRouter() {
  const { user } = useAuth();

  // Route to appropriate dashboard based on role
  if (user?.role === "admin") {
    return <AdminDashboard />;
  }

  if (user?.role === "producer") {
    return <ProducerDashboard />;
  }

  if (user?.role === "crew") {
    return <CrewDashboard />;
  }

  if (user?.role === "broadcaster") {
    return <BroadcasterDashboard />;
  }

  if (user?.role === "investor") {
    return <InvestorDashboard />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Welcome, {user?.name}!
      </h1>
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <p className="text-gray-600">
          Dashboard for{" "}
          <span className="font-bold capitalize">{user?.role}</span> role
        </p>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />

        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />

            <Route path="dashboard" element={<DashboardRouter />} />

            {/* Projects Routes (Admin & Producer only) */}
            <Route
              path="projects"
              element={
                <ProtectedRoute allowedRoles={["admin", "producer"]}>
                  <ProjectList />
                </ProtectedRoute>
              }
            />
            <Route
              path="projects/create"
              element={
                <ProtectedRoute allowedRoles={["admin", "producer"]}>
                  <ProjectCreate />
                </ProtectedRoute>
              }
            />
            <Route
              path="projects/:id"
              element={
                <ProtectedRoute allowedRoles={["admin", "producer"]}>
                  <ProjectDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="projects/:id/edit"
              element={
                <ProtectedRoute allowedRoles={["admin", "producer"]}>
                  <ProjectEdit />
                </ProtectedRoute>
              }
            />

            <Route
              path="users"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />

            <Route
              path="finance"
              element={
                <ProtectedRoute allowedRoles={["admin", "producer"]}>
                  <FinanceList />
                </ProtectedRoute>
              }
            />
            <Route
              path="finance/create"
              element={
                <ProtectedRoute allowedRoles={["admin", "producer"]}>
                  <FinanceCreate />
                </ProtectedRoute>
              }
            />
            <Route
              path="finance/payroll"
              element={
                <ProtectedRoute allowedRoles={["admin", "producer"]}>
                  <PayrollManagement />
                </ProtectedRoute>
              }
            />

            {/* Broadcaster Routes */}
            <Route
              path="broadcaster/projects"
              element={
                <ProtectedRoute allowedRoles={["broadcaster"]}>
                  <BroadcasterProjectList />
                </ProtectedRoute>
              }
            />
            <Route
              path="broadcaster/projects/:id"
              element={
                <ProtectedRoute allowedRoles={["broadcaster"]}>
                  <BroadcasterProjectDetail />
                </ProtectedRoute>
              }
            />

            {/* Profile */}
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Add more routes here as needed */}
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
