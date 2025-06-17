
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Calendar, MapPin, Clock, CheckCircle } from "lucide-react";

const CURRENT_PROJECTS = [
  {
    id: 1,
    title: "E-commerce Platform Redesign",
    company: "TechCorp Inc.",
    status: "In Progress",
    progress: 65,
    startDate: "2024-05-01",
    endDate: "2024-08-30",
    description: "Redesigning the entire frontend using React and implementing new payment gateway",
    skills: ["React", "TypeScript", "Stripe API"],
    tasks: [
      { id: 1, title: "Setup project structure", status: "completed" },
      { id: 2, title: "Implement user authentication", status: "completed" },
      { id: 3, title: "Design product catalog", status: "in-progress" },
      { id: 4, title: "Integrate payment system", status: "pending" }
    ]
  },
  {
    id: 2,
    title: "Mobile App Backend",
    company: "StartupXYZ",
    status: "In Progress",
    progress: 40,
    startDate: "2024-06-15",
    endDate: "2024-09-15",
    description: "Building REST API and database architecture for mobile application",
    skills: ["Node.js", "MongoDB", "AWS"],
    tasks: [
      { id: 1, title: "Database design", status: "completed" },
      { id: 2, title: "API endpoints", status: "in-progress" },
      { id: 3, title: "Authentication system", status: "pending" },
      { id: 4, title: "Deployment setup", status: "pending" }
    ]
  }
];

const PROJECT_HISTORY = [
  {
    id: 3,
    title: "CRM Dashboard",
    company: "BusinessSolutions Ltd",
    status: "Completed",
    completedDate: "2024-04-30",
    duration: "3 months",
    description: "Built a comprehensive CRM dashboard with analytics and reporting features",
    skills: ["Vue.js", "Python", "PostgreSQL"],
    rating: 5
  },
  {
    id: 4,
    title: "Inventory Management System",
    company: "RetailChain Co",
    status: "Completed",
    completedDate: "2024-02-15",
    duration: "4 months",
    description: "Developed a full-stack inventory management system with real-time tracking",
    skills: ["Angular", "Java Spring", "MySQL"],
    rating: 4
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "In Progress": return "bg-blue-100 text-blue-800";
    case "Completed": return "bg-green-100 text-green-800";
    case "On Hold": return "bg-yellow-100 text-yellow-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const getTaskIcon = (status: string) => {
  switch (status) {
    case "completed": return <CheckCircle className="w-4 h-4 text-green-600" />;
    case "in-progress": return <Clock className="w-4 h-4 text-blue-600" />;
    case "pending": return <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />;
    default: return <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />;
  }
};

const EngineerProjects = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">My Projects</h1>
        <p className="text-muted-foreground">Track your current work and project history</p>
      </div>

      <Tabs defaultValue="current" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:w-auto">
          <TabsTrigger value="current">Current Projects</TabsTrigger>
          <TabsTrigger value="history">Project History</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          {loading ? (
            <div className="space-y-4">
              {Array(2).fill(0).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-20 w-full mb-4" />
                    <Skeleton className="h-2 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {CURRENT_PROJECTS.map((project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="space-y-2">
                        <CardTitle className="text-lg md:text-xl">{project.title}</CardTitle>
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-sm text-muted-foreground">
                          <span className="font-medium">{project.company}</span>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{project.startDate} - {project.endDate}</span>
                          </div>
                        </div>
                      </div>
                      <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{project.description}</p>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm text-muted-foreground">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>

                    <div>
                      <span className="text-sm font-medium">Technologies:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {project.skills.map((skill) => (
                          <Badge key={skill} variant="outline">{skill}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <span className="text-sm font-medium">Tasks:</span>
                      <div className="space-y-2">
                        {project.tasks.map((task) => (
                          <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                            {getTaskIcon(task.status)}
                            <span className={`text-sm ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                              {task.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {loading ? (
            <div className="space-y-4">
              {Array(2).fill(0).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {PROJECT_HISTORY.map((project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="space-y-2">
                        <CardTitle className="text-lg md:text-xl">{project.title}</CardTitle>
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-sm text-muted-foreground">
                          <span className="font-medium">{project.company}</span>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{project.duration}</span>
                          </div>
                          <span>Completed: {project.completedDate}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                        <div className="flex items-center gap-1">
                          <span className="text-sm">Rating:</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`text-sm ${i < project.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{project.description}</p>
                    
                    <div>
                      <span className="text-sm font-medium">Technologies Used:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {project.skills.map((skill) => (
                          <Badge key={skill} variant="outline">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EngineerProjects;
