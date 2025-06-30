import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { DataProvider } from "@/hooks/useDataContext";
import SidebarLayout from "./layouts/SidebarLayout";
import EngineerIndex from "./pages/dashboard/engineer/Index";
import EngineerJobs from "./pages/dashboard/engineer/Jobs";
import EngineerApplications from "./pages/dashboard/engineer/Applications";
import EngineerProfile from "./pages/dashboard/engineer/Profile";
import PMIndex from "./pages/dashboard/pm/Index";
import PostJob from "./pages/dashboard/pm/PostJob";
import ManageJobs from "./pages/dashboard/pm/ManageJobs";
import Applicants from "./pages/dashboard/pm/Applicants";
import AdminIndex from "./pages/admin/Index";
import AdminEngineers from "./pages/admin/Engineers";
import AdminJobs from "./pages/admin/Jobs";
import AdminApplications from "./pages/admin/Applications";
import AdminSettings from "./pages/admin/Settings";
import AdminProjectManagers from "./pages/admin/ProjectManagers";
import EngineerVetting from "./pages/admin/EngineerVetting";
import Projects from "./pages/dashboard/pm/Projects";
import EngineerProjects from "./pages/dashboard/engineer/Projects";

function App() {
  return (
    <DataProvider>
      <Router>
        <div className="min-h-screen bg-background text-foreground">
          <Routes>
            <Route path="/" element={<SidebarLayout role="engineer"><EngineerIndex /></SidebarLayout>} />
            
            {/* Engineer Routes */}
            <Route path="/dashboard/engineer" element={<SidebarLayout role="engineer"><EngineerIndex /></SidebarLayout>} />
            <Route path="/dashboard/engineer/jobs" element={<SidebarLayout role="engineer"><EngineerJobs /></SidebarLayout>} />
            <Route path="/dashboard/engineer/applications" element={<SidebarLayout role="engineer"><EngineerApplications /></SidebarLayout>} />
            <Route path="/dashboard/engineer/profile" element={<SidebarLayout role="engineer"><EngineerProfile /></SidebarLayout>} />
            <Route path="/dashboard/engineer/projects" element={<SidebarLayout role="engineer"><EngineerProjects /></SidebarLayout>} />

            {/* Project Manager Routes */}
            <Route path="/dashboard/pm" element={<SidebarLayout role="pm"><PMIndex /></SidebarLayout>} />
            <Route path="/dashboard/pm/post-job" element={<SidebarLayout role="pm"><PostJob /></SidebarLayout>} />
            <Route path="/dashboard/pm/manage-jobs" element={<SidebarLayout role="pm"><ManageJobs /></SidebarLayout>} />
            <Route path="/dashboard/pm/applicants/:jobId" element={<SidebarLayout role="pm"><Applicants /></SidebarLayout>} />
            <Route path="/dashboard/pm/projects" element={<SidebarLayout role="pm"><Projects /></SidebarLayout>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<SidebarLayout role="admin"><AdminIndex /></SidebarLayout>} />
            <Route path="/admin/engineers" element={<SidebarLayout role="admin"><AdminEngineers /></SidebarLayout>} />
            <Route path="/admin/jobs" element={<SidebarLayout role="admin"><AdminJobs /></SidebarLayout>} />
            <Route path="/admin/applications" element={<SidebarLayout role="admin"><AdminApplications /></SidebarLayout>} />
            <Route path="/admin/settings" element={<SidebarLayout role="admin"><AdminSettings /></SidebarLayout>} />
            <Route path="/admin/project-managers" element={<SidebarLayout role="admin"><AdminProjectManagers /></SidebarLayout>} />
            <Route path="/admin/engineer-vetting" element={<SidebarLayout role="admin"><EngineerVetting /></SidebarLayout>} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </DataProvider>
  );
}

export default App;
