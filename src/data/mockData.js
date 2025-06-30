// Centralized mock data for the STECHAD platform

export const mockEngineers = [
  { 
    id: 1, 
    name: "Jane Doe", 
    email: "jane.doe@example.com", 
    country: "France", 
    skills: ["React", "TypeScript", "Node.js"], 
    isVetted: true,
    experience: "Senior",
    availability: "Available",
    joinedDate: "2024-01-15"
  },
  { 
    id: 2, 
    name: "Max Mustermann", 
    email: "max.mustermann@example.com", 
    country: "Germany", 
    skills: ["Java", "Spring", "SQL"], 
    isVetted: false,
    experience: "Mid-level",
    availability: "Available",
    joinedDate: "2024-02-10"
  },
  { 
    id: 3, 
    name: "Alice Smith", 
    email: "alice.smith@example.com", 
    country: "Spain", 
    skills: ["Python", "Django", "PostgreSQL"], 
    isVetted: true,
    experience: "Senior",
    availability: "Busy",
    joinedDate: "2024-01-20"
  },
  { 
    id: 4, 
    name: "Hong Lee", 
    email: "hong.lee@example.com", 
    country: "Poland", 
    skills: ["JavaScript", "Vue.js", "MongoDB"], 
    isVetted: false,
    experience: "Junior",
    availability: "Available",
    joinedDate: "2024-03-05"
  },
  { 
    id: 5, 
    name: "Olga Ivanova", 
    email: "olga.ivanova@example.com", 
    country: "Russia", 
    skills: ["C#", ".NET", "Azure"], 
    isVetted: true,
    experience: "Senior",
    availability: "Available",
    joinedDate: "2024-02-28"
  }
];

// Authentication users data
export const mockUsers = [
  {
    id: 1,
    email: "jane.doe@example.com",
    password: "password123",
    role: "engineer",
    name: "Jane Doe",
    profileData: {
      country: "France",
      skills: ["React", "TypeScript", "Node.js"],
      experience: "Senior",
      availability: "Available",
      isVetted: true
    }
  },
  {
    id: 2,
    email: "pm@email.com",
    password: "password123",
    role: "pm",
    name: "Pat Smith",
    profileData: {
      company: "Acme Corp",
      country: "Germany",
      activeProjects: 2,
      completedProjects: 5
    }
  },
  {
    id: 3,
    email: "admin@email.com",
    password: "password123",
    role: "admin",
    name: "Alex Admin",
    profileData: {
      role: "Platform Administrator"
    }
  }
];

export const mockJobs = [
  {
    id: 1,
    title: "React Developer",
    location: "Paris, France",
    skills: ["React", "TypeScript", "Node.js"],
    remote: true,
    status: "active",
    postedDate: "2024-06-25",
    applications: 12,
    description: "As a React Developer, you will be responsible for building modern web applications using React and related technologies. You'll work with a collaborative team, participate in design decisions, and help shape the direction of our frontend.",
    responsibilities: [
      "Develop and maintain user interfaces using React.",
      "Collaborate with backend and design teams.",
      "Write clean, scalable, and well-tested code."
    ],
    requirements: [
      "2+ years of experience with React.",
      "Familiarity with TypeScript.",
      "Experience with REST APIs."
    ],
    pmId: 1
  },
  {
    id: 2,
    title: "DevOps Engineer",
    location: "Berlin, Germany",
    skills: ["AWS", "Docker", "Kubernetes"],
    remote: false,
    status: "active",
    postedDate: "2024-06-23",
    applications: 6,
    description: "Seeking a DevOps Engineer to maintain and improve our CI/CD pipelines, manage infrastructure, and collaborate with developers to ensure smooth deployments.",
    responsibilities: [
      "Implement and manage CI/CD pipelines.",
      "Manage cloud infrastructure and containers.",
      "Monitor system health and performance."
    ],
    requirements: [
      "3+ years of DevOps experience.",
      "Hands-on with AWS and Kubernetes.",
      "Strong scripting skills (Bash, Python, etc.)."
    ],
    pmId: 2
  },
  {
    id: 3,
    title: "Java Backend Engineer",
    location: "Remote",
    skills: ["Java", "Spring", "SQL"],
    remote: true,
    status: "active",
    postedDate: "2024-06-22",
    applications: 8,
    description: "We're looking for a Java Backend Engineer to build robust APIs and scalable backend services. You will work closely with our product and frontend teams.",
    responsibilities: [
      "Design and build RESTful APIs with Spring.",
      "Optimize database queries and structures.",
      "Ensure backend scalability and security."
    ],
    requirements: [
      "Solid Java and Spring background.",
      "SQL database experience.",
      "Good understanding of API security."
    ],
    pmId: 1
  }
];

