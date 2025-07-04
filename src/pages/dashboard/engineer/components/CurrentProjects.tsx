
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

interface CurrentProjectsProps {
  loading: boolean;
  activeProjects: any[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "reviewed": return "bg-blue-100 text-blue-800";
    case "pending": return "bg-yellow-100 text-yellow-800";
    case "rejected": return "bg-red-100 text-red-800";
    case "In Progress": return "bg-green-100 text-green-800";
    case "Completed": return "bg-green-100 text-green-800";
    case "Active": return "bg-green-100 text-green-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const CurrentProjects: React.FC<CurrentProjectsProps> = ({ loading, activeProjects }) => {
  return (
    <Card className="mb-8">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          Current Projects
          <Button asChild variant="outline" size="sm" className="text-xs">
            <Link to="/dashboard/engineer/projects">View All</Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array(2).fill(0).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-2 w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeProjects.slice(0, 2).map((project) => (
              <div key={project.id} className="space-y-2 p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{project.title}</span>
                  <Badge className={getStatusColor(project.status)} variant="outline">
                    {project.status}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">{project.description}</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
                <div className="text-xs text-muted-foreground">
                  Due: {project.deadline}
                </div>
              </div>
            ))}
            {activeProjects.length === 0 && (
              <div className="col-span-2 text-center text-muted-foreground py-8">
                No projects yet...
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CurrentProjects;
