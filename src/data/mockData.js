
// Mock data for the entire application
export const mockData = {
  // User data
  users: [
    {
      id: 1,
      email: "engineer@example.com",
      role: "engineer",
      profile: {
        id: 1,
        userId: 1,
        fullName: "John Engineer",
        country: "Germany",
        experience: 5,
        skills: ["React", "Node.js", "TypeScript"],
        availability: "immediate",
        isVetted: true
      }
    },
    {
      id: 2,
      email: "pm@example.com",
      role: "pm",
      profile: {
        id: 1,
        userId: 2,
        fullName: "Jane PM",
        company: "TechCorp",
        country: "France"
      }
    },
    {
      id: 3,
      email: "admin@example.com",
      role: "admin",
      profile: {
        id: 1,
        userId: 3,
        fullName: "Admin User",
        department: "Platform Management"
      }
    }
  ],

  // Engineers data
  engineers: [
    {
      id: 1,
      name: "Jane Doe",
      country: "Germany",
      exp: 5,
      status: "Active",
      email: "jane.doe@example.com",
      phone: "+49-123-456-789",
      onboardedAt: "2024-01-15",
      skills: ["React", "Node.js", "AWS"],
      availability: "immediate",
      isVetted: true
    },
    {
      id: 2,
      name: "Max Mustermann",
      country: "Austria",
      exp: 7,
      status: "Active",
      email: "max.m@example.com",
      phone: "+43-987-654-321",
      onboardedAt: "2024-02-20",
      skills: ["Java", "Spring", "Docker"],
      availability: "2weeks",
      isVetted: true
    },
    {
      id: 3,
      name: "Alice Smith",
      country: "Netherlands",
      exp: 3,
      status: "Pending",
      email: "alice.smith@example.com",
      phone: "+31-555-123-456",
      onboardedAt: "2024-03-10",
      skills: ["Python", "Django", "PostgreSQL"],
      availability: "1month",
      isVetted: false
    }
  ],

  // Jobs data
  jobs: [
    {
      id: 1,
      title: "React Developer",
      company: "TechCorp Inc.",
      location: "Paris, France",
      type: "Full-time",
      status: "Active",
      applications: 12,
      posted: "2025-06-02",
      salary: "€50,000 - €70,000",
      description: "We are looking for an experienced React developer to join our team.",
      requirements: ["React", "TypeScript", "Node.js"],
      pmId: 1
    },
    {
      id: 2,
      title: "DevOps Engineer",
      company: "StartupXYZ",
      location: "Berlin, Germany",
      type: "Contract",
      status: "Active",
      applications: 8,
      posted: "2025-06-01",
      salary: "€60,000 - €80,000",
      description: "DevOps engineer needed for cloud infrastructure management.",
      requirements: ["AWS", "Docker", "Kubernetes"],
      pmId: 1
    },
    {
      id: 3,
      title: "Java Backend Engineer",
      company: "Enterprise Ltd",
      location: "London, UK",
      type: "Full-time",
      status: "Closed",
      applications: 25,
      posted: "2025-05-20",
      salary: "£45,000 - £65,000",
      description: "Senior Java developer for enterprise applications.",
      requirements: ["Java", "Spring Boot", "SQL"],
      pmId: 2
    }
  ],

  // Applications data
  applications: [
    {
      id: 1,
      engineer: "Jane Doe",
      job: "React Developer",
      jobId: 1,
      engineerId: 1,
      status: "Pending",
      date: "2025-06-02",
      coverLetter: "I am very interested in this position...",
      proposedRate: 65000
    },
    {
      id: 2,
      engineer: "Max Mustermann",
      job: "DevOps Engineer",
      jobId: 2,
      engineerId: 2,
      status: "Shortlisted",
      date: "2025-05-30",
      coverLetter: "My DevOps experience aligns perfectly...",
      proposedRate: 70000
    },
    {
      id: 3,
      engineer: "Alice Smith",
      job: "Java Backend Engineer",
      jobId: 3,
      engineerId: 3,
      status: "Hired",
      date: "2025-05-21",
      coverLetter: "I have extensive Java backend experience...",
      proposedRate: 55000
    }
  ],

  // Applicants data (for specific jobs)
  applicants: [
    {
      id: 1,
      name: "Jane Doe",
      experience: 5,
      skills: ["React", "Node.js", "AWS"],
      resume: "jane_resume.pdf",
      status: "Pending",
      jobId: 1,
      engineerId: 1
    },
    {
      id: 2,
      name: "Max Mustermann",
      experience: 7,
      skills: ["Java", "Spring"],
      resume: "max_resume.pdf",
      status: "Shortlisted",
      jobId: 1,
      engineerId: 2
    },
    {
      id: 3,
      name: "Alice Smith",
      experience: 3,
      skills: ["Python", "SQL"],
      resume: "alice_cv.pdf",
      status: "Rejected",
      jobId: 1,
      engineerId: 3
    }
  ],

  // Projects data
  projects: [
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
  ],

  // Project Managers data
  projectManagers: [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@company.com",
      projectsCount: 3,
      status: "Active",
      joinedAt: "2024-01-15"
    },
    {
      id: 2,
      name: "Alice Smith",
      email: "alice.smith@company.com",
      projectsCount: 2,
      status: "Active",
      joinedAt: "2024-03-20"
    }
  ]
};

// Helper functions for data manipulation
export const dataHelpers = {
  // Generate new ID for any entity
  generateId: (entityArray) => {
    return entityArray.length > 0 ? Math.max(...entityArray.map(item => item.id)) + 1 : 1;
  },

  // Generic find by ID
  findById: (entityArray, id) => {
    return entityArray.find(item => item.id === parseInt(id));
  },

  // Generic update by ID
  updateById: (entityArray, id, updates) => {
    const index = entityArray.findIndex(item => item.id === parseInt(id));
    if (index !== -1) {
      entityArray[index] = { ...entityArray[index], ...updates };
      return entityArray[index];
    }
    return null;
  },

  // Generic delete by ID
  deleteById: (entityArray, id) => {
    const index = entityArray.findIndex(item => item.id === parseInt(id));
    if (index !== -1) {
      return entityArray.splice(index, 1)[0];
    }
    return null;
  }
};
