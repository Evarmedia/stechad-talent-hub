
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { mockData, dataHelpers } from '../data/mockData';

// Create context
const DataContext = createContext();

// Action types
const ACTION_TYPES = {
  // Engineers
  LOAD_ENGINEERS: 'LOAD_ENGINEERS',
  ADD_ENGINEER: 'ADD_ENGINEER',
  UPDATE_ENGINEER: 'UPDATE_ENGINEER',
  DELETE_ENGINEER: 'DELETE_ENGINEER',
  
  // Jobs
  LOAD_JOBS: 'LOAD_JOBS',
  ADD_JOB: 'ADD_JOB',
  UPDATE_JOB: 'UPDATE_JOB',
  DELETE_JOB: 'DELETE_JOB',
  
  // Applications
  LOAD_APPLICATIONS: 'LOAD_APPLICATIONS',
  ADD_APPLICATION: 'ADD_APPLICATION',
  UPDATE_APPLICATION: 'UPDATE_APPLICATION',
  DELETE_APPLICATION: 'DELETE_APPLICATION',
  
  // Applicants
  LOAD_APPLICANTS: 'LOAD_APPLICANTS',
  UPDATE_APPLICANT_STATUS: 'UPDATE_APPLICANT_STATUS',
  
  // Projects
  LOAD_PROJECTS: 'LOAD_PROJECTS',
  ADD_PROJECT: 'ADD_PROJECT',
  UPDATE_PROJECT: 'UPDATE_PROJECT',
  DELETE_PROJECT: 'DELETE_PROJECT',
  
  // Project Managers
  LOAD_PROJECT_MANAGERS: 'LOAD_PROJECT_MANAGERS',
  ADD_PROJECT_MANAGER: 'ADD_PROJECT_MANAGER',
  UPDATE_PROJECT_MANAGER: 'UPDATE_PROJECT_MANAGER',
  DELETE_PROJECT_MANAGER: 'DELETE_PROJECT_MANAGER',
  
  // Generic
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR'
};

// Initial state
const initialState = {
  engineers: [...mockData.engineers],
  jobs: [...mockData.jobs],
  applications: [...mockData.applications],
  applicants: [...mockData.applicants],
  projects: [...mockData.projects],
  projectManagers: [...mockData.projectManagers],
  loading: false,
  error: null
};

