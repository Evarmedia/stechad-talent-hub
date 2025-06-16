
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CalendarDays } from "lucide-react";

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

interface ProjectCardProps {
  project: Project;
  isSelected: boolean;
  onClick: () => void;
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

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, isSelected, onClick }) => {
  return (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold">{project.title}</h3>
        <Badge className={getPriorityColor(project.priority)}>
          {project.priority}
        </Badge>
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
        <Badge className={getStatusColor(project.status)}>
          {project.status}
        </Badge>
        <span className="flex items-center gap-1">
          <CalendarDays className="w-4 h-4" />
          {project.deadline}
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
  );
};
