
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, User, CheckCircle, TrendingUp } from "lucide-react";

interface DashboardStatsProps {
  loading: boolean;
  applications: any[];
  scheduledInterviews: any[];
  activeProjects: any[];
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  loading,
  applications,
  scheduledInterviews,
  activeProjects
}) => {
  const stats = [
    { label: "Applications", value: applications.length, icon: Briefcase, change: "+3 this week" },
    { label: "Interviews", value: scheduledInterviews.length, icon: User, change: `${scheduledInterviews.length} scheduled` },
    { label: "Projects", value: activeProjects.length, icon: CheckCircle, change: "Active" },
    { label: "Profile Views", value: 24, icon: TrendingUp, change: "+8 this month" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {loading
        ? Array(4)
            .fill(0)
            .map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-5 rounded" />
                  </div>
                  <Skeleton className="h-8 w-20 mb-2" />
                  <Skeleton className="h-4 w-12" />
                </CardContent>
              </Card>
            ))
        : stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.change}</div>
              </CardContent>
            </Card>
          ))}
    </div>
  );
};

export default DashboardStats;
