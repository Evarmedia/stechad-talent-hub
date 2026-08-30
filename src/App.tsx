
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
import AdminProjects from "./pages/dashboard/admin/Projects";
import AdminSettings from "./pages/dashboard/admin/Settings";
import AdminWorkforce from "./pages/dashboard/admin/Workforce";
import EngineerApplications from "./pages/dashboard/engineer/Applications";
import EngineerIndex from "./pages/dashboard/engineer/Index";
import EngineerInterviews from "./pages/dashboard/engineer/Interviews";
import EngineerInvoicesPage from "./pages/dashboard/engineer/Invoices";
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
import PMProjectInvoicePage from "./pages/dashboard/pm/ProjectInvoices";
import PMProjects from "./pages/dashboard/pm/Projects";
import StaffAttendance from "./pages/dashboard/staff/Attendance";
import StaffApprovals from "./pages/dashboard/staff/Approvals";
import StaffExpenses from "./pages/dashboard/staff/Expenses";
import StaffHolidays from "./pages/dashboard/staff/Holidays";
import StaffDashboard from "./pages/dashboard/staff/Index";
import StaffInvoices from "./pages/dashboard/staff/Invoices";
import StaffKpis from "./pages/dashboard/staff/KPIs";
import StaffLeave from "./pages/dashboard/staff/Leave";
import StaffProfile from "./pages/dashboard/staff/Profile";

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
                    <Route path="/dashboard/engineer/invoices" element={
                      <ProtectedRoute requiredRole="engineer">
                        <EngineerInvoicesPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard/engineer/attendance" element={
                      <ProtectedRoute requiredRole="engineer"><StaffAttendance /></ProtectedRoute>
                    } />
                    <Route path="/dashboard/engineer/leave" element={
                      <ProtectedRoute requiredRole="engineer"><StaffLeave /></ProtectedRoute>
                    } />
                    <Route path="/dashboard/engineer/expenses" element={
                      <ProtectedRoute requiredRole="engineer"><StaffExpenses /></ProtectedRoute>
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

                    {/* Staff Dashboard routes */}
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
                    <Route path="/dashboard/staff/invoices" element={
                      <ProtectedRoute requiredRole="staff">
                        <StaffInvoices />
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
                    <Route path="/admin/engineers" element={
                      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
                        <AdminEngineers />
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
                    <Route path="/admin/engineer-vetting" element={
                      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
                        <AdminEngineerVetting />
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
              </BrowserRouter>
            </TooltipProvider>
        </ChatProvider>
      </DataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
