
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
  
  const { getApplications, getProjects } = useDataContext();
  const { user } = useAuthContext();
  const { interviews, fetchInterviews } = useInterviewContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [applicationsData, projectsData] = await Promise.all([
          getApplications({ engineerId: user?.id }),
          getProjects()
        ]);
        
        setApplications(applicationsData);
        
        // Filter projects to only show projects assigned to the current user
        const userProjects = projectsData.filter(project => 
          project.assignedTo === user?.id || 
          project.engineerId === user?.id ||
          (project.team && project.team.includes(user?.id))
        );
        setProjects(userProjects);
        
        if (user) {
          await fetchInterviews(user.id, user.role);
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
  }, [getApplications, getProjects, fetchInterviews, user]);

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
