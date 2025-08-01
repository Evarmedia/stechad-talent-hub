
import React, { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { ProjectStats } from "./components/ProjectStats";
import { ProjectCard } from "./components/ProjectCard";
import { ProjectFilter } from "./components/ProjectFilter";
import { ProjectFormDialog } from "./components/ProjectFormDialog";
import { useDataContext } from "@/hooks/useDataContext";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const { getProjects, createProject, updateProject, deleteProject, loading } = useDataContext();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsData = await getProjects();
        setProjects(projectsData);
        setFilteredProjects(projectsData);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setIsInitialLoad(false);
      }
    };

    fetchProjects();
  }, [getProjects]);

  useEffect(() => {
    if (!isInitialLoad) {
      let filtered = [...projects];

      if (statusFilter !== "all") {
        filtered = filtered.filter(project => project.status === statusFilter);
      }

      if (priorityFilter !== "all") {
        filtered = filtered.filter(project => project.priority === priorityFilter);
      }

      if (searchTerm) {
        filtered = filtered.filter(project =>
          project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setFilteredProjects(filtered);
    }
  }, [projects, statusFilter, priorityFilter, searchTerm, isInitialLoad]);

  const handleCreateProject = async (projectData) => {
    try {
      const newProject = await createProject(projectData);
      setProjects(prev => [...prev, newProject]);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleEditProject = async (id, projectData) => {
    try {
      const updatedProject = await updateProject(id, projectData);
      setProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
      setIsFormOpen(false);
      setSelectedProject(null);
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  if (isInitialLoad || loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-6 w-20 mb-2" />
              <Skeleton className="h-8 w-16" />
            </Card>
          ))}
        </div>

        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Project Management</h1>
        <p className="text-gray-600">Manage and track your projects</p>
      </div>

      <ProjectStats projects={projects} />

      <ProjectFilter
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onCreateNew={() => setIsFormOpen(true)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No projects found</p>
            <p className="text-sm">Create your first project to get started</p>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={(project) => {
                setSelectedProject(project);
                setIsFormOpen(true);
              }}
              onDelete={handleDeleteProject}
            />
          ))
        )}
      </div>

      <ProjectFormDialog
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedProject(null);
        }}
        onSubmit={selectedProject ? 
          (data) => handleEditProject(selectedProject.id, data) : 
          handleCreateProject
        }
        initialData={selectedProject}
        mode={selectedProject ? 'edit' : 'create'}
      />
    </div>
  );
};

export default Projects;
