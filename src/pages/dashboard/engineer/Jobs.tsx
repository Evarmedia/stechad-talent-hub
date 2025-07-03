
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useDataContext } from "@/hooks/useDataContext";
import { useAuthContext } from "@/hooks/useAuthContext";
import { toast } from "@/hooks/use-toast";

const EngineerJobs = () => {
  const [search, setSearch] = useState("");
  const [openJD, setOpenJD] = useState<number | null>(null);
  const [jobsList, setJobsList] = useState([]);
  const [applying, setApplying] = useState<number | null>(null);
  const [userApplications, setUserApplications] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const { getJobs, loading, createApplication, getApplications } = useDataContext();
  const { user } = useAuthContext();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch jobs and user applications in parallel
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

  // Separate effect for search filtering to avoid refetching all data
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

  const hasAppliedToJob = (jobId: number) => {
    return userApplications.some(app => app.jobId === jobId);
  };

  const handleApply = async (jobId: number, jobTitle: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to apply for jobs",
        variant: "destructive"
      });
      return;
    }

    if (hasAppliedToJob(jobId)) {
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
      
      // Refresh applications list
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

  const filtered = jobsList.filter(
    (job) => job.title.toLowerCase().includes(search.toLowerCase())
  );

  const isLoading = initialLoading || loading;

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-2">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search jobs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" disabled>
          Filter by Skills (coming soon)
        </Button>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {isLoading ? (
          Array(3)
            .fill(0)
            .map((_, i) => (
              <Card className="mb-4" key={i}>
                <CardHeader>
                  <CardTitle>
                    <Skeleton className="h-6 w-2/3 mb-2" />
                  </CardTitle>
                  <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-3">
                    <Skeleton className="h-6 w-16 rounded px-2 py-1" />
                    <Skeleton className="h-6 w-12 rounded px-2 py-1" />
                    <Skeleton className="h-6 w-20 rounded px-2 py-1" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-9 w-20 rounded" />
                    <Skeleton className="h-9 w-20 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))
        ) : (
          <>
            {filtered.map((job, idx) => (
              <React.Fragment key={job.id}>
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle className="flex justify-between">
                      {job.title}
                      {job.remote && (
                        <span className="text-green-600 text-xs">Remote</span>
                      )}
                    </CardTitle>
                    <div className="text-sm text-text-muted">{job.location}</div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {job.skills.map((skill) => (
                        <span
                          key={skill}
                          className="bg-primary-light text-primary rounded px-2 py-1 text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleApply(job.id, job.title)}
                        disabled={applying === job.id || hasAppliedToJob(job.id)}
                      >
                        {applying === job.id 
                          ? "Applying..." 
                          : hasAppliedToJob(job.id) 
                            ? "Already Applied" 
                            : "Apply"
                        }
                      </Button>
                      <Dialog open={openJD === job.id} onOpenChange={open => setOpenJD(open ? job.id : null)}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            View JD
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{job.title} - Job Details</DialogTitle>
                            <DialogDescription>
                              <span className="text-xs text-muted-foreground">
                                {job.location} {job.remote && "｜Remote"}
                              </span>
                            </DialogDescription>
                          </DialogHeader>
                          <div className="mb-3">
                            <strong className="block text-primary mb-1">
                              Description
                            </strong>
                            <div>{job.description}</div>
                          </div>
                          <div className="mb-3">
                            <strong className="block text-primary mb-1">
                              Responsibilities
                            </strong>
                            <ul className="list-disc ml-6 text-sm">
                              {job.responsibilities.map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <strong className="block text-primary mb-1">
                              Requirements
                            </strong>
                            <ul className="list-disc ml-6 text-sm">
                              {job.requirements.map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </div>
                          <DialogFooter>
                            <Button onClick={() => setOpenJD(null)} variant="secondary">
                              Close
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              </React.Fragment>
            ))}
            {filtered.length === 0 && <div>No jobs found.</div>}
          </>
        )}
      </div>
    </div>
  );
};

export default EngineerJobs;