export const mockApplications = [
  {
    id: 1,
    jobId: 1,
    engineerId: 1,
    engineerName: "Jane Doe",
    jobTitle: "React Developer",
    status: "pending",
    appliedDate: "2024-06-26",
    coverLetter: "I am very interested in this React Developer position...",
    experience: "Senior",
    skills: ["React", "TypeScript", "Node.js"]
  },
  {
    id: 2,
    jobId: 1,
    engineerId: 3,
    engineerName: "Alice Smith",
    jobTitle: "React Developer",
    status: "reviewed",
    appliedDate: "2024-06-25",
    coverLetter: "With my experience in frontend development...",
    experience: "Senior",
    skills: ["Python", "Django", "PostgreSQL"]
  },
  {
    id: 3,
    jobId: 2,
    engineerId: 2,
    engineerName: "Max Mustermann",
    jobTitle: "DevOps Engineer",
    status: "rejected",
    appliedDate: "2024-06-24",
    coverLetter: "I have extensive experience with DevOps practices...",
    experience: "Mid-level",
    skills: ["Java", "Spring", "SQL"]
  },
  {
    id: 4,
    jobId: 3,
    engineerId: 4,
    engineerName: "Hong Lee",
    jobTitle: "Java Backend Engineer",
    status: "pending",
    appliedDate: "2024-06-23",
    coverLetter: "I am excited about the opportunity to work as a Java Backend Engineer...",
    experience: "Junior",
    skills: ["JavaScript", "Vue.js", "MongoDB"]
  }
];

export const mockProjects = [
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

export const mockProjectManagers = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@company.com",
    company: "TechCorp Inc.",
    activeProjects: 2,
    completedProjects: 5,
    joinedDate: "2023-08-15",
    status: "active"
  },
  {
    id: 2,
    name: "Alice Smith",
    email: "alice.smith@startup.io",
    company: "StartupIO",
    activeProjects: 1,
    completedProjects: 3,
    joinedDate: "2023-11-20",
    status: "active"
  }
];

// Mock interviews data
export const mockInterviews = [
  {
    id: 1,
    candidateName: "Jane Doe",
    candidateEmail: "jane@example.com",
    candidateId: 1,
    interviewerEmail: "pm@company.com",
    interviewerId: 1,
    jobId: 1,
    jobTitle: "React Developer",
    dateTime: "2025-07-05T14:00:00Z",
    duration: 60,
    phoneNumber: "+1234567890",
    zoomLink: "https://zoom.us/j/123456789",
    calendarEventId: "google-calendar-event-id-1",
    status: "scheduled", // scheduled, completed, cancelled, rescheduled
    notes: "",
    createdAt: "2025-06-30T10:00:00Z"
  },
  {
    id: 2,
    candidateName: "Max Mustermann",
    candidateEmail: "max@example.com",
    candidateId: 2,
    interviewerEmail: "pm@company.com",
    interviewerId: 1,
    jobId: 2,
    jobTitle: "DevOps Engineer",
    dateTime: "2025-07-08T16:00:00Z",
    duration: 45,
    phoneNumber: "+0987654321",
    zoomLink: "https://zoom.us/j/987654321",
    calendarEventId: "google-calendar-event-id-2",
    status: "scheduled",
    notes: "",
    createdAt: "2025-06-29T15:00:00Z"
  }
];

