import ServerDataState from "@/components/ServerDataState";
import { useDataContext } from "@/hooks/useDataContext";
import { Calendar } from "lucide-react";
import AdminStats from "./components/AdminStats";
import LatestJobs from "./components/LatestJobs";
import RecentTalents from "./components/RecentTalents";
import RecentProjects from "./components/RecentProjects";

const AdminDashboard = () => {
  const { adminDashboardData, loading } = useDataContext();
  if (!loading && !adminDashboardData) return <ServerDataState title="Admin dashboard" error="Dashboard data is unavailable. Please try again." onRetry={() => window.location.reload()} />;
  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Last updated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>
      <AdminStats loading={loading} statistics={adminDashboardData?.statistics} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <RecentTalents loading={loading} talents={adminDashboardData?.recentActivity?.recentTalents} />
        <LatestJobs loading={loading} jobs={adminDashboardData?.recentActivity?.recentJobs} />
      </div>
      <div className="grid grid-cols-1 gap-8">
        <RecentProjects loading={loading} projects={adminDashboardData?.recentActivity?.recentProjects} />
      </div>
    </div>
  );
};
export default AdminDashboard;
