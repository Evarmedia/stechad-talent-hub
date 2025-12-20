
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye } from "lucide-react";
import { Link } from "react-router-dom";

interface JobsTableProps {
  loading: boolean;
  jobs: any[];
  applications: any[];
  onViewJob: (job: any) => void;
  onToggleStatus: (job: any) => void;
  getStatusColor: (status: string) => string;
}

export const JobsTable = ({ 
  loading, 
  jobs, 
  onViewJob, 
  onToggleStatus, 
  getStatusColor 
}: JobsTableProps) => {
  if (loading) {
    return (
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b">
              <th className="p-3 text-sm font-medium text-muted-foreground">Job Title</th>
              <th className="p-3 text-sm font-medium text-muted-foreground">Company</th>
              <th className="p-3 text-sm font-medium text-muted-foreground">Location</th>
              <th className="p-3 text-sm font-medium text-muted-foreground">Applications</th>
              <th className="p-3 text-sm font-medium text-muted-foreground">Status</th>
              <th className="p-3 text-sm font-medium text-muted-foreground">Posted</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {Array(3).fill(0).map((_, i) => (
              <tr key={i} className="border-b">
                <td className="p-3"><Skeleton className="h-5 w-40" /></td>
                <td className="p-3"><Skeleton className="h-5 w-32" /></td>
                <td className="p-3"><Skeleton className="h-5 w-28" /></td>
                <td className="p-3"><Skeleton className="h-5 w-16" /></td>
                <td className="p-3"><Skeleton className="h-5 w-20" /></td>
                <td className="p-3"><Skeleton className="h-5 w-24" /></td>
                <td className="p-3"><Skeleton className="h-8 w-32" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left border-b">
            <th className="p-3 text-sm font-medium text-muted-foreground">Job Title</th>
            <th className="p-3 text-sm font-medium text-muted-foreground">Company</th>
            <th className="p-3 text-sm font-medium text-muted-foreground">Location</th>
            <th className="p-3 text-sm font-medium text-muted-foreground">Applications</th>
            <th className="p-3 text-sm font-medium text-muted-foreground">Status</th>
            <th className="p-3 text-sm font-medium text-muted-foreground">Posted</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.jobs_id} className="border-b hover:bg-gray-50">
              <td className="p-3">
                <div>
                  <span className="font-medium">{job.title}</span>
                  <div className="text-sm text-muted-foreground">{job.type}</div>
                </div>
              </td>
              <td className="p-3">{job.company}</td>
              <td className="p-3 text-sm">{job.location}</td>
              <td className="p-3 text-center">
                <Link 
                  to={`/dashboard/pm/applicants/${job.jobs_id}`}
                  className="text-primary hover:underline"
                >
                  {job.applications_count}
                </Link>
              </td>
              <td className="p-3">
                <Badge className={getStatusColor(job.status)}>
                  {job.status}
                </Badge>
              </td>
              <td className="p-3 text-sm text-muted-foreground">{job.posted_at.split("T")[0]}</td>
              <td className="p-3">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => onViewJob(job)}>
                    <Eye className="w-4 h-4 mr-1" />
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
