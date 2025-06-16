
import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle, AlertCircle, Circle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { ProjectForm } from "./components/ProjectForm";
import { ProjectCard } from "./components/ProjectCard";
import { ProjectStats } from "./components/ProjectStats";
import { ProjectDetails } from "./components/ProjectDetails";
import { ProjectFilter } from "./components/ProjectFilter";
import { initialProjectsData, createEmptyFormData, projectToFormData, Project } from "./utils/projectUtils";

const getTaskIcon = (status: string) => {
  switch (status) {
    case "completed": return <CheckCircle className="w-4 h-4 text-green-600" />;
    case "in-progress": return <AlertCircle className="w-4 h-4 text-blue-600" />;
    case "pending": return <Circle className="w-4 h-4 text-gray-400" />;
    default: return <Circle className="w-4 h-4 text-gray-400" />;
  }
};

const PMProjects = () => {
  const [projectsData, setProjectsData] = useState<Project[]>(initialProjectsData);
  const [selectedProject, setSelectedProject] = useState<Project>(projectsData[0]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    sortBy: "recent"
  });
  const { toast } = useToast();

  const [formData, setFormData] = useState(createEmptyFormData());
  const [newTeamMember, setNewTeamMember] = useState("");
  const [newTask, setNewTask] = useState({ title: "", assignee: "", status: "pending" });

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projectsData.filter(project => {
      const matchesStatus = filters.status === "all" || project.status === filters.status;
      const matchesPriority = filters.priority === "all" || project.priority === filters.priority;
      return matchesStatus && matchesPriority;
    });

    // Sort projects
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "recent":
          return b.id - a.id; // Assuming higher ID means more recent
        case "deadline":
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case "priority":
          const priorityOrder = { "High": 3, "Medium": 2, "Low": 1 };
          return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
        case "progress":
          return b.progress - a.progress;
        default:
          return 0;
      }
    });

    return filtered;
  }, [projectsData, filters]);

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const resetForm = () => {
    setFormData(createEmptyFormData());
    setNewTeamMember("");
    setNewTask({ title: "", assignee: "", status: "pending" });
  };

  const handleCreateProject = () => {
    if (!formData.title || !formData.deadline) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const newProject: Project = {
      ...formData,
      id: Math.max(...projectsData.map(p => p.id)) + 1,
      tasks: formData.tasks.map((task, index) => ({ ...task, id: Date.now() + index }))
    };

    setProjectsData([...projectsData, newProject]);
    setIsCreateDialogOpen(false);
    resetForm();
    toast({
      title: "Success",
      description: "Project created successfully"
    });
  };

  const handleEditProject = () => {
    const updatedProjects = projectsData.map(project =>
      project.id === selectedProject.id ? { ...formData, id: selectedProject.id } : project
    );
    setProjectsData(updatedProjects);
    setSelectedProject({ ...formData, id: selectedProject.id });
    setIsEditDialogOpen(false);
    toast({
      title: "Success",
      description: "Project updated successfully"
    });
  };

  const openEditDialog = () => {
    setFormData(projectToFormData(selectedProject));
    setIsEditDialogOpen(true);
  };

  // Calculate statistics
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
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>New Project</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <ProjectForm
              formData={formData}
              setFormData={setFormData}
              newTeamMember={newTeamMember}
              setNewTeamMember={setNewTeamMember}
              newTask={newTask}
              setNewTask={setNewTask}
              onSubmit={handleCreateProject}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <ProjectStats
        completedProjects={completedProjects}
        inProgressProjects={inProgressProjects}
        completedTasks={completedTasks}
        totalTasks={totalTasks}
      />

      <Tabs defaultValue="overview" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>
          <ProjectFilter 
            onFilterChange={handleFilterChange}
            currentFilters={filters}
          />
        </div>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Projects ({filteredAndSortedProjects.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {filteredAndSortedProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    isSelected={selectedProject.id === project.id}
                    onClick={() => setSelectedProject(project)}
                  />
                ))}
                {filteredAndSortedProjects.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No projects match the current filters
                  </div>
                )}
              </CardContent>
            </Card>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <ProjectDetails project={selectedProject} onEdit={openEditDialog} />
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Edit Project</DialogTitle>
                </DialogHeader>
                <ProjectForm
                  formData={formData}
                  setFormData={setFormData}
                  newTeamMember={newTeamMember}
                  setNewTeamMember={setNewTeamMember}
                  newTask={newTask}
                  setNewTask={setNewTask}
                  onSubmit={handleEditProject}
                  onCancel={() => setIsEditDialogOpen(false)}
                  isEdit={true}
                />
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {filteredAndSortedProjects.map((project) => (
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
                  {filteredAndSortedProjects.flatMap(project =>
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