// Helper function to simulate API delay
export const simulateDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Generate unique IDs
export const generateId = () => Date.now() + Math.random();

// Interview API functions
export const interviewAPI = {
  // Schedule new interview
  schedule: async (interviewData) => {
    await simulateDelay(800);
    
    // Simulate API call to backend
    const response = {
      success: true,
      interview: {
        id: generateId(),
        candidateName: interviewData.candidateName,
        candidateEmail: interviewData.candidateEmail,
        candidateId: interviewData.candidateId,
        interviewerEmail: interviewData.interviewerEmail,
        interviewerId: interviewData.interviewerId,
        jobId: interviewData.jobId,
        jobTitle: interviewData.jobTitle,
        dateTime: interviewData.dateTime,
        duration: interviewData.duration,
        phoneNumber: interviewData.phoneNumber,
        zoomLink: "https://zoom.us/j/" + Math.floor(Math.random() * 1000000000),
        calendarEventId: "google-calendar-event-id-" + generateId(),
        status: "scheduled",
        notes: interviewData.notes || "",
        createdAt: new Date().toISOString()
      }
    };
    
    return response;
  },

  // Get interviews for a user
  getInterviews: async (userId, userRole) => {
    await simulateDelay(500);
    
    let filteredInterviews = [...mockInterviews];
    
    if (userRole === 'engineer') {
      filteredInterviews = filteredInterviews.filter(interview => 
        interview.candidateId === userId
      );
    } else if (userRole === 'pm') {
      filteredInterviews = filteredInterviews.filter(interview => 
        interview.interviewerId === userId
      );
    }
    
    return filteredInterviews;
  },

  // Update interview (reschedule, cancel, etc.)
  updateInterview: async (interviewId, updateData) => {
    await simulateDelay(600);
    
    const response = {
      success: true,
      interview: {
        id: interviewId,
        ...updateData,
        updatedAt: new Date().toISOString()
      }
    };
    
    return response;
  },

  // Cancel interview
  cancelInterview: async (interviewId, reason) => {
    await simulateDelay(500);
    
    const response = {
      success: true,
      interview: {
        id: interviewId,
        status: "cancelled",
        cancellationReason: reason,
        cancelledAt: new Date().toISOString()
      }
    };
    
    return response;
  },

  // Reschedule interview
  rescheduleInterview: async (interviewId, newDateTime, reason) => {
    await simulateDelay(700);
    
    const response = {
      success: true,
      interview: {
        id: interviewId,
        dateTime: newDateTime,
        status: "rescheduled",
        rescheduleReason: reason,
        rescheduledAt: new Date().toISOString(),
        zoomLink: "https://zoom.us/j/" + Math.floor(Math.random() * 1000000000),
        calendarEventId: "google-calendar-event-id-" + generateId()
      }
    };
    
    return response;
  }
};

// Authentication API functions
export const authAPI = {
  login: async (email, password, role) => {
    await simulateDelay(800);
    const user = mockUsers.find(u => u.email === email && u.password === password && u.role === role);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      profileData: user.profileData
    };
  },

  signup: async (userData) => {
    await simulateDelay(1000);
    const existingUser = mockUsers.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }
    const newUser = {
      id: generateId(),
      email: userData.email,
      password: userData.password,
      role: userData.role || 'engineer',
      name: userData.name,
      profileData: userData.profileData || {}
    };
    mockUsers.push(newUser);
    return {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
      profileData: newUser.profileData
    };
  },

  updateProfile: async (userId, profileData) => {
    await simulateDelay(500);
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    mockUsers[userIndex] = { 
      ...mockUsers[userIndex], 
      ...profileData,
      profileData: { ...mockUsers[userIndex].profileData, ...profileData.profileData }
    };
    return mockUsers[userIndex];
  }
};
