
import { JobDetailsDialog } from "@/components/JobDetailsDialog";
import { JobsFilters } from "@/pages/dashboard/pm/components/JobsFilters";
import { JobsGrid } from "@/pages/dashboard/pm/components/JobsGrid";
import { JobsHeader } from "@/pages/dashboard/pm/components/JobsHeader";
import { JobsTable } from "@/pages/dashboard/pm/components/JobsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDataContext } from "@/hooks/useDataContext";
import { useState } from "react";

const ManageJobs = () => {
  const { jobs, applications, loading, updateJob, deleteJob } = useDataContext();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Filter jobs based on search and status
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const jobStatus = job.status === 'Active' || job.status === 'active' ? 'active' : 'closed';
    const matchesStatus = statusFilter === "all" || jobStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    return status === "active" ? "bg-green-500 text-black" : "bg-red-400 text-black";
  };

  const handleViewJob = (job: any) => {
    setSelectedJob(job);
    setIsDetailsOpen(true);
  };

  const handleToggleStatus = async (job: any) => {
    try {
      const newStatus = job.status === "active" || job.status === "active" ? "closed" : "active";
      console.log("updating Job Status with", newStatus);
      await updateJob(job.jobs_id, { status: newStatus });
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await deleteJob(jobId);
      } catch (error) {
        console.error('Error deleting job:', error);
      }
    }
  };

  return (
    <div className="p-4 md:p-8">
      <JobsHeader />

      <JobsFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      <Card>
        <CardHeader>
          <CardTitle>Your Jobs ({filteredJobs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {/* <JobsGrid
            loading={loading}
            jobs={filteredJobs}
            onViewJob={handleViewJob}
            onToggleStatus={handleToggleStatus}
            getStatusColor={getStatusColor}
          /> */}

          <JobsTable
            loading={loading}
            jobs={filteredJobs}
            applications={applications}
            onViewJob={handleViewJob}
            onToggleStatus={handleToggleStatus}
            getStatusColor={getStatusColor}
          />
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
