
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Pencil } from "lucide-react";
import { Link } from "react-router-dom";

interface JobsTableProps {
  loading: boolean;
  jobs: any[];
  applications: any[];
  onViewJob: (job: any) => void;
  onEditJob: (job: any) => void;
  onToggleStatus: (job: any) => void;
  getStatusColor: (status: string) => string;
}

export const JobsTable = ({ 
  loading, 
  jobs, 
  onViewJob, 
  onEditJob,
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
              <th className="p-3 text-sm font-medium text-muted-foreground">Actions</th>
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
    <>
    {/* Mobile View */}
      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {jobs.map((job) => (
          <div
            key={job.jobs_id}
            className="border rounded-lg p-4 bg-white shadow-sm"
          >
            {/* Title */}
            <div className="mb-2">
              <h3 className="font-semibold text-base">{job.title}</h3>
              <p className="text-sm text-muted-foreground">{job.type}</p>
            </div>

            {/* Meta info */}
            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
              <div>
                <span className="text-muted-foreground">Company</span>
                <p className="font-medium">{job.company}</p>
              </div>

              <div>
                <span className="text-muted-foreground">Location</span>
                <p>{job.location}</p>
              </div>

              <div>
                <span className="text-muted-foreground">Applications</span>
                <Link
                  to={`/dashboard/pm/applicants/${job.jobs_id}`}
                  className="block text-primary font-medium"
                >
                  {job.applications_count}
                </Link>
              </div>

              <div>
                <span className="text-muted-foreground">Posted</span>
                <p>{job.posted_at.split("T")[0]}</p>
              </div>
            </div>

            {/* Status */}
            <div className="mb-3">
              <Badge className={getStatusColor(job.status)}>
                {job.status}
              </Badge>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => onViewJob(job)}>
                <Eye className="w-4 h-4 mr-1" />
                Details
              </Button>

              <Button size="sm" variant="outline" onClick={() => onEditJob(job)}>
                <Pencil className="w-4 h-4 mr-1" />
                Edit
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
        ))}
      </div>


    {/* Desktop View */}

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
            <th className="p-3 text-sm font-medium text-muted-foreground">Actions</th>
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
                  <Button size="sm" variant="outline" onClick={() => onEditJob(job)}>
                    <Pencil className="w-4 h-4 mr-1" />
                    Edit
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
                    {job.status === "active" ? "close" : "Reopen"}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    </>
  );
};
