
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, CheckCircle, AlertCircle, Circle } from "lucide-react";

interface Project {
  id: number;
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

interface ProjectDetailsProps {
  project: Project;
  onEdit: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Completed": return "bg-green-500";
    case "In Progress": return "bg-blue-500";
    case "Planning": return "bg-yellow-500";
    default: return "bg-gray-500";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "High": return "bg-red-100 text-red-800";
    case "Medium": return "bg-yellow-100 text-yellow-800";
    case "Low": return "bg-green-100 text-green-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const getTaskIcon = (status: string) => {
  switch (status) {
    case "completed": return <CheckCircle className="w-4 h-4 text-green-600" />;
    case "in-progress": return <AlertCircle className="w-4 h-4 text-blue-600" />;
    case "pending": return <Circle className="w-4 h-4 text-gray-400" />;
    default: return <Circle className="w-4 h-4 text-gray-400" />;
  }
};

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project, onEdit }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{project.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Status</p>
            <Badge className={getStatusColor(project.status)}>
              {project.status}
            </Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Priority</p>
            <Badge className={getPriorityColor(project.priority)}>
              {project.priority}
            </Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Deadline</p>
            <p className="flex items-center gap-1">
              <CalendarDays className="w-4 h-4" />
              {project.deadline}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Progress</p>
            <p>{project.progress}%</p>
          </div>
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">Team Members</p>
          <div className="flex flex-wrap gap-2">
            {project.team.map((member, index) => (
              <Badge key={index} variant="outline">{member}</Badge>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">Recent Tasks</p>
          <div className="space-y-2">
            {project.tasks.slice(0, 3).map((task) => (
              <div key={task.id} className="flex items-center gap-2 text-sm">
                {getTaskIcon(task.status)}
                <span>{task.title}</span>
              </div>
            ))}
          </div>
        </div>

        <Button className="w-full" onClick={onEdit}>Edit Project</Button>
      </CardContent>
    </Card>
  );
};
