
import { JobDetailsDialog } from "@/components/JobDetailsDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useDataContext } from "@/hooks/useDataContext";
import { JobsFilters } from "@/pages/dashboard/pm/components/JobsFilters";
import { JobsHeader } from "@/pages/dashboard/pm/components/JobsHeader";
import { JobsTable } from "@/pages/dashboard/pm/components/JobsTable";
import { useState } from "react";

const ManageJobs = () => {
  const { toast } = useToast();
  const { jobs, applications, loading, updateJob } = useDataContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    company: "",
    location: "",
    salary: "",
    employment_type: "full-time",
    status: "active",
    description: "",
    requirements: "",
    responsibilities: "",
    duration: "",
    openings: "",
    experience_level: "",
  });

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

  const handleEditJob = (job: any) => {
    const toMultiline = (value: any) =>
      Array.isArray(value) ? value.join("\n") : value || "";

    setEditingJob(job);
    setEditForm({
      title: job.title || "",
      company: job.company || "",
      location: job.location || "",
      salary: job.salary || "",
      employment_type: job.employment_type || job.type || "full-time",
      status: job.status?.toLowerCase() === "active" ? "active" : "closed",
      description: job.description || "",
      requirements: toMultiline(job.requirements),
      responsibilities: toMultiline(job.responsibilities),
      duration: job.duration || "",
      openings: job.openings ? String(job.openings) : "",
      experience_level: job.experience_level || "",
    });
    setIsEditOpen(true);
  };

  const resetEditState = () => {
    setIsEditOpen(false);
    setEditingJob(null);
  };

  const handleEditFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;

    const asList = (value: string) =>
      value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

    const payload: any = {
      title: editForm.title,
      company: editForm.company,
      location: editForm.location,
      salary: editForm.salary,
      employment_type: editForm.employment_type,
      status: editForm.status,
      description: editForm.description,
      requirements: asList(editForm.requirements),
      responsibilities: asList(editForm.responsibilities),
      duration: editForm.duration,
      openings: editForm.openings ? Number(editForm.openings) : undefined,
      experience_level: editForm.experience_level,
    };

    setEditLoading(true);
    try {
      await updateJob(editingJob.jobs_id || editingJob.id, payload);
      toast({ title: "Job updated", description: "Changes have been saved." });
      resetEditState();
    } catch (error) {
      console.error("Error saving job edits", error);
      toast({
        title: "Update failed",
        description: "We couldn't save your changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setEditLoading(false);
    }
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
            onEditJob={handleEditJob}
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

      <Dialog open={isEditOpen} onOpenChange={(open) => (open ? null : resetEditState())}>
        <DialogContent
          className="
    w-[95vw]
    max-w-3xl
    max-h-[90vh]
    overflow-y-auto
    overflow-x-hidden
    p-4
    sm:p-6
  "
        >
          <DialogHeader>
            <DialogTitle>Edit Job</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleSaveEdits}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={editForm.title}
                  onChange={handleEditFieldChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  name="company"
                  value={editForm.company}
                  onChange={handleEditFieldChange}
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={editForm.location}
                  onChange={handleEditFieldChange}
                />
              </div>
              <div>
                <Label htmlFor="salary">Salary</Label>
                <Input
                  id="salary"
                  name="salary"
                  value={editForm.salary}
                  onChange={handleEditFieldChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Employment Type</Label>
                <Select
                  value={editForm.employment_type}
                  onValueChange={(value) =>
                    setEditForm((prev) => ({ ...prev, employment_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(value) =>
                    setEditForm((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Experience Level</Label>
                <Select
                  value={editForm.experience_level || ""}
                  onValueChange={(value) =>
                    setEditForm((prev) => ({ ...prev, experience_level: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="entry">Entry</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  name="duration"
                  value={editForm.duration}
                  onChange={handleEditFieldChange}
                  placeholder="e.g. 6 months"
                />
              </div>
              <div>
                <Label htmlFor="openings">Openings</Label>
                <Input
                  id="openings"
                  name="openings"
                  type="number"
                  value={editForm.openings}
                  onChange={handleEditFieldChange}
                  min={1}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                rows={4}
                value={editForm.description}
                onChange={handleEditFieldChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="requirements">Requirements (one per line)</Label>
                <Textarea
                  id="requirements"
                  name="requirements"
                  rows={4}
                  value={editForm.requirements}
                  onChange={handleEditFieldChange}
                />
              </div>
              <div>
                <Label htmlFor="responsibilities">Responsibilities (one per line)</Label>
                <Textarea
                  id="responsibilities"
                  name="responsibilities"
                  rows={4}
                  value={editForm.responsibilities}
                  onChange={handleEditFieldChange}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={resetEditState}>
                Cancel
              </Button>
              <Button type="submit" disabled={editLoading} className="text-white">
                {editLoading ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageJobs;
