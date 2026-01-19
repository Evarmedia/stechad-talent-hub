
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import JobCard from "./JobCard";

interface JobsGridProps {
  jobs: any[];
  isLoading: boolean;
  userApplications: any[];
  applyingJobId: string | null;
  onApply: (jobId: string,) => void;
  onViewDetails: (job: any) => void;
}

const JobsGrid: React.FC<JobsGridProps> = ({
  jobs,
  isLoading,
  userApplications,
  applyingJobId,
  onApply,
  onViewDetails
}) => {
  const hasAppliedToJob = (jobId: string) => {
    return userApplications.some(app => app.jobs_id === jobId);
  };

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-6">
        {Array(3).fill(0).map((_, i) => (
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
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return <div>No jobs found.</div>;
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {jobs.map((job) => (
        <JobCard
          key={job.jobs_id}
          job={job}
          hasApplied={hasAppliedToJob(job.jobs_id)}
          isApplying={applyingJobId === job.jobs_id}
          onApply={onApply}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};

export default JobsGrid;
