
import React, { createContext, useContext } from 'react';
import { EngineersProvider, useEngineersContext } from './contexts/EngineersContext';
import { JobsProvider, useJobsContext } from './contexts/JobsContext';
import { ApplicationsProvider, useApplicationsContext } from './contexts/ApplicationsContext';
import { ProjectsProvider, useProjectsContext } from './contexts/ProjectsContext';
import { ProjectManagersProvider, useProjectManagersContext } from './contexts/ProjectManagersContext';
import { ChatProvider, useChatContext } from './contexts/ChatContext';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  return (
    <EngineersProvider>
      <JobsProvider>
        <ApplicationsProvider>
          <ProjectsProvider>
            <ProjectManagersProvider>
              <ChatProvider>
                <DataProviderInner>
                  {children}
                </DataProviderInner>
              </ChatProvider>
            </ProjectManagersProvider>
          </ProjectsProvider>
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
  const chatContext = useChatContext();

  const value = {
    // State
    engineers: engineersContext.engineers,
    jobs: jobsContext.jobs,
    applications: applicationsContext.applications,
    projects: projectsContext.projects,
    projectManagers: projectManagersContext.projectManagers,
    chats: chatContext.chats,
    loading: engineersContext.loading || jobsContext.loading || applicationsContext.loading || projectsContext.loading || projectManagersContext.loading || chatContext.loading,
    
    // Engineers
    getEngineers: engineersContext.getEngineers,
    getEngineerById: engineersContext.getEngineerById,
    updateEngineer: engineersContext.updateEngineer,
    deleteEngineer: engineersContext.deleteEngineer,
    
    // Jobs
    getJobs: jobsContext.getJobs,
    getJobById: jobsContext.getJobById,
    createJob: jobsContext.createJob,
    updateJob: jobsContext.updateJob,
    deleteJob: jobsContext.deleteJob,
    
    // Applications
    getApplications: applicationsContext.getApplications,
    createApplication: applicationsContext.createApplication,
    updateApplication: applicationsContext.updateApplication,
    deleteApplication: applicationsContext.deleteApplication,
    
    // Projects
    getProjects: projectsContext.getProjects,
    getProjectById: projectsContext.getProjectById,
    createProject: projectsContext.createProject,
    updateProject: projectsContext.updateProject,
    deleteProject: projectsContext.deleteProject,
    
    // Project Managers
    getProjectManagers: projectManagersContext.getProjectManagers,
    
    // Chat
    getChatsForUser: chatContext.getChatsForUser,
    getChatById: chatContext.getChatById,
    sendMessage: chatContext.sendMessage,
    markMessagesAsRead: chatContext.markMessagesAsRead,
    createChat: chatContext.createChat
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
