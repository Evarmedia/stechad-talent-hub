
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Clock, Users, CheckCircle, AlertCircle, Circle, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Demo data for projects
const initialProjectsData = [
  {
    id: 1,
    title: "E-commerce Platform Redesign",
    description: "Complete redesign of the e-commerce platform with modern UI/UX",
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
    description: "Native mobile application for iOS and Android platforms",
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
    description: "Real-time analytics dashboard for business intelligence",
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
  const [projectsData, setProjectsData] = useState(initialProjectsData);
  const [selectedProject, setSelectedProject] = useState(projectsData[0]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  // Form state for creating/editing projects
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "Planning",
    progress: 0,
    deadline: "",
    priority: "Medium",
    team: [],
    tasks: []
  });

  const [newTeamMember, setNewTeamMember] = useState("");
  const [newTask, setNewTask] = useState({ title: "", assignee: "", status: "pending" });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      status: "Planning",
      progress: 0,
      deadline: "",
      priority: "Medium",
      team: [],
      tasks: []
    });
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

    const newProject = {
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
    setFormData({
      title: selectedProject.title,
      description: selectedProject.description || "",
      status: selectedProject.status,
      progress: selectedProject.progress,
      deadline: selectedProject.deadline,
      priority: selectedProject.priority,
      team: [...selectedProject.team],
      tasks: [...selectedProject.tasks]
    });
    setIsEditDialogOpen(true);
  };

  const addTeamMember = () => {
    if (newTeamMember.trim() && !formData.team.includes(newTeamMember.trim())) {
      setFormData(prev => ({
        ...prev,
        team: [...prev.team, newTeamMember.trim()]
      }));
      setNewTeamMember("");
    }
  };

  const removeTeamMember = (member: string) => {
    setFormData(prev => ({
      ...prev,
      team: prev.team.filter(m => m !== member)
    }));
  };

  const addTask = () => {
    if (newTask.title.trim() && newTask.assignee.trim()) {
      setFormData(prev => ({
        ...prev,
        tasks: [...prev.tasks, { ...newTask, id: Date.now() }]
      }));
      setNewTask({ title: "", assignee: "", status: "pending" });
    }
  };

  const removeTask = (taskId: number) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => task.id !== taskId)
    }));
  };

  const completedProjects = projectsData.filter(p => p.status === "Completed").length;
  const inProgressProjects = projectsData.filter(p => p.status === "In Progress").length;
  const totalTasks = projectsData.reduce((acc, project) => acc + project.tasks.length, 0);
  const completedTasks = projectsData.reduce((acc, project) => 
    acc + project.tasks.filter(task => task.status === "completed").length, 0
  );

  const ProjectForm = ({ isEdit = false }) => (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Project Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter project title"
          />
        </div>
        <div>
          <Label htmlFor="deadline">Deadline *</Label>
          <Input
            id="deadline"
            type="date"
            value={formData.deadline}
            onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter project description"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Planning">Planning</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="progress">Progress (%)</Label>
          <Input
            id="progress"
            type="number"
            min="0"
            max="100"
            value={formData.progress}
            onChange={(e) => setFormData(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
          />
        </div>
      </div>

      <div>
        <Label>Team Members</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={newTeamMember}
            onChange={(e) => setNewTeamMember(e.target.value)}
            placeholder="Add team member"
            onKeyPress={(e) => e.key === 'Enter' && addTeamMember()}
          />
          <Button type="button" onClick={addTeamMember}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.team.map((member, index) => (
            <Badge key={index} variant="outline" className="flex items-center gap-1">
              {member}
              <button onClick={() => removeTeamMember(member)} className="ml-1">
                <Trash2 className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <Label>Tasks</Label>
        <div className="space-y-2 mb-2">
          <div className="grid grid-cols-4 gap-2">
            <Input
              value={newTask.title}
              onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Task title"
            />
            <Input
              value={newTask.assignee}
              onChange={(e) => setNewTask(prev => ({ ...prev, assignee: e.target.value }))}
              placeholder="Assignee"
            />
            <Select value={newTask.status} onValueChange={(value) => setNewTask(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Button type="button" onClick={addTask}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {formData.tasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-2">
                {getTaskIcon(task.status)}
                <span className="text-sm">{task.title}</span>
                <Badge variant="outline" className="text-xs">{task.assignee}</Badge>
              </div>
              <button onClick={() => removeTask(task.id)}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={() => isEdit ? setIsEditDialogOpen(false) : setIsCreateDialogOpen(false)}>
          Cancel
        </Button>
        <Button onClick={isEdit ? handleEditProject : handleCreateProject}>
          {isEdit ? "Update Project" : "Create Project"}
        </Button>
      </div>
    </div>
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
            <ProjectForm />
          </DialogContent>
        </Dialog>
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

                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" onClick={openEditDialog}>Edit Project</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Edit Project</DialogTitle>
                    </DialogHeader>
                    <ProjectForm isEdit={true} />
                  </DialogContent>
                </Dialog>
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
