
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { ChatProvider } from "./hooks/contexts/ChatContext";
import { AuthProvider } from "./hooks/useAuthContext";
import { DataProvider } from "./hooks/useDataContext";
import DashboardLayout from "./layouts/DashboardLayout";
import PublicLayout from "./layouts/PublicLayout";
import EngineerSignup from "./pages/EngineerSignup";
import ForgotPassword from "./pages/ForgotPassword";
import GoogleAuthHandler from "./pages/GoogleAuthHandler";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import ResetPassword from "./pages/ResetPassword";
import VerifyOTP from "./pages/VerifyOTP";
import AdminApplications from "./pages/dashboard/admin/Applications";
import AdminEngineerVetting from "./pages/dashboard/admin/EngineerVetting";
import AdminEngineers from "./pages/dashboard/admin/Engineers";
import AdminIndex from "./pages/dashboard/admin/Index";
import AdminJobs from "./pages/dashboard/admin/Jobs";
import AdminMessages from "./pages/dashboard/admin/Messages";
import AdminProfile from "./pages/dashboard/admin/Profile";
import AdminProjectManagers from "./pages/dashboard/admin/ProjectManagers";
import AdminSettings from "./pages/dashboard/admin/Settings";
import EngineerApplications from "./pages/dashboard/engineer/Applications";
import EngineerIndex from "./pages/dashboard/engineer/Index";
import EngineerInterviews from "./pages/dashboard/engineer/Interviews";
import EngineerJobs from "./pages/dashboard/engineer/Jobs";
import EngineerMessages from "./pages/dashboard/engineer/Messages";
import EngineerProfile from "./pages/dashboard/engineer/Profile";
import EngineerProjects from "./pages/dashboard/engineer/Projects";
import PMApplicants from "./pages/dashboard/pm/Applicants";
import PMApplications from "./pages/dashboard/pm/Applications";
import PMIndex from "./pages/dashboard/pm/Index";
import PMInterviews from "./pages/dashboard/pm/Interviews";
import PMManageJobs from "./pages/dashboard/pm/ManageJobs";
import PMMessages from "./pages/dashboard/pm/Messages";
import PMPostJob from "./pages/dashboard/pm/PostJob";
import PMProfile from "./pages/dashboard/pm/Profile";
import PMProjects from "./pages/dashboard/pm/Projects";
import AcceptInvite from "./pages/AcceptInvites";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DataProvider>
        <ChatProvider>
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
                  <Route path="/accept-invite" element={<AcceptInvite />} />
                    <Route path="/onboarding" element={
                      <ProtectedRoute requiredRole="engineer">
                        <Onboarding />
                      </ProtectedRoute>
                    } />
                    <Route path="/google-auth" element={<GoogleAuthHandler />} />
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
                    <Route path="/dashboard/engineer/interviews" element={
                      <ProtectedRoute requiredRole="engineer">
                        <EngineerInterviews />
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard/engineer/messages" element={
                      <ProtectedRoute requiredRole="engineer">
                        <EngineerMessages />
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard/engineer/profile" element={
                      <ProtectedRoute requiredRole="engineer">
                        <EngineerProfile />
                      </ProtectedRoute>
                    } />

                    {/* Project Manager Dashboard routes */}
                    <Route path="/dashboard/pm" element={
                      <ProtectedRoute requiredRole="project_manager">
                        <PMIndex />
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard/pm/post-job" element={
                      <ProtectedRoute requiredRole="project_manager">
                        <PMPostJob />
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard/pm/manage-jobs" element={
                      <ProtectedRoute requiredRole="project_manager">
                        <PMManageJobs />
                      </ProtectedRoute>
                    } />
                  <Route path="/dashboard/pm/engineers" element={
                    <ProtectedRoute requiredRole="project_manager">
                      <AdminEngineers />
                    </ProtectedRoute>
                  } />
                    <Route path="/dashboard/pm/projects" element={
                      <ProtectedRoute requiredRole="project_manager">
                        <PMProjects />
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard/pm/applicants/:jobId" element={
                      <ProtectedRoute requiredRole="project_manager">
                        <PMApplicants />
                      </ProtectedRoute>
                    } />
                  <Route path="/dashboard/pm/applications" element={
                    <ProtectedRoute requiredRole="project_manager">
                      <PMApplications />
                    </ProtectedRoute>
                  } />
                    <Route path="/dashboard/pm/interviews" element={
                      <ProtectedRoute requiredRole="project_manager">
                        <PMInterviews />
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard/pm/messages" element={
                      <ProtectedRoute requiredRole="project_manager">
                        <PMMessages />
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard/pm/profile" element={
                      <ProtectedRoute requiredRole="project_manager">
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
                    <Route path="/admin/messages" element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminMessages />
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
        </ChatProvider>
      </DataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
