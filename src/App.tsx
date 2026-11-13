import ChatAlerts from "@/components/chat/ChatAlerts";

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
import AcceptInvite from "./pages/AcceptInvites";
import TalentSignup from "./pages/TalentSignup";
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
import AdminTalentVetting from "./pages/dashboard/admin/TalentVetting";
import AdminTalents from "./pages/dashboard/admin/Talents";
import AdminIndex from "./pages/dashboard/admin/Index";
import AdminJobs from "./pages/dashboard/admin/Jobs";
import AdminMessages from "./pages/dashboard/admin/Messages";
import AdminProfile from "./pages/dashboard/admin/Profile";
import AdminProjectManagers from "./pages/dashboard/admin/ProjectManagers";
import AdminProjects from "./pages/dashboard/admin/Projects";
import AdminRoles from "./pages/dashboard/admin/Roles";
import AdminSettings from "./pages/dashboard/admin/Settings";
import AdminWorkforce from "./pages/dashboard/admin/Workforce";
import TalentApplications from "./pages/dashboard/talent/Applications";
import TalentIndex from "./pages/dashboard/talent/Index";
import TalentInterviews from "./pages/dashboard/talent/Interviews";
import TalentInvoicesPage from "./pages/dashboard/talent/Invoices";
import TalentJobs from "./pages/dashboard/talent/Jobs";
import TalentMessages from "./pages/dashboard/talent/Messages";
import TalentProfile from "./pages/dashboard/talent/Profile";
import TalentProjects from "./pages/dashboard/talent/Projects";
import PMApplicants from "./pages/dashboard/pm/Applicants";
import PMApplications from "./pages/dashboard/pm/Applications";
import PMIndex from "./pages/dashboard/pm/Index";
import PMInterviews from "./pages/dashboard/pm/Interviews";
import PMManageJobs from "./pages/dashboard/pm/ManageJobs";
import PMMessages from "./pages/dashboard/pm/Messages";
import PMPostJob from "./pages/dashboard/pm/PostJob";
import PMProfile from "./pages/dashboard/pm/Profile";
import PMProjectInvoicePage from "./pages/dashboard/pm/ProjectInvoices";
import PMProjects from "./pages/dashboard/pm/Projects";
import StaffAttendance from "./pages/dashboard/staff/Attendance";
import StaffApprovals from "./pages/dashboard/staff/Approvals";
import StaffExpenses from "./pages/dashboard/staff/Expenses";
import StaffHolidays from "./pages/dashboard/staff/Holidays";
import StaffDashboard from "./pages/dashboard/staff/Index";
import StaffKpis from "./pages/dashboard/staff/KPIs";
import StaffLeave from "./pages/dashboard/staff/Leave";
import StaffProfile from "./pages/dashboard/staff/Profile";
import MessagesPage from "./pages/dashboard/Messages";

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
                <ChatAlerts>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route element={<PublicLayout />}>
                    <Route path="/landing" element={<Landing />} />
                    <Route path="/talent-signup" element={<TalentSignup />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/verify-otp" element={<VerifyOTP />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/accept-invite" element={<AcceptInvite />} />
                    <Route path="/onboarding" element={
                      <ProtectedRoute requiredRole="talent">
                        <Onboarding />
                      </ProtectedRoute>
                    } />
                    <Route path="/google-auth" element={<GoogleAuthHandler />} />
                  </Route>

                  {/* Dashboard Layout for all roles */}
                  <Route element={<DashboardLayout />}>
                    {/* Talent Dashboard routes */}
                    <Route path="/dashboard/talent" element={
                      <ProtectedRoute requiredRole="talent">
                        <TalentIndex />
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard/talent/jobs" element={
                      <ProtectedRoute requiredRole="talent">
                        <TalentJobs />
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard/talent/projects" element={
                      <ProtectedRoute requiredRole="talent">
                        <TalentProjects />
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard/talent/applications" element={
                      <ProtectedRoute requiredRole="talent">
                        <TalentApplications />
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard/talent/interviews" element={
                      <ProtectedRoute requiredRole="talent">
                        <TalentInterviews />
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard/talent/invoices" element={
                      <ProtectedRoute requiredRole="talent">
                        <TalentInvoicesPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard/talent/messages" element={
                      <ProtectedRoute requiredRole="talent">
                        <TalentMessages />
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard/talent/profile" element={
                      <ProtectedRoute requiredRole="talent">
                        <TalentProfile />
                      </ProtectedRoute>
                    } />

                    {/* Staff Dashboard routes */}
                    <Route path="/dashboard/staff/messages" element={
                      <ProtectedRoute requiredRole="staff"><MessagesPage /></ProtectedRoute>
                    } />
                    <Route path="/dashboard/staff" element={
                      <ProtectedRoute requiredRole="staff">
                        <StaffDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard/staff/attendance" element={
                      <ProtectedRoute requiredRole="staff">
                        <StaffAttendance />
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard/staff/approvals" element={
                      <ProtectedRoute requiredRole="staff">
                        <StaffApprovals />
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard/staff/leave" element={
                      <ProtectedRoute requiredRole="staff">
                        <StaffLeave />
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard/staff/expenses" element={
                      <ProtectedRoute requiredRole="staff">
                        <StaffExpenses />
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard/staff/kpis" element={
                      <ProtectedRoute requiredRole="staff">
                        <StaffKpis />
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard/staff/holidays" element={
                      <ProtectedRoute requiredRole="staff">
                        <StaffHolidays />
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard/staff/profile" element={
                      <ProtectedRoute requiredRole="staff">
                        <StaffProfile />
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
                  <Route path="/dashboard/pm/talents" element={
                    <ProtectedRoute requiredRole="project_manager">
                      <AdminTalents />
                    </ProtectedRoute>
                  } />
                    <Route path="/dashboard/pm/projects" element={
                      <ProtectedRoute requiredRole="project_manager">
                        <PMProjects />
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard/pm/project-invoices" element={
                      <ProtectedRoute requiredRole="project_manager">
                        <PMProjectInvoicePage />
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard/pm/attendance" element={
                      <ProtectedRoute requiredRole="project_manager"><StaffAttendance /></ProtectedRoute>
                    } />
                    <Route path="/dashboard/pm/leave" element={
                      <ProtectedRoute requiredRole="project_manager"><StaffLeave /></ProtectedRoute>
                    } />
                    <Route path="/dashboard/pm/expenses" element={
                      <ProtectedRoute requiredRole="project_manager"><StaffExpenses /></ProtectedRoute>
                    } />
                    <Route path="/dashboard/pm/kpis" element={
                      <ProtectedRoute requiredRole="project_manager"><StaffKpis /></ProtectedRoute>
                    } />
                    <Route path="/dashboard/pm/holidays" element={
                      <ProtectedRoute requiredRole="project_manager"><StaffHolidays /></ProtectedRoute>
                    } />
                    <Route path="/dashboard/pm/approvals" element={
                      <ProtectedRoute requiredRole="project_manager"><StaffApprovals /></ProtectedRoute>
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
                      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
                        <AdminIndex />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/talents" element={
                      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
                        <AdminTalents />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/project-managers" element={
                      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
                        <AdminProjectManagers />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/projects" element={
                      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
                        <AdminProjects />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/roles" element={
                      <ProtectedRoute requiredRole="super_admin">
                        <AdminRoles />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/workforce" element={
                      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
                        <AdminWorkforce />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/jobs" element={
                      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
                        <AdminJobs />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/applications" element={
                      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
                        <AdminApplications />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/talent-vetting" element={
                      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
                        <AdminTalentVetting />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/messages" element={
                      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
                        <AdminMessages />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/settings" element={
                      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
                        <AdminSettings />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/profile" element={
                      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
                        <AdminProfile />
                      </ProtectedRoute>
                    } />
                  </Route>

                  {/* 404 fallback */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ChatAlerts>
              </BrowserRouter>
            </TooltipProvider>
        </ChatProvider>
      </DataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
