import ScheduleInterviewDialog from "@/components/ScheduleInterviewDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useDataContext } from "@/hooks/useDataContext";
import { Award, Briefcase, Code, FileText, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const statusColor = (status: string) => {
  switch (status) {
    case "pending": return "bg-yellow-500 text-white";
    case "reviewed": return "bg-blue-500 text-white";
    case "shortlisted": return "bg-green-300 text-black";
    case "rejected": return "bg-red-500 text-white";
    case "accepted": return "bg-green-500 text-black";
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
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  
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
      
      // IMPORTANT: Refetch after update to ensure UI syncs with server state
      // This ensures the component immediately sees the status change and Schedule button shows/hides
      if (jobId) {
        await getApplicationsByJobId(jobId);
      }
      
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

  const handleViewProfile = (applicant: any) => {
    // Pass the full applicant object including name and email
    setSelectedApplicant(applicant);
    setProfileDialogOpen(true);
  };

  const handleScheduleInterview = (applicant: any) => {
    // Pass the full application object for schedule interview
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
            {/* {console.log("Job applications",jobApplications)} */}
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
                    <h3 className="font-medium cursor-pointer text-base text-blue-600 hover:underline"
                      onClick={() => { handleViewProfile(app.applicant) }}>{app.applicant?.first_name} {app.applicant?.last_name}</h3>
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
                          onClick={() => updateApplicantStatus(app.applications_id, "shortlisted")}
                        >
                          {updatingId === app.applications_id ? "..." : "Shortlist"}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs px-2 h-7"
                          disabled={updatingId === app.applications_id}
                          onClick={() => updateApplicantStatus(app.applications_id, "rejected")}
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
                          onClick={() => updateApplicantStatus(app.applications_id, "accepted")}
                        >
                          {updatingId === app.applications_id ? "..." : "Accept"}
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
                {/* Table Headers */}
                <thead>
                  <tr className="text-left border-b">
                    <th className="p-2 text-sm font-medium text-muted-foreground">Name</th>
                    <th className="p-2 text-sm font-medium text-muted-foreground">Email</th>
                    <th className="p-2 text-sm font-medium text-muted-foreground">Applied</th>
                    <th className="p-2 text-sm font-medium text-muted-foreground">Resume</th>
                    <th className="p-2 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="p-2 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                {/* Table Body */}
                <tbody>
                  {jobApplications.map((app) => (
                    <tr key={app.applications_id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div className="font-medium cursor-pointer text-blue-600 hover:underline"
                          onClick={() => { handleViewProfile(app.applicant)}}>{app.applicant?.first_name} {app.applicant?.last_name}</div>
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
                            View Resume
                          </button>
                        ) : (
                            <span className="text-sm text-muted-foreground">No Resume</span>
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
                            onClick={() => updateApplicantStatus(app.applications_id, "shortlisted")}
                          >
                            {updatingId === app.applications_id ? "..." : "Shortlist"}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs px-2"
                            disabled={updatingId === app.applications_id}
                            onClick={() => updateApplicantStatus(app.applications_id, "rejected")}
                          >
                            {updatingId === app.applications_id ? "..." : "Reject"}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs px-2"
                            disabled={updatingId === app.applications_id}
                            onClick={() => updateApplicantStatus(app.applications_id, "accepted")}
                          >
                            {updatingId === app.applications_id ? "..." : "Accept"}
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
      {/* {console.log(selectedApplicant)} */}
      {selectedApplicant && (
        <ScheduleInterviewDialog
          isOpen={scheduleDialogOpen}
          onClose={() => {
            setScheduleDialogOpen(false);
            setSelectedApplicant(null);
          }}
          applicant={selectedApplicant}
          // jobId={jobId}
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


      {/* Profile Preview Dialog */}
      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader> 
            <DialogTitle className="text-2xl font-bold text-primary">Applicant Profile</DialogTitle>
          </DialogHeader>
          {selectedApplicant && selectedApplicant.engineer && (
            <div className="space-y-6 py-4">
              {/* Header Section */}
              <div className="border-b pb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedApplicant?.first_name} {selectedApplicant?.last_name}
                </h2>
                <div className="flex items-center gap-2 mt-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <p className="text-sm">{selectedApplicant?.email}</p>
                </div>
              </div>

              {/* Experience & Skills Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Experience */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Experience</h3>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedApplicant.engineer?.years_of_experience || 'N/A'} years
                  </p>
                  {selectedApplicant.engineer?.experience && (
                    <p className="text-sm text-gray-700 mt-2">{selectedApplicant.engineer.experience}</p>
                  )}
                </div>

                {/* Skill Level */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Code className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-gray-900">Skill Level</h3>
                  </div>
                  <Badge className="bg-purple-600 text-white capitalize">
                    {selectedApplicant.engineer?.skill_level || 'Not specified'}
                  </Badge>
                </div>
              </div>

              {/* Specializations */}
              {selectedApplicant.engineer?.specialization && selectedApplicant.engineer.specialization.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-600" />
                    Specializations
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplicant.engineer.specialization.map((spec: string, idx: number) => (
                      <Badge key={idx} className="bg-amber-100 text-amber-900">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {selectedApplicant.engineer?.certifications && selectedApplicant.engineer.certifications.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Certifications</h3>
                  <ul className="space-y-2">
                    {selectedApplicant.engineer.certifications.map((cert: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-green-600 mt-1">✓</span>
                        <span>{cert}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Project Types */}
              {selectedApplicant.engineer?.project_types && selectedApplicant.engineer.project_types.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Project Types</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplicant.engineer.project_types.map((type: string, idx: number) => (
                      <Badge key={idx} className="bg-green-100 text-green-900">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {selectedApplicant.engineer?.languages && selectedApplicant.engineer.languages.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Languages</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedApplicant.engineer.languages.map((lang: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        {lang}
                      </div>
                    ))}
                  </div>
                  {selectedApplicant.engineer?.language_proficiency && (
                    <p className="text-xs text-gray-600 mt-2">
                      Proficiency: <span className="capitalize font-semibold">{selectedApplicant.engineer.language_proficiency}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Personal Info */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <h3 className="font-semibold text-gray-900 mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Work Authorized</p>
                    <p className="font-semibold text-gray-900">
                      {selectedApplicant.engineer?.work_authorized ? '✓ Yes' : '✗ No'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Driver's License</p>
                    <p className="font-semibold text-gray-900">
                      {selectedApplicant.engineer?.has_drivers_license ? '✓ Yes' : '✗ No'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Own Vehicle</p>
                    <p className="font-semibold text-gray-900">
                      {selectedApplicant.engineer?.has_car ? '✓ Yes' : '✗ No'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Open to Training</p>
                    <p className="font-semibold text-gray-900">
                      {selectedApplicant.engineer?.open_to_training ? '✓ Yes' : '✗ No'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Freelancer</p>
                    <p className="font-semibold text-gray-900">
                      {selectedApplicant.engineer?.is_freelancer ? '✓ Yes' : '✗ No'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Open to Nearby Cities</p>
                    <p className="font-semibold text-gray-900">
                      {selectedApplicant.engineer?.open_to_nearby_cities ? '✓ Yes' : '✗ No'}
                    </p>
                  </div>
                </div>
              </div>

              {/* CV Download */}
              {selectedApplicant.engineer?.cv_url && (
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Curriculum Vitae</p>
                      <p className="text-sm text-gray-600">View complete resume</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      handleViewResume(selectedApplicant.engineer.cv_url);
                      setProfileDialogOpen(false);
                    }}
                  >
                    View CV
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Applicants;
