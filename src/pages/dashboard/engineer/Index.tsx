
import { useAuthContext } from "@/hooks/useAuthContext";
import { useDataContext } from "@/hooks/useDataContext";
import { useInterviewContext } from "@/hooks/useInterviewContext";
import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import AccountOverview from "./components/AccountOverview";
import CurrentProjects from "./components/CurrentProjects";
import DashboardStats from "./components/DashboardStats";
import QuickActions from "./components/QuickActions";
import RecentApplications from "./components/RecentApplications";

const EngineerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [projects, setProjects] = useState([]);
  
  const { getEngineersApplication, getProjects } = useDataContext();
  const { user } = useAuthContext();
  const { interviews, fetchUserInterviews } = useInterviewContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [applicationsData, projectsData] = await Promise.all([
          getEngineersApplication(),
          getProjects()
        ]);
        
        setApplications(applicationsData);
        
        // Filter projects to only show projects assigned to the current user
        const userProjects = projectsData.filter(project => 
          project.assignedTo === user?.user_id || 
          project.engineerId === user?.user_id ||
          (project.team && project.team.includes(user?.user_id))
        );
        setProjects(userProjects);
        
        if (user) {
          await fetchUserInterviews(user.user_id, user.role);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [getEngineersApplication, getProjects, fetchUserInterviews, user]);

  const activeProjects = projects.filter(p => p.status === "In Progress" || p.status === "Active");
  const scheduledInterviews = interviews.filter(i => i.status === "scheduled");

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
        applications={applications}
        scheduledInterviews={scheduledInterviews}
        activeProjects={activeProjects}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <AccountOverview loading={loading} user={user} />
        <RecentApplications loading={loading} applications={applications} />
      </div>

      <CurrentProjects loading={loading} activeProjects={activeProjects} />

      <QuickActions loading={loading} />
    </div>
  );
};

export default EngineerDashboard;
