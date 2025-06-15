import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import EngineerSignup from "./pages/EngineerSignup";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import EngineerJobs from "./pages/dashboard/engineer/Jobs";
import EngineerApplications from "./pages/dashboard/engineer/Applications";
import EngineerProfile from "./pages/dashboard/engineer/Profile";
import EngineerIndex from "./pages/dashboard/engineer/Index";
import PMIndex from "./pages/dashboard/pm/Index";
import PMPostJob from "./pages/dashboard/pm/PostJob";
import PMManageJobs from "./pages/dashboard/pm/ManageJobs";
import PMApplicants from "./pages/dashboard/pm/Applicants";
import AdminIndex from "./pages/admin/Index";
import AdminEngineers from "./pages/admin/Engineers";
import AdminJobs from "./pages/admin/Jobs";
import AdminApplications from "./pages/admin/Applications";
import AdminSettings from "./pages/admin/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
            <Route path="/onboarding" element={<Onboarding />} />
          </Route>

          {/* Engineer Dashboard routes */}
          <Route path="/dashboard/engineer" element={<EngineerIndex />} />
          <Route path="/dashboard/engineer/jobs" element={<EngineerJobs />} />
          <Route path="/dashboard/engineer/applications" element={<EngineerApplications />} />
          <Route path="/dashboard/engineer/profile" element={<EngineerProfile />} />

          {/* Project Manager Dashboard routes */}
          <Route path="/dashboard/pm" element={<PMIndex />} />
          <Route path="/dashboard/pm/post-job" element={<PMPostJob />} />
          <Route path="/dashboard/pm/manage-jobs" element={<PMManageJobs />} />
          <Route path="/dashboard/pm/applicants/:jobId" element={<PMApplicants />} />

          {/* Admin Dashboard routes */}
          <Route path="/admin" element={<AdminIndex />} />
          <Route path="/admin/engineers" element={<AdminEngineers />} />
          <Route path="/admin/jobs" element={<AdminJobs />} />
          <Route path="/admin/applications" element={<AdminApplications />} />
          <Route path="/admin/settings" element={<AdminSettings />} />

          {/* 404 fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
