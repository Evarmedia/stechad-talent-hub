
export interface Task {
  id: number;
  title: string;
  status: string;
  assignee: string;
}

export interface Project {
  id: number;
  title: string;
  description?: string;
  status: string;
  progress: number;
  deadline: string;
  team: string[];
  priority: string;
  tasks: Task[];
}

// Remove initialProjectsData as it's now in mockData.js

export const createEmptyFormData = () => ({
  title: "",
  description: "",
  status: "Planning",
  progress: 0,
  deadline: "",
  priority: "Medium",
  team: [],
  tasks: []
});

export const projectToFormData = (project: Project) => ({
  title: project.title,
  description: project.description || "",
  status: project.status,
  progress: project.progress,
  deadline: project.deadline,
  priority: project.priority,
  team: [...project.team],
  tasks: [...project.tasks]
});
