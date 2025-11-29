import { useAuthContext } from "@/hooks/useAuthContext";
import { useDataContext } from "@/hooks/useDataContext";
import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import AccountOverview from "./components/AccountOverview";
import CurrentProjects from "./components/CurrentProjects";
import DashboardStats from "./components/DashboardStats";
import QuickActions from "./components/QuickActions";
import RecentApplications from "./components/RecentApplications";



const EngineerDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [recentApplicationsCount, setRecentApplicationsCount] = useState(0);
  const [scheduledInterviewCount, setScheduledInterviewCount] = useState(0);
  const [activeProjectsCount, setActiveProjectsCount] = useState(0);
  const [interviewCount, setInterviewCount] = useState(0);

  const { engrDashboardData, loading } = useDataContext();
  const { user } = useAuthContext();
  

  useEffect(() => {
    if (engrDashboardData) {
      setRecentApplicationsCount(engrDashboardData.statistics.recentApplicationsCount);
      setScheduledInterviewCount(engrDashboardData.statistics.scheduledInterviewCount);
      setActiveProjectsCount(engrDashboardData.statistics.activeProjectsCount);
      setInterviewCount(engrDashboardData.statistics.interviewCount);
      setRecentApplications(engrDashboardData.recentApplications);
      setProjects(engrDashboardData.activeProjects);
    }
  }, [engrDashboardData]);

  return (
    <div className="py-8 max-w-6xl mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-primary">Engineer Dashboard</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Last updated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <DashboardStats
        loading={loading}
        applications={recentApplicationsCount}
        scheduledInterviews={scheduledInterviewCount}
        activeProjects={activeProjectsCount}
        totalInterviewCount={interviewCount}
        recentApplications={recentApplications.length}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <AccountOverview loading={loading} user={user} />
        <RecentApplications loading={loading} applications={recentApplications} />
      </div>

      <CurrentProjects loading={loading} activeProjects={projects} />

      <QuickActions loading={loading} />
    </div>
  );
};

export default EngineerDashboard;