
import { useState, useEffect } from "react";
import { useDataContext } from "@/hooks/useDataContext";

type ManagedJob = {
  jobs_id: string;
  job_id?: string;
  title: string;
  company: string;
  status: string;
};

type JobApplication = {
  jobId?: string;
};

export const useManageJobs = () => {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedJob, setSelectedJob] = useState<ManagedJob | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const { jobs, getJobs, getApplications, updateJob } = useDataContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [applicationsData] = await Promise.all([
          // getJobs(),
          getApplications()
        ]);
        
        setApplications(applicationsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getApplications]);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewJob = (job: ManagedJob) => {
    setSelectedJob(job);
    setIsDetailsOpen(true);
  };

  const handleToggleStatus = async (job: ManagedJob) => {
    try {
      const newStatus = job.status === "active" ? "closed" : "active";
      await updateJob(job.jobs_id, { status: newStatus });
      // setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: newStatus } : j));
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  };

  return {
    loading,
    filteredJobs,
    applications,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    selectedJob,
    isDetailsOpen,
    setIsDetailsOpen,
    handleViewJob,
    handleToggleStatus
  };
};
