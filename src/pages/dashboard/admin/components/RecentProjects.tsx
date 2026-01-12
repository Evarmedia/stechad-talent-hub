
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

interface RecentProjectsProps {
  loading: boolean;
  projects: any[];
}

const RecentProjects: React.FC<RecentProjectsProps> = ({ loading, projects }) => {
  const recentProjects = projects.slice(0, 3);

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500 text-black";
      case "in_progress": return "bg-blue-500 text-white";
      case "planning": return "bg-yellow-500 text-black";
      case "on_hold": return "bg-yellow-500 text-black";
      default: return "bg-gray-500 text-white";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          Recent Projects
          <Button asChild variant="outline" size="sm" className="text-xs">
            <Link to="/admin/project-managers">View All</Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {recentProjects.map((p, idx) => (
              <div key={idx} className="space-y-1">
                <div className="font-medium text-sm">{p.title}</div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Team: {p.team?.length || 0} members
                  </span>
                  <Badge className={getProjectStatusColor(p.status)} variant="outline">
                    {p.status}
                  </Badge>
                </div>
              </div>
            ))}
            {recentProjects.length === 0 && (
              <div className="text-center text-muted-foreground py-4">
                No projects found
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentProjects;
