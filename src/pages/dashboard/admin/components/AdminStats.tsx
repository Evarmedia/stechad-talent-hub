
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Briefcase, FileText, UserCheck, TrendingUp } from "lucide-react";

interface AdminStatsProps {
  loading: boolean;
  statistics: any;

}

const AdminStats: React.FC<AdminStatsProps> = ({ loading, statistics }) => {
  const stats = [
    { label: "Engineers", value: statistics?.totalEngineers, icon: Users, change: "+12%" },
    { label: "Project Managers", value: statistics?.totalProjectManagers, icon: UserCheck, change: "+2%" },
    { label: "Active Jobs", value: statistics?.totalJobs, icon: Briefcase, change: "+5%" },
    { label: "Applications", value: statistics?.totalApplications, icon: FileText, change: "+18%" },
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
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600">{stat.change}</span>
                </div>
              </CardContent>
            </Card>
          ))}
    </div>
  );
};

export default AdminStats;