// Reducer
const dataReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ACTION_TYPES.SET_ERROR:
      return { ...state, error: action.payload };
    
    // Engineers
    case ACTION_TYPES.LOAD_ENGINEERS:
      return { ...state, engineers: action.payload };
    
    case ACTION_TYPES.ADD_ENGINEER:
      return { ...state, engineers: [...state.engineers, action.payload] };
    
    case ACTION_TYPES.UPDATE_ENGINEER:
      return {
        ...state,
        engineers: state.engineers.map(eng => 
          eng.id === action.payload.id ? { ...eng, ...action.payload.updates } : eng
        )
      };
    
    case ACTION_TYPES.DELETE_ENGINEER:
      return {
        ...state,
        engineers: state.engineers.filter(eng => eng.id !== action.payload)
      };
    
    // Jobs
    case ACTION_TYPES.LOAD_JOBS:
      return { ...state, jobs: action.payload };
    
    case ACTION_TYPES.ADD_JOB:
      return { ...state, jobs: [...state.jobs, action.payload] };
    
    case ACTION_TYPES.UPDATE_JOB:
      return {
        ...state,
        jobs: state.jobs.map(job => 
          job.id === action.payload.id ? { ...job, ...action.payload.updates } : job
        )
      };
    
    case ACTION_TYPES.DELETE_JOB:
      return {
        ...state,
        jobs: state.jobs.filter(job => job.id !== action.payload)
      };
    
    // Applications
    case ACTION_TYPES.LOAD_APPLICATIONS:
      return { ...state, applications: action.payload };
    
    case ACTION_TYPES.ADD_APPLICATION:
      return { ...state, applications: [...state.applications, action.payload] };
    
    case ACTION_TYPES.UPDATE_APPLICATION:
      return {
        ...state,
        applications: state.applications.map(app => 
          app.id === action.payload.id ? { ...app, ...action.payload.updates } : app
        )
      };
    
    case ACTION_TYPES.DELETE_APPLICATION:
      return {
        ...state,
        applications: state.applications.filter(app => app.id !== action.payload)
      };
    
    // Applicants
    case ACTION_TYPES.LOAD_APPLICANTS:
      return { ...state, applicants: action.payload };
    
    case ACTION_TYPES.UPDATE_APPLICANT_STATUS:
      return {
        ...state,
        applicants: state.applicants.map(applicant => 
          applicant.id === action.payload.id ? { ...applicant, status: action.payload.status } : applicant
        )
      };
    
    // Projects
    case ACTION_TYPES.LOAD_PROJECTS:
      return { ...state, projects: action.payload };
    
    case ACTION_TYPES.ADD_PROJECT:
      return { ...state, projects: [...state.projects, action.payload] };
    
    case ACTION_TYPES.UPDATE_PROJECT:
      return {
        ...state,
        projects: state.projects.map(project => 
          project.id === action.payload.id ? { ...project, ...action.payload.updates } : project
        )
      };
    
    case ACTION_TYPES.DELETE_PROJECT:
      return {
        ...state,
        projects: state.projects.filter(project => project.id !== action.payload)
      };
    
    // Project Managers
    case ACTION_TYPES.LOAD_PROJECT_MANAGERS:
      return { ...state, projectManagers: action.payload };
    
    case ACTION_TYPES.ADD_PROJECT_MANAGER:
      return { ...state, projectManagers: [...state.projectManagers, action.payload] };
    
    case ACTION_TYPES.UPDATE_PROJECT_MANAGER:
      return {
        ...state,
        projectManagers: state.projectManagers.map(pm => 
          pm.id === action.payload.id ? { ...pm, ...action.payload.updates } : pm
        )
      };
    
    case ACTION_TYPES.DELETE_PROJECT_MANAGER:
      return {
        ...state,
        projectManagers: state.projectManagers.filter(pm => pm.id !== action.payload)
      };
    
    default:
      return state;
  }
};

