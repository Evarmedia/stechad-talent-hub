
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
  const [jobsList, setJobsList] = useState([]);
  const [applying, setApplying] = useState<number | null>(null);
  const [userApplications, setUserApplications] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const { getJobs, loading, createApplication, getApplications } = useDataContext();
  const { user } = useAuthContext();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [jobs, applications] = await Promise.all([
          getJobs(),
          user ? getApplications({ engineerId: user.id }) : Promise.resolve([])
        ]);
        
        setJobsList(jobs);
        setUserApplications(applications);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInitialData();
  }, [user?.id]);

  useEffect(() => {
    if (!search || initialLoading) return;
    
    const searchJobs = async () => {
      const filters = { search };
      const jobs = await getJobs(filters);
      setJobsList(jobs);
    };

    const debounceTimer = setTimeout(searchJobs, 300);
    return () => clearTimeout(debounceTimer);
  }, [search, getJobs, initialLoading]);

  const handleApply = async (jobId: number, jobTitle: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to apply for jobs",
        variant: "destructive"
      });
      return;
    }

    const hasApplied = userApplications.some(app => app.jobId === jobId);
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
      await createApplication({
        jobId,
        jobTitle,
        engineerId: user.id,
        status: "pending"
      });
      
      const applications = await getApplications({ engineerId: user.id });
      setUserApplications(applications);
      
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

  const filteredJobs = jobsList.filter(
    (job) => job.title.toLowerCase().includes(search.toLowerCase())
  );

  const isLoading = initialLoading || loading;

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
