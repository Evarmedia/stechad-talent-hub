
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CalendarDays, Edit, Trash2, Users } from "lucide-react";

interface Project {
  projects_id: string;
  title: string;
  description?: string;
  status: string;
  progress: number;
  deadline: string;
  team: string[];
  priority: string;
  tasks: Array<{
    id: number;
    title: string;
    status: string;
    assignee: string;
  }>;
}

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => Promise<void>;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed": return "bg-green-100 text-green-800";
    case "in_progress": return "bg-blue-100 text-blue-800";
    case "planning": return "bg-yellow-100 text-yellow-800";
    case "on_hold": return "bg-yellow-100 text-gray-600";
    default: return "bg-gray-100 text-gray-800";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high": return "bg-yellow-200 text-red-800";
    case "medium": return "bg-yellow-100 text-yellow-800";
    case "low": return "bg-green-100 text-green-800";
    case "critical": return "bg-red-800 text-white";
    default: return "bg-gray-100 text-gray-800";
  }
};

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete }) => {
  const completedTasks = project.tasks?.filter(task => task.status === 'completed').length || 0;
  const totalTasks = project.tasks?.length || 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900 truncate pr-2">
            {project.title}
          </h3>
          <Badge className={getPriorityColor(project.priority)}>
            {project.priority}
          </Badge>
        </div>
        
        {project.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {project.description}
          </p>
        )}
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(project.status)}>
              <span className="capitalize">
                {project.status.replace("_", " ")}
                </span>
            </Badge>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <CalendarDays className="w-4 h-4" />
              <span>{new Date(project.deadline).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{project.team?.length || 0} members</span>
            </div>
            <span className="text-sm text-gray-600">
              {completedTasks}/{totalTasks} tasks
            </span>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEdit(project)}
              className="flex-1"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onDelete(project.projects_id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
