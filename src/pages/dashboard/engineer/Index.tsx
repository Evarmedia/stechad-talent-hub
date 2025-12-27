import { useAuthContext } from "@/hooks/useAuthContext";
import { useDataContext } from "@/hooks/useDataContext";
import { Calendar } from "lucide-react";

import AccountOverview from "./components/AccountOverview";
import CurrentProjects from "./components/CurrentProjects";
import DashboardStats from "./components/DashboardStats";
import QuickActions from "./components/QuickActions";
import RecentApplications from "./components/RecentApplications";

const EngineerDashboard = () => {
  const { engrDashboardData, loading } = useDataContext();
  const { user } = useAuthContext();

  // -----------------------------
  // DERIVED DATA (SAFE DEFAULTS)
  // -----------------------------
  const statistics = engrDashboardData?.statistics;

  const recentApplicationsCount =
    statistics?.recentApplicationsCount ?? 0;

  const scheduledInterviewCount =
    statistics?.scheduledInterviewCount ?? 0;

  const activeProjectsCount =
    statistics?.activeProjectsCount ?? 0;

  const interviewCount =
    statistics?.interviewCount ?? 0;

  const recentApplications =
    engrDashboardData?.recentApplications ?? [];

  const activeProjects =
    engrDashboardData?.activeProjects ?? [];

  return (
    <div className="py-8 max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-primary">
          Engineer Dashboard
        </h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>
            Last updated: {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Stats */}
      <DashboardStats
        loading={loading}
        applications={recentApplicationsCount}
        scheduledInterviews={scheduledInterviewCount}
        activeProjects={activeProjectsCount}
        totalInterviewCount={interviewCount}
        recentApplications={recentApplications.length}
      />

      {/* Overview & Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <AccountOverview loading={loading} user={user} />
        <RecentApplications
          loading={loading}
          applications={recentApplications}
        />
      </div>

      {/* Projects */}
      <CurrentProjects
        loading={loading}
        activeProjects={activeProjects}
      />

      {/* Actions */}
      <QuickActions loading={loading} />
    </div>
  );
};

export default EngineerDashboard;
