
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarDays, Clock, Users, CheckCircle, AlertCircle, Circle } from "lucide-react";

// Demo data for projects
const projectsData = [
  {
    id: 1,
    title: "E-commerce Platform Redesign",
    status: "In Progress",
    progress: 65,
    deadline: "2024-07-15",
    team: ["John Doe", "Jane Smith", "Mike Johnson"],
    priority: "High",
    tasks: [
      { id: 1, title: "User Interface Design", status: "completed", assignee: "Jane Smith" },
      { id: 2, title: "Backend API Development", status: "in-progress", assignee: "John Doe" },
      { id: 3, title: "Payment Integration", status: "pending", assignee: "Mike Johnson" },
      { id: 4, title: "Testing & QA", status: "pending", assignee: "Jane Smith" }
    ]
  },
  {
    id: 2,
    title: "Mobile App Development",
    status: "Planning",
    progress: 25,
    deadline: "2024-08-30",
    team: ["Sarah Wilson", "David Brown"],
    priority: "Medium",
    tasks: [
      { id: 5, title: "Requirements Gathering", status: "completed", assignee: "Sarah Wilson" },
      { id: 6, title: "Wireframe Creation", status: "in-progress", assignee: "David Brown" },
      { id: 7, title: "UI/UX Design", status: "pending", assignee: "Sarah Wilson" },
      { id: 8, title: "Development", status: "pending", assignee: "David Brown" }
    ]
  },
  {
    id: 3,
    title: "Data Analytics Dashboard",
    status: "Completed",
    progress: 100,
    deadline: "2024-06-10",
    team: ["Alex Chen", "Lisa Wang"],
    priority: "High",
    tasks: [
      { id: 9, title: "Data Analysis", status: "completed", assignee: "Alex Chen" },
      { id: 10, title: "Dashboard Design", status: "completed", assignee: "Lisa Wang" },
      { id: 11, title: "Implementation", status: "completed", assignee: "Alex Chen" },
      { id: 12, title: "Deployment", status: "completed", assignee: "Lisa Wang" }
    ]
  }
];

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

const PMProjects = () => {
  const [selectedProject, setSelectedProject] = useState(projectsData[0]);

  const completedProjects = projectsData.filter(p => p.status === "Completed").length;
  const inProgressProjects = projectsData.filter(p => p.status === "In Progress").length;
  const totalTasks = projectsData.reduce((acc, project) => acc + project.tasks.length, 0);
  const completedTasks = projectsData.reduce((acc, project) => 
    acc + project.tasks.filter(task => task.status === "completed").length, 0
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Project Management</h1>
        <Button>New Project</Button>
      </div>

      {/* Stats Cards */}
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
                <p className="text-sm text-gray-600">Team Members</p>
                <p className="text-2xl font-bold">8</p>
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

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Projects List */}
            <Card>
              <CardHeader>
                <CardTitle>Active Projects</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {projectsData.map((project) => (
                  <div
                    key={project.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedProject.id === project.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedProject(project)}
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
                ))}
              </CardContent>
            </Card>

            {/* Project Details */}
            <Card>
              <CardHeader>
                <CardTitle>{selectedProject.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <Badge className={getStatusColor(selectedProject.status)}>
                      {selectedProject.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Priority</p>
                    <Badge className={getPriorityColor(selectedProject.priority)}>
                      {selectedProject.priority}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Deadline</p>
                    <p className="flex items-center gap-1">
                      <CalendarDays className="w-4 h-4" />
                      {selectedProject.deadline}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Progress</p>
                    <p>{selectedProject.progress}%</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Team Members</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.team.map((member, index) => (
                      <Badge key={index} variant="outline">{member}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Recent Tasks</p>
                  <div className="space-y-2">
                    {selectedProject.tasks.slice(0, 3).map((task) => (
                      <div key={task.id} className="flex items-center gap-2 text-sm">
                        {getTaskIcon(task.status)}
                        <span>{task.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button className="w-full">View Full Project</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {projectsData.map((project) => (
                  <div key={project.id} className="border-l-2 border-gray-200 pl-4 relative">
                    <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-2 top-1"></div>
                    <div className="mb-2">
                      <h3 className="font-semibold">{project.title}</h3>
                      <p className="text-sm text-gray-600">Deadline: {project.deadline}</p>
                    </div>
                    <Progress value={project.progress} className="h-2 mb-2" />
                    <p className="text-sm text-gray-500">{project.progress}% complete</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Assignee</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projectsData.flatMap(project =>
                    project.tasks.map(task => (
                      <TableRow key={task.id}>
                        <TableCell>{getTaskIcon(task.status)}</TableCell>
                        <TableCell className="font-medium">{task.title}</TableCell>
                        <TableCell>{project.title}</TableCell>
                        <TableCell>{task.assignee}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PMProjects;
