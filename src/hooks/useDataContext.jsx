import { createContext, useContext } from "react";
import {
  ApplicationsProvider,
  useApplicationsContext,
} from "./contexts/ApplicationsContext";
import {
  TalentsProvider,
  useTalentsContext,
} from "./contexts/TalentsContext";
import { JobsProvider, useJobsContext } from "./contexts/JobsContext";
import {
  ProjectManagersProvider,
  useProjectManagersContext,
} from "./contexts/ProjectManagersContext";
import {
  ProjectsProvider,
  useProjectsContext,
} from "./contexts/ProjectsContext";
import {
  InterviewProvider,
  useInterviewContext,
} from "./contexts/InterviewContext";
import {
  NotificationsProvider,
  useNotificationsContext,
} from "./contexts/NotificationsContext";
import { AdminProvider, useAdminContext } from "./contexts/AdminContext";

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  return (
    <AdminProvider>
      <TalentsProvider>
        <JobsProvider>
          <ApplicationsProvider>
            <InterviewProvider>
              <ProjectsProvider>
                <ProjectManagersProvider>
                  <NotificationsProvider>
                    <DataProviderInner>{children}</DataProviderInner>
                  </NotificationsProvider>
                </ProjectManagersProvider>
              </ProjectsProvider>
            </InterviewProvider>
          </ApplicationsProvider>
        </JobsProvider>
      </TalentsProvider>
    </AdminProvider>
  );
};

const DataProviderInner = ({ children }) => {
  const talentsContext = useTalentsContext();
  const jobsContext = useJobsContext();
  const applicationsContext = useApplicationsContext();
  const projectsContext = useProjectsContext();
  const projectManagersContext = useProjectManagersContext();
  const interviewContext = useInterviewContext();
  const notificationContext = useNotificationsContext();
  const AdminContext = useAdminContext();

  const value = {
    // State
    talents: talentsContext.talents,
    talentDashboardData: talentsContext.talentDashboardData,
    talentProjects: talentsContext.talentProjects,
    jobs: jobsContext.jobs,
    jobsLoading: jobsContext.loading,
    applications: applicationsContext.applications,
    jobApplications: applicationsContext.jobApplications,
    talentApplications: applicationsContext.talentApplications,
    projects: projectsContext.projects,
    projectManagers: projectManagersContext.projectManagers,
    pmDashboardData: projectManagersContext.pmDashboardData,
    interviews: interviewContext.interviews,
    allInterviews: interviewContext.allInterviews,
    loading:
      talentsContext.loading ||
      jobsContext.loading ||
      applicationsContext.loading ||
      projectsContext.loading ||
      projectManagersContext.loading ||
      interviewContext.loading ||
      AdminContext.loading,

    // Admin
    adminDashboardData: AdminContext.adminDashboardData,
    resetAdminDashboardState: AdminContext.resetAdminDashboardState,
    inviteProjectManager: AdminContext.inviteProjectManager,

    // Talents
    getTalents: talentsContext.getTalents,
    getTalentById: talentsContext.getTalentById,
    updateTalent: talentsContext.updateTalent,
    deleteTalent: talentsContext.deleteTalent,
    resetTalentState: talentsContext.resetTalentState,
    refreshAllTalents: talentsContext.refreshAll,

    // Jobs
    getJobs: jobsContext.getJobs,
    getJobById: jobsContext.getJobById,
    createJob: jobsContext.createJob,
    updateJob: jobsContext.updateJob,
    deleteJob: jobsContext.deleteJob,
    resetJobsState: jobsContext.resetJobsState,
    refreshAllJobs: jobsContext.refreshAll,

    // Applications
    getApplications: applicationsContext.getApplications,
    getTalentsApplication: applicationsContext.getTalentsApplication,
    getApplicationsByJobId: applicationsContext.getApplicationsByJobId,
    createApplication: applicationsContext.createApplication,
    updateApplication: applicationsContext.updateApplication,
    deleteApplication: applicationsContext.deleteApplication,
    resetApplicationState: applicationsContext.resetApplicationState,

    // Projects
    // projects: projectsContext.projects,
    getProjects: projectsContext.getProjects,
    getProjectById: projectsContext.getProjectById,
    createProject: projectsContext.createProject,
    updateProject: projectsContext.updateProject,
    deleteProject: projectsContext.deleteProject,
    projectStats: projectsContext.projectStats,
    resetProjectsState: projectsContext.resetProjectsState,

    // Project Managers
    getProjectManagers: projectManagersContext.getProjectManagers,
    getPmDashboard: projectManagersContext.getPmDashboardData,
    resetPMsState: projectManagersContext.resetPMsState,

    // interview
    scheduleInterview: interviewContext.scheduleInterview,
    fetchUserInterviews: interviewContext.fetchUserInterviews,
    fetchInterviewsById: interviewContext.fetchInterviewsById,
    fetchAllInterviews: interviewContext.fetchAllInterviews,
    updateInterview: interviewContext.updateInterview,
    // rescheduleInterview: interviewContext.rescheduleInterview,
    resetInterviewState: interviewContext.resetInterviewState,
    refreshAllInterviews: interviewContext.refreshAll,

    // Notification
    getNotifications: notificationContext.getNotifications,
    markAsRead: notificationContext.markAsRead,
    markAllAsRead: notificationContext.markAllAsRead,
    notifications: notificationContext.notifications,
    unreadCount: notificationContext.unreadCount,
    notificationsEligible: notificationContext.isEligibleRole,
    resetNotificationState: notificationContext.resetNotificationState,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useDataContext must be used within a DataProvider");
  }
  return context;
};
