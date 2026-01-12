
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Eye, MapPin, Calendar } from "lucide-react";
import { JobDetailsDialog } from "@/components/JobDetailsDialog";
import { useDataContext } from "@/hooks/useDataContext";

const AdminJobs = () => {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedJob, setSelectedJob] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { getJobs } = useDataContext();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobsData = await getJobs();
        setJobs(jobsData);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [getJobs]);

  const filteredJobs = statusFilter === "All" 
    ? jobs 
    : jobs.filter(job => job.status === statusFilter);

  const getStatusColor = (status: string) => {
    return status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800";
  };

  const handleViewJob = (job: any) => {
    setSelectedJob(job);
    setIsDetailsOpen(true);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Job Management</h1>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-md px-3 py-2 bg-background"
        >
          <option value="All">All Status</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Jobs List ({filteredJobs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile: Card layout */}
          <div className="md:hidden space-y-4">
            {loading
              ? Array(3).fill(0).map((_, i) => (
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
                ))
              : filteredJobs.map((job) => (
                  <div key={job.jobs_id} className="border rounded-lg p-4 space-y-3">
                    <div>
                      <h3 className="font-medium text-base">{job.title}</h3>
                      <p className="text-sm text-muted-foreground">{job.company}</p>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Posted: {job.posted_at.split("T")[0]}</span>
                      </div>
                      <div>
                        <span className="font-medium">Salary: </span>
                        <span>{job.salary}</span>
                      </div>
                      <div>
                        <span className="font-medium">Applications: </span>
                        <span>{job.applications}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                      <Button size="sm" variant="outline" onClick={() => handleViewJob(job)}>
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
          </div>

          {/* Desktop: Table layout */}
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
                {loading
                  ? Array(3).fill(0).map((_, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-3"><Skeleton className="h-5 w-40" /></td>
                        <td className="p-3"><Skeleton className="h-5 w-32" /></td>
                        <td className="p-3"><Skeleton className="h-5 w-28" /></td>
                        <td className="p-3"><Skeleton className="h-5 w-16" /></td>
                        <td className="p-3"><Skeleton className="h-5 w-20" /></td>
                        <td className="p-3"><Skeleton className="h-5 w-24" /></td>
                        <td className="p-3"><Skeleton className="h-8 w-20" /></td>
                      </tr>
                    ))
                  : filteredJobs.map((job) => (
                      <tr key={job.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div>
                            <span className="font-medium">{job.title}</span>
                            <div className="text-sm text-muted-foreground">{job.type}</div>
                          </div>
                        </td>
                        <td className="p-3">{job.company}</td>
                        <td className="p-3 text-sm">{job.location}</td>
                        <td className="p-3 text-center">{job.applications}</td>
                        <td className="p-3">
                          <Badge className={getStatusColor(job.status)}>
                            {job.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">{job.posted_at.split("T")[0]}</td>
                        <td className="p-3">
                          <Button size="sm" variant="outline" onClick={() => handleViewJob(job)}>
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <JobDetailsDialog
        job={selectedJob}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </div>
  );
};

export default AdminJobs;
