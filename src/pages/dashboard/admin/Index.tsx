
import React, { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import AdminStats from "./components/AdminStats";
import RecentEngineers from "./components/RecentEngineers";
import LatestJobs from "./components/LatestJobs";
import RecentProjects from "./components/RecentProjects";
import { useDataContext } from "@/hooks/useDataContext";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [engineers, setEngineers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectManagers, setProjectManagers] = useState([]);

  const { getEngineers, getJobs, getApplications, getProjects, getProjectManagers } = useDataContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [engineersData, jobsData, applicationsData, projectsData, pmsData] = await Promise.all([
          getEngineers(),
          getJobs(),
          getApplications(),
          getProjects(),
          getProjectManagers()
        ]);
        
        setEngineers(engineersData);
        setJobs(jobsData);
        setApplications(applicationsData);
        setProjects(projectsData);
        setProjectManagers(pmsData);
      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getEngineers, getJobs, getApplications, getProjects, getProjectManagers]);

  return (
    <div className="py-8 max-w-6xl mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Last updated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <AdminStats
        loading={loading}
        engineers={engineers}
        jobs={jobs}
        applications={applications}
        projectManagers={projectManagers}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <RecentEngineers loading={loading} engineers={engineers} />
        <LatestJobs loading={loading} jobs={jobs} />
      </div>

      <div className="grid grid-cols-1 gap-8">
        <RecentProjects loading={loading} projects={projects} />
      </div>
    </div>
  );
};

export default AdminDashboard;