// Provider component
export const DataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  // Simulate API delay
  const simulateApiDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

  // Engineers actions
  const engineersActions = {
    getAll: useCallback(async () => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      await simulateApiDelay();
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      return state.engineers;
    }, [state.engineers]),

    getById: useCallback(async (id) => {
      await simulateApiDelay();
      return dataHelpers.findById(state.engineers, id);
    }, [state.engineers]),

    create: useCallback(async (engineerData) => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      await simulateApiDelay();
      const newEngineer = {
        ...engineerData,
        id: dataHelpers.generateId(state.engineers)
      };
      dispatch({ type: ACTION_TYPES.ADD_ENGINEER, payload: newEngineer });
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      return newEngineer;
    }, [state.engineers]),

    update: useCallback(async (id, updates) => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      await simulateApiDelay();
      dispatch({ type: ACTION_TYPES.UPDATE_ENGINEER, payload: { id: parseInt(id), updates } });
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      return dataHelpers.findById(state.engineers, id);
    }, [state.engineers]),

    delete: useCallback(async (id) => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      await simulateApiDelay();
      dispatch({ type: ACTION_TYPES.DELETE_ENGINEER, payload: parseInt(id) });
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      return true;
    }, [])
  };

  // Jobs actions
  const jobsActions = {
    getAll: useCallback(async () => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      await simulateApiDelay();
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      return state.jobs;
    }, [state.jobs]),

    getById: useCallback(async (id) => {
      await simulateApiDelay();
      return dataHelpers.findById(state.jobs, id);
    }, [state.jobs]),

    create: useCallback(async (jobData) => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      await simulateApiDelay();
      const newJob = {
        ...jobData,
        id: dataHelpers.generateId(state.jobs),
        posted: new Date().toISOString().split('T')[0],
        applications: 0
      };
      dispatch({ type: ACTION_TYPES.ADD_JOB, payload: newJob });
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      return newJob;
    }, [state.jobs]),

    update: useCallback(async (id, updates) => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      await simulateApiDelay();
      dispatch({ type: ACTION_TYPES.UPDATE_JOB, payload: { id: parseInt(id), updates } });
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      return dataHelpers.findById(state.jobs, id);
    }, [state.jobs]),

    delete: useCallback(async (id) => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      await simulateApiDelay();
      dispatch({ type: ACTION_TYPES.DELETE_JOB, payload: parseInt(id) });
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      return true;
    }, [])
  };

  // Applications actions
  const applicationsActions = {
    getAll: useCallback(async () => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      await simulateApiDelay();
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      return state.applications;
    }, [state.applications]),

    getByJobId: useCallback(async (jobId) => {
      await simulateApiDelay();
      return state.applications.filter(app => app.jobId === parseInt(jobId));
    }, [state.applications]),

    create: useCallback(async (applicationData) => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      await simulateApiDelay();
      const newApplication = {
        ...applicationData,
        id: dataHelpers.generateId(state.applications),
        date: new Date().toISOString().split('T')[0],
        status: 'Pending'
      };
      dispatch({ type: ACTION_TYPES.ADD_APPLICATION, payload: newApplication });
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      return newApplication;
    }, [state.applications]),

    updateStatus: useCallback(async (id, status) => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      await simulateApiDelay();
      dispatch({ type: ACTION_TYPES.UPDATE_APPLICATION, payload: { id: parseInt(id), updates: { status } } });
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      return true;
    }, [])
  };

  // Applicants actions
  const applicantsActions = {
    getByJobId: useCallback(async (jobId) => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      await simulateApiDelay();
      const jobApplicants = state.applicants.filter(app => app.jobId === parseInt(jobId));
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      return jobApplicants;
    }, [state.applicants]),

    updateStatus: useCallback(async (applicantIndex, status) => {
      await simulateApiDelay();
      const applicant = state.applicants[applicantIndex];
      if (applicant) {
        dispatch({ 
          type: ACTION_TYPES.UPDATE_APPLICANT_STATUS, 
          payload: { id: applicant.id, status } 
        });
      }
      return true;
    }, [state.applicants])
  };

  // Projects actions
  const projectsActions = {
    getAll: useCallback(async () => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      await simulateApiDelay();
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      return state.projects;
    }, [state.projects]),

    getById: useCallback(async (id) => {
      await simulateApiDelay();
      return dataHelpers.findById(state.projects, id);
    }, [state.projects]),

    create: useCallback(async (projectData) => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      await simulateApiDelay();
      const newProject = {
        ...projectData,
        id: dataHelpers.generateId(state.projects)
      };
      dispatch({ type: ACTION_TYPES.ADD_PROJECT, payload: newProject });
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      return newProject;
    }, [state.projects]),

    update: useCallback(async (id, updates) => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      await simulateApiDelay();
      dispatch({ type: ACTION_TYPES.UPDATE_PROJECT, payload: { id: parseInt(id), updates } });
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      return dataHelpers.findById(state.projects, id);
    }, [state.projects]),

    delete: useCallback(async (id) => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      await simulateApiDelay();
      dispatch({ type: ACTION_TYPES.DELETE_PROJECT, payload: parseInt(id) });
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      return true;
    }, [])
  };

  // Project Managers actions
  const projectManagersActions = {
    getAll: useCallback(async () => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      await simulateApiDelay();
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      return state.projectManagers;
    }, [state.projectManagers]),

    create: useCallback(async (pmData) => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      await simulateApiDelay();
      const newPM = {
        ...pmData,
        id: dataHelpers.generateId(state.projectManagers),
        projectsCount: 0,
        status: "Pending",
        joinedAt: new Date().toISOString().split('T')[0]
      };
      dispatch({ type: ACTION_TYPES.ADD_PROJECT_MANAGER, payload: newPM });
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      return newPM;
    }, [state.projectManagers])
  };

  const value = {
    // State
    ...state,
    
    // Actions
    engineers: engineersActions,
    jobs: jobsActions,
    applications: applicationsActions,
    applicants: applicantsActions,
    projects: projectsActions,
    projectManagers: projectManagersActions
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

// Custom hook to use the context
export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};
