
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProjectCard } from "./components/ProjectCard";
import { ProjectDetails } from "./components/ProjectDetails";
import { ProjectFilter } from "./components/ProjectFilter";
import { ProjectStats } from "./components/ProjectStats";
import { ProjectFormDialog } from "./components/ProjectFormDialog";
import { useDataContext } from "@/hooks/useDataContext";

const PMProjects = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectsList, setProjectsList] = useState([]);
  const [currentFilters, setCurrentFilters] = useState({
    status: "all",
    priority: "all",
    sortBy: "recent"
  });

  const { getProjects, createProject, updateProject, deleteProject, loading } = useDataContext();

  useEffect(() => {
    const fetchProjects = async () => {
      const projects = await getProjects(currentFilters);
      setProjectsList(projects);
      if (projects.length > 0 && !selectedProject) {
        setSelectedProject(projects[0]);
      }
    };

    fetchProjects();
  }, [getProjects, currentFilters, selectedProject]);

  const handleFilterChange = (filterType, value) => {
    setCurrentFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleCreateProject = () => {
    setEditingProject(null);
    setShowForm(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleSaveProject = async (formData) => {
    try {
      if (editingProject) {
        await updateProject(editingProject.id, formData);
      } else {
        await createProject(formData);
      }
      setShowForm(false);
      setEditingProject(null);
      // Refresh projects list
      const projects = await getProjects(currentFilters);
      setProjectsList(projects);
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await deleteProject(projectId);
      if (selectedProject?.id === projectId) {
        setSelectedProject(projectsList[0]);
      }
      // Refresh projects list
      const projects = await getProjects(currentFilters);
      setProjectsList(projects);
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const completedProjects = projectsList.filter(p => p.status === "Completed").length;
  const inProgressProjects = projectsList.filter(p => p.status === "In Progress").length;
  const allTasks = projectsList.flatMap(p => p.tasks || []);
  const completedTasks = allTasks.filter(t => t.status === "completed").length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Button onClick={handleCreateProject}>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      <ProjectStats
        completedProjects={completedProjects}
        inProgressProjects={inProgressProjects}
        completedTasks={completedTasks}
        totalTasks={allTasks.length}
      />

      <div className="mt-8 mb-6">
        <ProjectFilter
          onFilterChange={handleFilterChange}
          currentFilters={currentFilters}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4 max-h-[600px] overflow-y-auto">
          {loading ? (
            <div>Loading projects...</div>
          ) : (
            projectsList.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isSelected={selectedProject?.id === project.id}
                onClick={() => setSelectedProject(project)}
              />
            ))
          )}
          {!loading && projectsList.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No projects found. Create your first project to get started.
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedProject ? (
            <ProjectDetails
              project={selectedProject}
              onEdit={() => handleEditProject(selectedProject)}
              onDelete={() => handleDeleteProject(selectedProject.id)}
            />
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-500">Select a project to view details</p>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <ProjectFormDialog
          project={editingProject}
          onSave={handleSaveProject}
          onCancel={() => {
            setShowForm(false);
            setEditingProject(null);
          }}
        />
      )}
    </div>
  );
};

export default PMProjects;
