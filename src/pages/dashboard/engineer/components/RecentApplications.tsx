
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface RecentApplicationsProps {
  loading: boolean;
  applications: any[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "reviewed": return "bg-blue-100 text-blue-800";
    case "pending": return "bg-yellow-100 text-yellow-800";
    case "rejected": return "bg-red-100 text-red-800";
    case "in progress": return "bg-green-100 text-green-800";
    case "completed": return "bg-green-100 text-green-800";
    case "active": return "bg-green-100 text-green-800";
    case "accepted": return "bg-green-100 text-green-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const RecentApplications: React.FC<RecentApplicationsProps> = ({ loading, applications }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          Recent Applications
          <Button asChild variant="outline" size="sm" className="text-xs">
            <Link to="/dashboard/engineer/applications">View All</Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {applications.slice(0, 3).map((app) => (
              <div key={app.job_id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{app.job_title}</span>
                  <Badge className={getStatusColor(app.status)} variant="outline">
                    {app.status}
                  </Badge>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Applied: {app.applied_at.split('T')[0]}</span>
                </div>
              </div>
            ))}
            {applications.length === 0 && (
              <div className="text-center text-muted-foreground py-4">
                No applications yet. <Link to="/dashboard/engineer/jobs" className="text-primary hover:underline">Browse jobs</Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentApplications;
