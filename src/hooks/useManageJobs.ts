
import { useState, useEffect } from "react";
import { useDataContext } from "@/hooks/useDataContext";

export const useManageJobs = () => {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const { getJobs, getApplications, updateJob, deleteJob } = useDataContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsData, applicationsData] = await Promise.all([
          getJobs(),
          getApplications()
        ]);
        
        // Calculate application counts for each job
        const jobsWithRealApplications = jobsData.map((job: any) => {
          const jobApplications = applicationsData.filter((app: any) => app.jobId === job.id);
          return {
            ...job,
            applications: jobApplications.length
          };
        });
        
        setJobs(jobsWithRealApplications);
        setApplications(applicationsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getJobs, getApplications]);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewJob = (job: any) => {
    setSelectedJob(job);
    setIsDetailsOpen(true);
  };

  const handleToggleStatus = async (job: any) => {
    try {
      const newStatus = job.status === "active" ? "closed" : "active";
      await updateJob(job.id, { status: newStatus });
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: newStatus } : j));
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  };

  const handleDeleteJob = async (jobId: number) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await deleteJob(jobId);
        setJobs(prev => prev.filter(j => j.id !== jobId));
      } catch (error) {
        console.error('Error deleting job:', error);
      }
    }
  };

  return {
    loading,
    filteredJobs,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    selectedJob,
    isDetailsOpen,
    setIsDetailsOpen,
    handleViewJob,
    handleToggleStatus,
    handleDeleteJob
  };
};
