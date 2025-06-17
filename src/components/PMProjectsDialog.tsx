
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Users } from "lucide-react";

interface PM {
  id: number;
  name: string;
  email: string;
  projectsCount: number;
  status: string;
  joinedAt: string;
}

interface PMProjectsDialogProps {
  pm: PM | null;
  isOpen: boolean;
  onClose: () => void;
}

const DEMO_PROJECTS = [
  {
    id: 1,
    title: "E-commerce Platform",
    status: "In Progress",
    progress: 75,
    deadline: "2025-07-15",
    team: ["Alice", "Bob", "Charlie"]
  },
  {
    id: 2,
    title: "Mobile App Development",
    status: "Planning",
    progress: 25,
    deadline: "2025-08-30",
    team: ["David", "Eve"]
  },
  {
    id: 3,
    title: "Data Analytics Dashboard",
    status: "Completed",
    progress: 100,
    deadline: "2025-06-01",
    team: ["Frank", "Grace", "Henry", "Ivy"]
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Completed": return "bg-green-500 text-white";
    case "In Progress": return "bg-blue-500 text-white";
    case "Planning": return "bg-yellow-500 text-white";
    default: return "bg-gray-500 text-white";
  }
};

export const PMProjectsDialog: React.FC<PMProjectsDialogProps> = ({
  pm,
  isOpen,
  onClose
}) => {
  if (!pm) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Projects managed by {pm.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {DEMO_PROJECTS.map((project) => (
            <Card key={project.id}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{project.title}</h3>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-4 h-4" />
                          {project.deadline}
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
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
