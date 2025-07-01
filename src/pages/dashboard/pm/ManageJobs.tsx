
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Edit, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { JobDetailsDialog } from "@/components/JobDetailsDialog";
import { useDataContext } from "@/hooks/useDataContext";

const ManageJobs = () => {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedJob, setSelectedJob] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const { getJobs, updateJob, deleteJob } = useDataContext();

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

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    return status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800";
  };

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

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Manage Jobs</h1>
        <Button asChild>
          <Link to="/dashboard/pm/post-job">
            <Plus className="w-4 h-4 mr-2" />
            Post New Job
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-md px-3 py-2 bg-background"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Jobs ({filteredJobs.length})</CardTitle>
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
                  <div key={job.id} className="border rounded-lg p-4 space-y-3">
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
                        <span className="font-medium">Posted: </span>
                        <span>{job.postedDate}</span>
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
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewJob(job)}>
                          <Eye className="w-3 h-3 mr-1" />
                          Details
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/dashboard/pm/applicants/${job.id}`}>
                            View Apps
                          </Link>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleToggleStatus(job)}
                        >
                          {job.status === "active" ? "Close" : "Reopen"}
                        </Button>
                      </div>
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
                        <td className="p-3"><Skeleton className="h-8 w-32" /></td>
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
                        <td className="p-3 text-center">
                          <Link 
                            to={`/dashboard/pm/applicants/${job.id}`}
                            className="text-primary hover:underline"
                          >
                            {job.applications}
                          </Link>
                        </td>
                        <td className="p-3">
                          <Badge className={getStatusColor(job.status)}>
                            {job.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">{job.postedDate}</td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleViewJob(job)}>
                              <Eye className="w-4 h-4 mr-1" />
                              Details
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                              <Link to={`/dashboard/pm/applicants/${job.id}`}>
                                View Apps
                              </Link>
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleToggleStatus(job)}
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

export default ManageJobs;
