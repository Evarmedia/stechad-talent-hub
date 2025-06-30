
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProjectStats } from "./components/ProjectStats";
import { ProjectCard } from "./components/ProjectCard";
import { ProjectDetails } from "./components/ProjectDetails";
import { ProjectFormDialog } from "./components/ProjectFormDialog";
import { ProjectFilter } from "./components/ProjectFilter";
import { useDataContext } from "@/hooks/useDataContext";
import { Plus } from "lucide-react";

const Projects = () => {
  const { projects: projectsActions, loading } = useDataContext();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const allProjects = await projectsActions.getAll();
        setProjects(allProjects);
        if (allProjects.length > 0) {
          setSelectedProject(allProjects[0]);
        }
      } catch (error) {
        console.error('Error loading projects:', error);
      }
    };
    
    loadProjects();
  }, [projectsActions]);

  const handleCreateProject = async (formData) => {
    try {
      const newProject = await projectsActions.create(formData);
      setProjects([...projects, newProject]);
      setShowForm(false);
      setSelectedProject(newProject);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleUpdateProject = async (formData) => {
    try {
      const updatedProject = await projectsActions.update(editingProject.id, formData);
      const updatedProjects = projects.map(p => 
        p.id === editingProject.id ? { ...p, ...formData } : p
      );
      setProjects(updatedProjects);
      setSelectedProject({ ...editingProject, ...formData });
      setShowForm(false);
      setEditingProject(null);
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const filteredProjects = statusFilter === "All" 
    ? projects 
    : projects.filter(project => project.status === statusFilter);

  const completedProjects = projects.filter(p => p.status === "Completed").length;
  const inProgressProjects = projects.filter(p => p.status === "In Progress").length;
  const allTasks = projects.flatMap(p => p.tasks || []);
  const completedTasks = allTasks.filter(t => t.status === "completed").length;

  if (loading && projects.length === 0) {
    return (
      <div className="p-4 md:p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Project
        </Button>
      </div>

      <ProjectStats 
        completedProjects={completedProjects}
        inProgressProjects={inProgressProjects}
        completedTasks={completedTasks}
        totalTasks={allTasks.length}
      />

      <div className="mt-6">
        <ProjectFilter 
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>All Projects ({filteredProjects.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isSelected={selectedProject?.id === project.id}
                  onClick={() => setSelectedProject(project)}
                />
              ))}
            </CardContent>
          </Card>
        </div>

        <div>
          {selectedProject && (
            <ProjectDetails 
              project={selectedProject}
              onEdit={() => handleEditProject(selectedProject)}
            />
          )}
        </div>
      </div>

      {showForm && (
        <ProjectFormDialog
          project={editingProject}
          onSave={editingProject ? handleUpdateProject : handleCreateProject}
          onCancel={() => {
            setShowForm(false);
            setEditingProject(null);
          }}
        />
      )}
    </div>
  );
};

export default Projects;
