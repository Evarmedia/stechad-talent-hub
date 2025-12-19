
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye } from "lucide-react";
import { Link } from "react-router-dom";

interface JobsGridProps {
  loading: boolean;
  jobs: any[];
  onViewJob: (job: any) => void;
  onToggleStatus: (job: any) => void;
  getStatusColor: (status: string) => string;
}

export const JobsGrid = ({ 
  loading, 
  jobs, 
  onViewJob, 
  onToggleStatus, 
  getStatusColor 
}: JobsGridProps) => {
  if (loading) {
    return (
      <div className="md:hidden space-y-4">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="md:hidden space-y-4">
      {jobs.map((job) => (
        <div key={job.jobs_id} className="border rounded-lg p-4 space-y-3">
          <div>
            <h3 className="font-medium text-base">{job.title}</h3>
            <p className="text-sm text-muted-foreground">{job.company}</p>
          </div>
          
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Location: </span>
              <span>{job.location}</span>
            </div>
            <div>
              <span className="font-medium">Posted: GRID-</span>
              <span>{job.posted_at.split("T")[0]}</span>
            </div>
            <div>
              <span className="font-medium">Applications: </span>
              <span>{job.applications_count}</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Badge className={getStatusColor(job.status)}>
              {job.status}
            </Badge>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => onViewJob(job)}>
                <Eye className="w-3 h-3 mr-1" />
                Details
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link to={`/dashboard/pm/applicants/${job.jobs_id}`}>
                  View Apps
                </Link>
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onToggleStatus(job)}
              >
                {job.status === "active" ? "Close" : "Reopen"}
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
