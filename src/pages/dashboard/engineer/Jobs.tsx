import { toast } from "@/hooks/use-toast";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useDataContext } from "@/hooks/useDataContext";
import { useEffect, useState } from "react";
import JobDetailsModal from "./components/JobDetailsModal";
import JobsGrid from "./components/JobsGrid";
import JobsHeader from "./components/JobsHeader";

const EngineerJobs = () => {
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [applying, setApplying] = useState<string | null>(null);
  const [userApplications, setUserApplications] = useState([]);

  const { 
    jobs, 
    loading, 
    getJobs,
    createApplication, 
    getEngineersApplication 
  } = useDataContext();

  const { user } = useAuthContext();

  // -------------------------------------------------------------
  // FETCH USER'S APPLICATIONS ON LOGIN
  // -------------------------------------------------------------
  useEffect(() => {
    const loadApplications = async () => {
      if (!user) return;
      const apps = await getEngineersApplication();
      setUserApplications(apps || []);
    };

    loadApplications();
  }, [user?.user_id]);

  // -------------------------------------------------------------
  // SEARCH & FILTER (Debounced API call)
  // -------------------------------------------------------------
  useEffect(() => {
    if (!getJobs) return;

    const debounceTimer = setTimeout(() => {
      const filters = { search };
      getJobs(filters);   // updates global context
    }, 3000);

    return () => clearTimeout(debounceTimer);
  }, [search]);

  // -------------------------------------------------------------
  // APPLY TO JOB
  // -------------------------------------------------------------
  const handleApply = async (jobId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to apply for jobs",
        variant: "destructive"
      });
      return;
    }

    const hasApplied = userApplications.some(a => a.job_id === jobId);
    if (hasApplied) {
      toast({
        title: "Error",
        description: "You have already applied to this job",
        variant: "destructive"
      });
      return;
    }

    setApplying(jobId);
    try {
      await createApplication(jobId);

      const apps = await getEngineersApplication();
      setUserApplications(apps || []);

      toast({
        title: "Success",
        description: "Application submitted successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setApplying(null);
    }
  };

  // -------------------------------------------------------------
  // LOCAL FILTER (fast UI filter after global fetch)
  // -------------------------------------------------------------
  const filteredJobs = jobs.filter(job =>
    job.title?.toLowerCase().includes(search.toLowerCase())
  );

  const isLoading = loading;

  return (
    <div className="p-8">
      <JobsHeader 
        search={search}
        onSearchChange={setSearch}
      />
      
      <JobsGrid
        jobs={filteredJobs}
        isLoading={isLoading}
        userApplications={userApplications}
        applyingJobId={applying}
        onApply={handleApply}
        onViewDetails={setSelectedJob}
      />

      <JobDetailsModal
        job={selectedJob}
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
      />
    </div>
  );
};

export default EngineerJobs;
