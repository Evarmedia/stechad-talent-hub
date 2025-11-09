
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useDataContext } from "@/hooks/useDataContext";
import { Calendar, CheckCircle, Clock } from "lucide-react";
import { useEffect, useState } from "react";

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
  const [projects, setProjects] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const { getProjects } = useDataContext();
  const { user } = useAuthContext();

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) {
        setInitialLoading(false);
        return;
      }

      try {
        const projectsData = await getProjects();
        
        // Filter projects to only show those assigned to the current user
        const userProjects = projectsData.filter(project => 
          project.assignedTo === user.id || 
          project.engineerId === user.id ||
          (project.team && project.team.includes(user.id)) ||
          (project.assignedEngineers && project.assignedEngineers.includes(user.id))
        );
        
        console.log('All projects:', projectsData);
        console.log('User projects for user', user.id, ':', userProjects);
        
        setProjects(userProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchProjects();
  }, [getProjects, user]);

  const currentProjects = projects.filter(project => 
    project.status === "In Progress" || project.status === "active"
  );
  
  const completedProjects = projects.filter(project => 
    project.status === "Completed"
  );

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
          {initialLoading ? (
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
              {currentProjects.length > 0 ? (
                currentProjects.map((project) => (
                  <Card key={project.id}>
                    <CardHeader>
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="space-y-2">
                          <CardTitle className="text-lg md:text-xl">{project.title}</CardTitle>
                          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-sm text-muted-foreground">
                            <span className="font-medium">{project.client}</span>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{project.startDate} - {project.deadline}</span>
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
                          {project.technologies?.map((tech) => (
                            <Badge key={tech} variant="outline">{tech}</Badge>
                          )) || (
                            <Badge variant="outline">React</Badge>
                          )}
                        </div>
                      </div>

                      {project.tasks && (
                        <div className="space-y-3">
                          <span className="text-sm font-medium">Tasks:</span>
                          <div className="space-y-2">
                            {project.tasks.map((task, index) => (
                              <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                                {getTaskIcon(task.status)}
                                <span className={`text-sm ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                                  {task.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="text-lg font-medium mb-2">No projects yet...</div>
                  <p className="text-sm">You haven't been assigned to any projects yet. Check back later!</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {initialLoading ? (
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
              {completedProjects.length > 0 ? (
                completedProjects.map((project) => (
                  <Card key={project.id}>
                    <CardHeader>
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="space-y-2">
                          <CardTitle className="text-lg md:text-xl">{project.title}</CardTitle>
                          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-sm text-muted-foreground">
                            <span className="font-medium">{project.client}</span>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>Duration: {project.startDate} - {project.deadline}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">{project.description}</p>
                      
                      <div>
                        <span className="text-sm font-medium">Technologies Used:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {project.technologies?.map((tech) => (
                            <Badge key={tech} variant="outline">{tech}</Badge>
                          )) || (
                            <Badge variant="outline">React</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="text-lg font-medium mb-2">No completed projects</div>
                  <p className="text-sm">You haven't completed any projects yet.</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EngineerProjects;
