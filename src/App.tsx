
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DataProvider } from "./hooks/useDataContext";
import { AuthProvider } from "./hooks/useAuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import EngineerSignup from "./pages/EngineerSignup";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import EngineerJobs from "./pages/dashboard/engineer/Jobs";
import EngineerProjects from "./pages/dashboard/engineer/Projects";
import EngineerApplications from "./pages/dashboard/engineer/Applications";
import EngineerProfile from "./pages/dashboard/engineer/Profile";
import EngineerIndex from "./pages/dashboard/engineer/Index";
import PMIndex from "./pages/dashboard/pm/Index";
import PMPostJob from "./pages/dashboard/pm/PostJob";
import PMManageJobs from "./pages/dashboard/pm/ManageJobs";
import PMProjects from "./pages/dashboard/pm/Projects";
import PMApplicants from "./pages/dashboard/pm/Applicants";
import AdminIndex from "./pages/admin/Index";
import AdminEngineers from "./pages/admin/Engineers";
import AdminProjectManagers from "./pages/admin/ProjectManagers";
import AdminJobs from "./pages/admin/Jobs";
import AdminApplications from "./pages/admin/Applications";
import AdminEngineerVetting from "./pages/admin/EngineerVetting";
import AdminSettings from "./pages/admin/Settings";
import PMProfile from "./pages/dashboard/pm/Profile";
import AdminProfile from "./pages/admin/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route element={<PublicLayout />}>
                <Route path="/landing" element={<Landing />} />
                <Route path="/engineer-signup" element={<EngineerSignup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-otp" element={<VerifyOTP />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/onboarding" element={<Onboarding />} />
              </Route>

              {/* Dashboard Layout for all roles */}
              <Route element={<DashboardLayout />}>
                {/* Engineer Dashboard routes */}
                <Route path="/dashboard/engineer" element={
                  <ProtectedRoute requiredRole="engineer">
                    <EngineerIndex />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/engineer/jobs" element={
                  <ProtectedRoute requiredRole="engineer">
                    <EngineerJobs />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/engineer/projects" element={
                  <ProtectedRoute requiredRole="engineer">
                    <EngineerProjects />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/engineer/applications" element={
                  <ProtectedRoute requiredRole="engineer">
                    <EngineerApplications />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/engineer/profile" element={
                  <ProtectedRoute requiredRole="engineer">
                    <EngineerProfile />
                  </ProtectedRoute>
                } />

                {/* Project Manager Dashboard routes */}
                <Route path="/dashboard/pm" element={
                  <ProtectedRoute requiredRole="pm">
                    <PMIndex />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/pm/post-job" element={
                  <ProtectedRoute requiredRole="pm">
                    <PMPostJob />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/pm/manage-jobs" element={
                  <ProtectedRoute requiredRole="pm">
                    <PMManageJobs />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/pm/projects" element={
                  <ProtectedRoute requiredRole="pm">
                    <PMProjects />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/pm/applicants/:jobId" element={
                  <ProtectedRoute requiredRole="pm">
                    <PMApplicants />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/pm/profile" element={
                  <ProtectedRoute requiredRole="pm">
                    <PMProfile />
                  </ProtectedRoute>
                } />

                {/* Admin Dashboard routes */}
                <Route path="/admin" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminIndex />
                  </ProtectedRoute>
                } />
                <Route path="/admin/engineers" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminEngineers />
                  </ProtectedRoute>
                } />
                <Route path="/admin/project-managers" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminProjectManagers />
                  </ProtectedRoute>
                } />
                <Route path="/admin/jobs" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminJobs />
                  </ProtectedRoute>
                } />
                <Route path="/admin/applications" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminApplications />
                  </ProtectedRoute>
                } />
                <Route path="/admin/engineer-vetting" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminEngineerVetting />
                  </ProtectedRoute>
                } />
                <Route path="/admin/settings" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminSettings />
                  </ProtectedRoute>
                } />
                <Route path="/admin/profile" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminProfile />
                  </ProtectedRoute>
                } />
              </Route>

              {/* 404 fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
