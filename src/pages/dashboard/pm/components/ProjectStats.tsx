
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, Users, CalendarDays } from "lucide-react";

interface ProjectStatsProps {
  projects: Array<{
    projects_id: string;
    status: string;
    tasks?: Array<{ status: string }>;
    priority: string;
  }>;
}

export const ProjectStats: React.FC<ProjectStatsProps> = ({ projects }) => {
  console.log(projects);
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const inProgressProjects = projects.filter(p => p.status === 'in_progress').length;
  const criticalProjects = projects.filter(p => p.priority === 'critical').length;
  
  const allTasks = projects.flatMap(p => p.tasks || []);
  const completedTasks = allTasks.filter(t => t.status === 'completed').length;
  const totalTasks = allTasks.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Completed Projects</p>
              <p className="text-2xl font-bold">{completedProjects}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold">{inProgressProjects}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600 font-bold">Critical Projects</p>
              <p className="text-2xl font-bold">{criticalProjects}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Tasks Completed</p>
              <p className="text-2xl font-bold">{completedTasks}/{totalTasks}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
