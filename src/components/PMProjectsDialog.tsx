
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, Users } from "lucide-react";
import React from "react";

interface PM {
  project_managers_id: string;
  user: any;
  total_projects: number;
  status: string;
  created_at: string;
  pm_projects: any[];
}

interface PMProjectsDialogProps {
  pm: PM | null;
  isOpen: boolean;
  onClose: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed": return "bg-green-500 text-black";
    case "in_progress": return "bg-blue-500 text-white";
    case "planning": return "bg-yellow-500 text-black";
    case "on_hold": return "bg-yellow-500 text-black";
    default: return "bg-gray-500 text-white";
  }
};

export const PMProjectsDialog: React.FC<PMProjectsDialogProps> = ({
  pm,
  isOpen,
  onClose
}) => {
  if (!pm) return null;

  const hasProjects = Array.isArray(pm.pm_projects) && pm.pm_projects.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Projects managed by {pm.user.first_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!hasProjects ? (
            /* ✅ Empty state */
            <div className="text-center py-12">
              <p className="text-lg font-medium text-muted-foreground">
                No projects by this PM yet
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Projects assigned to this project manager will appear here.
              </p>
            </div>
          ) : (
            /* ✅ Projects list */
            pm.pm_projects.map((project) => (
              <Card key={project.projects_id}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{project.title}</h3>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="w-4 h-4" />
                            {project.deadline?.split("T")[0]}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {project.team.length} members
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} className="h-2" />
                        </div>

                        {project.is_unassigned && (
                          <div className="text-red-900 text-xs">
                            This project is not managed by any PM
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="md:text-right">
                      <p className="text-sm text-muted-foreground mb-1">Team</p>
                      <div className="flex flex-wrap gap-1">
                        {project.team.slice(0, 3).map(member => (
                          <Badge key={member} variant="outline" className="text-xs">
                            {member}
                          </Badge>
                        ))}
                        {project.team.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.team.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
