
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

export const initialProjectsData: Project[] = [
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
