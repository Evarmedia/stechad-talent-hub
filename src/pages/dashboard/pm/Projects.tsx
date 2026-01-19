
import React, { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { ProjectStats } from "./components/ProjectStats";
import { ProjectCard } from "./components/ProjectCard";
import { ProjectFilter } from "./components/ProjectFilter";
import { ProjectFormDialog } from "./components/ProjectFormDialog";
import { useDataContext } from "@/hooks/useDataContext";

const Projects = () => {
  // const [projects, setProjects] = useState([]);
  // const [filteredProjects, setFilteredProjects] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  // const [isInitialLoad, setIsInitialLoad] = useState(true);

  const { projects, getProjects, createProject, updateProject, deleteProject, loading } = useDataContext();

  // console.log("Projects Page - Projects from Context:", projects);

  if (loading) {
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
        {projects.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No projects found</p>
            <p className="text-sm">Create your first project to get started</p>
          </div>
        ) : (
            projects.map((project) => (
            <ProjectCard
              key={project.projects_id}
              project={project}
              onEdit={(project) => {
                setSelectedProject(project);
                setIsFormOpen(true);
              }}
                onDelete={() => deleteProject(project.projects_id)}
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
          (data) => updateProject(selectedProject.projects_id, data) : 
          createProject
        }
        initialData={selectedProject}
        mode={selectedProject ? 'edit' : 'create'}
      />
    </div>
  );
};

export default Projects;
