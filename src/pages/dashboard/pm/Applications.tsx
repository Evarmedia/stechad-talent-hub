import ScheduleInterviewDialog from "@/components/ScheduleInterviewDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useDataContext } from "@/hooks/useDataContext";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

const statusColor = (status: string) => {
  switch (status) {
    case "pending": return "bg-yellow-500 text-white";
    case "reviewed": return "bg-blue-500 text-white";
    case "Shortlisted": return "bg-green-500 text-white";
    case "Rejected": return "bg-red-500 text-white";
    case "Hired": return "bg-purple-500 text-white";
    case "accepted": return "bg-green-500 text-white";
    case "rejected": return "bg-red-500 text-white";
    default: return "bg-gray-500 text-white";
  }
};

const Applications = () => {
  const { applications, loading, getApplications, updateApplication, jobs } = useDataContext();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [resumeDialogOpen, setResumeDialogOpen] = useState(false);
  const [selectedResumeUrl, setSelectedResumeUrl] = useState<string | null>(null);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  // Fetch all applications on mount
  useEffect(() => {
    getApplications();
  }, []);

  // Filter applications based on search and status
  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      (app.applicant?.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.applicant?.last_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.applicant?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.job?.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || app.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    setUpdatingId(applicationId);
    try {
      // Convert to lowercase for backend (backend expects: pending, reviewed, shortlisted, accepted, rejected)
      const lowerCaseStatus = newStatus.toLowerCase();
      await updateApplication(applicationId, { status: lowerCaseStatus });
      toast({
        title: "Success",
        description: `Application marked as ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating application status:', error);
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleViewResume = (resumeUrl: string) => {
    setSelectedResumeUrl(resumeUrl);
    setResumeDialogOpen(true);
  };

  const handleScheduleInterview = (app: any) => {
    setSelectedApplicant(app);
    setScheduleDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="p-2 md:p-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex justify-between items-center p-4 border rounded">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-2 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary mb-4">All Applications</h1>
        
        {/* Search and Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by applicant name, email, or job title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Rejected">Rejected</option>
              <option value="Hired">Hired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Cards - Mobile */}
      <div className="md:hidden space-y-4 mb-6">
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-gray-500">
                <p>No applications found.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredApplications.map((app) => (
            <Card key={app.applications_id}>
              <CardContent className="pt-6 space-y-3">
                <div>
                  <h3 className="font-semibold text-base">{app.applicant?.first_name} {app.applicant?.last_name}</h3>
                  <p className="text-sm text-muted-foreground">{app.applicant?.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-primary">{app.job?.title}</p>
                  <p className="text-xs text-muted-foreground">{app.job?.company}</p>
                </div>
                <div className="flex justify-between items-center">
                  <Badge className={statusColor(app.status)}>
                    {app.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {new Date(app.applied_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    disabled={updatingId === app.applications_id}
                    onClick={() => updateApplicationStatus(app.applications_id, "Shortlisted")}
                  >
                    {updatingId === app.applications_id ? "..." : "Shortlist"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    disabled={updatingId === app.applications_id}
                    onClick={() => updateApplicationStatus(app.applications_id, "Rejected")}
                  >
                    {updatingId === app.applications_id ? "..." : "Reject"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    disabled={updatingId === app.applications_id}
                    onClick={() => updateApplicationStatus(app.applications_id, "Hired")}
                  >
                    {updatingId === app.applications_id ? "..." : "Hire"}
                  </Button>
                  {app.status === "shortlisted" && (
                    <Button
                      size="sm"
                      variant="default"
                      className="text-xs bg-green-600 hover:bg-green-700"
                      onClick={() => handleScheduleInterview(app)}
                    >
                      Schedule Interview
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Applications Table - Desktop */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>Applications List ({filteredApplications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredApplications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No applications found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left p-3 text-sm font-semibold text-muted-foreground">Applicant</th>
                    <th className="text-left p-3 text-sm font-semibold text-muted-foreground">Email</th>
                    <th className="text-left p-3 text-sm font-semibold text-muted-foreground">Job Title</th>
                    <th className="text-left p-3 text-sm font-semibold text-muted-foreground">Company</th>
                    <th className="text-left p-3 text-sm font-semibold text-muted-foreground">Applied</th>
                    <th className="text-left p-3 text-sm font-semibold text-muted-foreground">Status</th>
                    <th className="text-left p-3 text-sm font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((app) => (
                    <tr key={app.applications_id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-medium text-sm">{app.applicant?.first_name} {app.applicant?.last_name}</div>
                      </td>
                      <td className="p-3 text-sm">{app.applicant?.email}</td>
                      <td className="p-3 text-sm font-medium text-primary">{app.job?.title}</td>
                      <td className="p-3 text-sm text-muted-foreground">{app.job?.company}</td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {new Date(app.applied_at).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <Badge className={statusColor(app.status)}>
                          {app.status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            disabled={updatingId === app.applications_id}
                            onClick={() => updateApplicationStatus(app.applications_id, "Shortlisted")}
                          >
                            {updatingId === app.applications_id ? "..." : "Shortlist"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            disabled={updatingId === app.applications_id}
                            onClick={() => updateApplicationStatus(app.applications_id, "Rejected")}
                          >
                            {updatingId === app.applications_id ? "..." : "Reject"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs bg-green-50 hover:bg-green-100"
                            disabled={updatingId === app.applications_id}
                            onClick={() => updateApplicationStatus(app.applications_id, "Hired")}
                          >
                            {updatingId === app.applications_id ? "..." : "Hire"}
                          </Button>
                          {app.status === "shortlisted" && (
                            <Button
                              size="sm"
                              variant="default"
                              className="text-xs bg-green-600 hover:bg-green-700"
                              onClick={() => handleScheduleInterview(app)}
                            >
                              Schedule Interview
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resume Preview Dialog */}
      <Dialog open={resumeDialogOpen} onOpenChange={setResumeDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Resume Preview</DialogTitle>
          </DialogHeader>
          {selectedResumeUrl && (
            <div className="w-full h-[70vh]">
              <iframe
                src={selectedResumeUrl}
                className="w-full h-full border rounded"
                title="Resume Preview"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Schedule Interview Dialog */}
      {selectedApplicant && (
        <ScheduleInterviewDialog
          isOpen={scheduleDialogOpen}
          onClose={() => {
            setScheduleDialogOpen(false);
            setSelectedApplicant(null);
          }}
          applicant={selectedApplicant}
          jobId={selectedApplicant?.job?.jobs_id}
          jobTitle={selectedApplicant?.job?.title}
        />
      )}
    </div>
  );
};

export default Applications;
