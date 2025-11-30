
import React, { createContext, useContext } from 'react';
import { EngineersProvider, useEngineersContext } from './contexts/EngineersContext';
import { JobsProvider, useJobsContext } from './contexts/JobsContext';
import { ApplicationsProvider, useApplicationsContext } from './contexts/ApplicationsContext';
import { ProjectsProvider, useProjectsContext } from './contexts/ProjectsContext';
import { ProjectManagersProvider, useProjectManagersContext } from './contexts/ProjectManagersContext';

import { InterviewProvider, useInterviewContext } from './contexts/InterviewContext'

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  return (
    <EngineersProvider>
      <JobsProvider>
        <ApplicationsProvider>
          <InterviewProvider>
          <ProjectsProvider>
            <ProjectManagersProvider>
              <DataProviderInner>
                {children}
              </DataProviderInner>
            </ProjectManagersProvider>
          </ProjectsProvider>
          </InterviewProvider>
        </ApplicationsProvider>
      </JobsProvider>
    </EngineersProvider>
  );
};

const DataProviderInner = ({ children }) => {
  const engineersContext = useEngineersContext();
  const jobsContext = useJobsContext();
  const applicationsContext = useApplicationsContext();
  const projectsContext = useProjectsContext();
  const projectManagersContext = useProjectManagersContext();
  const interviewContext = useInterviewContext();

  const value = {
    // State
    engineers: engineersContext.engineers,
    engrDashboardData: engineersContext.engrDashboardData,
    engrProjects: engineersContext.engrProjects,
    jobs: jobsContext.jobs,
    applications: applicationsContext.applications,
    engrApplications: applicationsContext.engrApplications,
    projects: projectsContext.projects,
    projectManagers: projectManagersContext.projectManagers,
    interviews: interviewContext.interviews,
    allInterviews: interviewContext.allInterviews,
    loading: engineersContext.loading || jobsContext.loading || applicationsContext.loading || projectsContext.loading || projectManagersContext.loading || interviewContext.loading,
    
    // Engineers
    getEngineers: engineersContext.getEngineers,
    getEngineerById: engineersContext.getEngineerById,
    updateEngineer: engineersContext.updateEngineer,
    deleteEngineer: engineersContext.deleteEngineer,
    resetEngineerState: engineersContext.resetEngineerState,
    
    // Jobs
    getJobs: jobsContext.getJobs,
    getJobById: jobsContext.getJobById,
    createJob: jobsContext.createJob,
    updateJob: jobsContext.updateJob,
    deleteJob: jobsContext.deleteJob,
    resetJobs: jobsContext.resetJobs,
    
    // Applications
    getApplications: applicationsContext.getApplications,
    getEngineersApplication: applicationsContext.getEngineersApplication,
    getApplicationsByJobId: applicationsContext.getApplicationsByJobId,
    createApplication: applicationsContext.createApplication,
    updateApplication: applicationsContext.updateApplication,
    deleteApplication: applicationsContext.deleteApplication,
    
    // Projects
    getProjects: projectsContext.getProjects,
    getProjectById: projectsContext.getProjectById,
    createProject: projectsContext.createProject,
    updateProject: projectsContext.updateProject,
    deleteProject: projectsContext.deleteProject,
    projectStats: projectsContext.projectStats,
    
    // Project Managers
    getProjectManagers: projectManagersContext.getProjectManagers,

    // interview
    scheduleInterview: interviewContext.scheduleInterview,
    fetchUserInterviews: interviewContext.fetchUserInterviews,
    fetchInterviewsById: interviewContext.fetchInterviewsById,
    fetchAllInterviews: interviewContext.fetchAllInterviews,
    updateInterview: interviewContext.updateInterview,
    rescheduleInterview: interviewContext.rescheduleInterview,
    resetInterview: interviewContext.resetInterview,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};
