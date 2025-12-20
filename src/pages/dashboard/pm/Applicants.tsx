import ScheduleInterviewDialog from "@/components/ScheduleInterviewDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useDataContext } from "@/hooks/useDataContext";
import { FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

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

const Applicants = () => {
  const { jobId } = useParams();
  const { toast } = useToast();
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [resumeDialogOpen, setResumeDialogOpen] = useState(false);
  const [selectedResumeUrl, setSelectedResumeUrl] = useState<string | null>(null);
  
  const { jobApplications, loading, getApplicationsByJobId, updateApplication, jobs } = useDataContext();

  // Get job details from jobs list
  const job = jobs.find(j => j.jobs_id === jobId);

  // Fetch applicants for this job on mount
  useEffect(() => {
    if (jobId) {
      getApplicationsByJobId(jobId);
    }
  }, [jobId]);

  const updateApplicantStatus = async (applicationId: string, newStatus: string) => {
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

  const handleScheduleInterview = (applicant: any) => {
    setSelectedApplicant(applicant);
    setScheduleDialogOpen(true);
  };

  const jobTitle = job?.title || `Job ${jobId}`;
  
  if (loading) {
    return (
      <div className="p-2 md:p-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-64" />
          </CardHeader>
          <CardContent>
            <div className="md:hidden space-y-4">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="border rounded-lg p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
            <div className="hidden md:block">
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex justify-between items-center p-4 border rounded">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="p-2 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">
            Applicants for {jobTitle} ({jobApplications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile: Card layout */}
          <div className="md:hidden space-y-4">
            {jobApplications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No applicants found for this job.</p>
              </div>
            ) : (
              jobApplications.map((app) => (
                <div key={app.applications_id} className="border rounded-lg p-4 space-y-3">
                  <div>
                    <h3 className="font-medium text-base">{app.applicant?.first_name} {app.applicant?.last_name}</h3>
                    <p className="text-sm text-muted-foreground">{app.applicant?.email}</p>
                    <div className="mt-2">
                      {app.applicant?.engineer?.cv_url ? (
                        <button
                          onClick={() => handleViewResume(app.applicant.engineer.cv_url)}
                          className="underline text-primary text-sm hover:text-primary/80 inline-flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          View Resume
                        </button>
                      ) : (
                        <span className="text-sm text-muted-foreground">No resume available</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded ${statusColor(app.status)} text-xs`}>{app.status}</span>
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs px-2 h-7"
                          disabled={updatingId === app.applications_id}
                          onClick={() => updateApplicantStatus(app.applications_id, "Shortlisted")}
                        >
                          {updatingId === app.applications_id ? "..." : "Shortlist"}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs px-2 h-7"
                          disabled={updatingId === app.applications_id}
                          onClick={() => updateApplicantStatus(app.applications_id, "Rejected")}
                        >
                          {updatingId === app.applications_id ? "..." : "Reject"}
                        </Button>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs px-2 h-7"
                          disabled={updatingId === app.applications_id}
                          onClick={() => updateApplicantStatus(app.applications_id, "Hired")}
                        >
                          {updatingId === app.applications_id ? "..." : "Hire"}
                        </Button>
                        {app.status === "shortlisted" && (
                          <Button 
                            size="sm" 
                            variant="default" 
                            className="text-xs px-2 h-7 bg-green-600 hover:bg-green-700"
                            onClick={() => handleScheduleInterview(app)}
                          >
                            Interview
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop: Table layout */}
          <div className="hidden md:block overflow-x-auto">
            {jobApplications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No applicants found for this job.</p>
              </div>
            ) : (
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="text-left border-b">
                    <th className="p-2 text-sm font-medium text-muted-foreground">Name</th>
                    <th className="p-2 text-sm font-medium text-muted-foreground">Email</th>
                    <th className="p-2 text-sm font-medium text-muted-foreground">Applied</th>
                    <th className="p-2 text-sm font-medium text-muted-foreground">Resume</th>
                    <th className="p-2 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {jobApplications.map((app) => (
                    <tr key={app.applications_id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div className="font-medium">{app.applicant?.first_name} {app.applicant?.last_name}</div>
                      </td>
                      <td className="p-2 text-sm">{app.applicant?.email}</td>
                      <td className="p-2 text-sm text-muted-foreground">{new Date(app.applied_at).toLocaleDateString()}</td>
                      <td className="p-2">
                        {app.applicant?.engineer?.cv_url ? (
                          <button
                            onClick={() => handleViewResume(app.applicant.engineer.cv_url)}
                            className="underline text-primary text-sm hover:text-primary/80 inline-flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3" />
                            View
                          </button>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded ${statusColor(app.status)} text-xs`}>{app.status}</span>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-1 flex-wrap">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs px-2"
                            disabled={updatingId === app.applications_id}
                            onClick={() => updateApplicantStatus(app.applications_id, "Shortlisted")}
                          >
                            {updatingId === app.applications_id ? "..." : "Shortlist"}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs px-2"
                            disabled={updatingId === app.applications_id}
                            onClick={() => updateApplicantStatus(app.applications_id, "Rejected")}
                          >
                            {updatingId === app.applications_id ? "..." : "Reject"}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs px-2"
                            disabled={updatingId === app.applications_id}
                            onClick={() => updateApplicantStatus(app.applications_id, "Hired")}
                          >
                            {updatingId === app.applications_id ? "..." : "Hire"}
                          </Button>
                          {app.status === "shortlisted" && (
                            <Button 
                              size="sm" 
                              variant="default" 
                              className="text-xs px-2 bg-green-600 hover:bg-green-700"
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
            )}
          </div>
        </CardContent>
      </Card>

      {/* Schedule Interview Dialog */}
      {selectedApplicant && (
        <ScheduleInterviewDialog
          isOpen={scheduleDialogOpen}
          onClose={() => {
            setScheduleDialogOpen(false);
            setSelectedApplicant(null);
          }}
          applicant={selectedApplicant}
          jobId={jobId}
          jobTitle={jobTitle}
        />
      )}

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
    </div>
  );
};

export default Applicants;
