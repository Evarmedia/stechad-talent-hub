
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { JobDetailsDialog } from "@/components/JobDetailsDialog";
import { useManageJobs } from "@/hooks/useManageJobs";
import { JobsHeader } from "@/components/pm/JobsHeader";
import { JobsFilters } from "@/components/pm/JobsFilters";
import { JobsGrid } from "@/components/pm/JobsGrid";
import { JobsTable } from "@/components/pm/JobsTable";
import { useDataContext } from "@/hooks/useDataContext";

const ManageJobs = () => {
  const {
    loading,
    filteredJobs,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    selectedJob,
    isDetailsOpen,
    setIsDetailsOpen,
    handleViewJob,
    handleToggleStatus,
    handleDeleteJob
  } = useManageJobs();

  const { getApplicationsByJobId } = useDataContext();


  const getStatusColor = (status: string) => {
    return status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800";
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
          <JobsGrid
            loading={loading}
            jobs={filteredJobs}
            onViewJob={handleViewJob}
            onToggleStatus={handleToggleStatus}
            getStatusColor={getStatusColor}
          />

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
