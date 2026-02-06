import ScheduleInterviewDialog from "@/components/ScheduleInterviewDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useDataContext } from "@/hooks/useDataContext";
import { Award, Briefcase, Code, FileText, Mail, Search } from "lucide-react";
import { useEffect, useState } from "react";


const statusColor = (status: string) => {
    switch (status) {
        case "pending": return "bg-yellow-500 text-white";
        case "reviewed": return "bg-blue-500 text-white";
        case "shortlisted": return "bg-green-300 text-black";
        case "rejected": return "bg-red-500 text-white";
        case "accepted": return "bg-green-500 text-black";
        default: return "bg-gray-500 text-white";
    }
};

const Applications = () => {
  const { applications, loading, getApplications, updateApplication, jobs, } = useDataContext();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [resumeDialogOpen, setResumeDialogOpen] = useState(false);
  const [selectedResumeUrl, setSelectedResumeUrl] = useState<string | null>(null);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  

  // Fetch all applications on mount
  useEffect(() => {
    getApplications();
  }, []);

  const handleViewProfile = (applicant: any) => {
    // Pass the full applicant object including name and email
    setSelectedApplicant(applicant);
    setProfileDialogOpen(true);
  };
  
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
      
      // IMPORTANT: Refetch after update to ensure UI syncs with server state
      // This ensures the component immediately sees the status change and Schedule button shows/hides
      await getApplications();
      
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
              <option value="shortlisted">Shortlisted</option>
              <option value="rejected">Rejected</option>
              <option value="accepted">Accepted</option>
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
                  <h3 className="font-semibold cursor-pointer text-base text-blue-600 hover:underline" onClick={() => { handleViewProfile(app.applicant) }}>{app.applicant?.user.first_name} {app.applicant?.user.last_name}</h3>
                  <p className="text-sm text-muted-foreground">{app.applicant?.user.email}</p>
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
                    onClick={() => updateApplicationStatus(app.applications_id, "shortlisted")}
                  >
                    {updatingId === app.applications_id ? "..." : "Shortlist"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    disabled={updatingId === app.applications_id}
                    onClick={() => updateApplicationStatus(app.applications_id, "rejected")}
                  >
                    {updatingId === app.applications_id ? "..." : "Reject"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    disabled={updatingId === app.applications_id}
                    onClick={() => updateApplicationStatus(app.applications_id, "accepted")}
                  >
                    {updatingId === app.applications_id ? "..." : "Accept"}
                  </Button>
                  {app.status === "shortlisted" && (
                    <Button
                      size="sm"
                      variant="default"
                      className="text-xs bg-green-600 hover:bg-green-700 text-white"
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
                        <div className="font-medium text-sm cursor-pointer text-blue-600 hover:underline" onClick={() => { handleViewProfile(app.applicant) }} > {app.applicant?.user?.first_name} {app.applicant?.user?.last_name}</div>
                      </td>
                      <td className="p-3 text-sm">{app.applicant?.user?.email}</td>
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
                            onClick={() => updateApplicationStatus(app.applications_id, "shortlisted")}
                          >
                            {updatingId === app.applications_id ? "..." : "Shortlist"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            disabled={updatingId === app.applications_id}
                            onClick={() => updateApplicationStatus(app.applications_id, "rejected")}
                          >
                            {updatingId === app.applications_id ? "..." : "Reject"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs bg-green-50 hover:bg-green-100"
                            disabled={updatingId === app.applications_id}
                            onClick={() => updateApplicationStatus(app.applications_id, "accepted")}
                          >
                            {updatingId === app.applications_id ? "..." : "Accept"}
                          </Button>
                          {app.status === "shortlisted" && (
                            <Button
                              size="sm"
                              variant="default"
                              className="text-xs bg-green-600 hover:bg-green-700 text-white"
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
        //   jobId={selectedApplicant?.job?.jobs_id}
          jobTitle={selectedApplicant?.job?.title}
        />
      )}

            {/* Profile Preview Dialog */}
            <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader> 
                  <DialogTitle className="text-2xl font-bold text-primary">Applicant's Profile</DialogTitle>
                </DialogHeader>
          {/* {console.log("Selected Applicant =>",selectedApplicant)} */}
                {selectedApplicant && (
                  <div className="space-y-6 py-4">
                    {/* Header Section */}
                    <div className="border-b pb-6">
                      <h2 className="text-2xl font-bold text-gray-900">
                  {selectedApplicant?.user?.first_name} {selectedApplicant?.user?.last_name}
                      </h2>
                      <div className="flex items-center gap-2 mt-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                  <p className="text-sm">{selectedApplicant?.user?.email}</p> {selectedApplicant.is_vetted ? <Badge className="bg-green-700 text-white" >Vetted</Badge> : <Badge className="bg-red-700 text-white">Not Vetted</Badge>}
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
                          {selectedApplicant?.years_of_experience || 'N/A'} years
                        </p>
                        {selectedApplicant?.experience && (
                          <p className="text-sm text-gray-700 mt-2">{selectedApplicant.experience}</p>
                        )}
                      </div>
      
                      {/* Skill Level */}
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Code className="w-5 h-5 text-purple-600" />
                          <h3 className="font-semibold text-gray-900">Skill Level</h3>
                        </div>
                        <Badge className="bg-purple-600 text-white capitalize">
                          {selectedApplicant?.skill_level || 'Not specified'}
                        </Badge>
                      </div>
                    </div>
      
                    {/* Specializations */}
                    {selectedApplicant?.specialization && selectedApplicant.specialization.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Award className="w-5 h-5 text-amber-600" />
                          Specializations
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedApplicant?.specialization.map((spec: string, idx: number) => (
                            <Badge key={idx} className="bg-amber-100 text-amber-900">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
      
                    {/* Certifications */}
                    {selectedApplicant?.certifications && selectedApplicant.certifications.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Certifications</h3>
                        <ul className="space-y-2">
                          {selectedApplicant.certifications.map((cert: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                              <span className="text-green-600 mt-1">✓</span>
                              <span>{cert}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
      
                    {/* Project Types */}
                    {selectedApplicant?.project_types && selectedApplicant.project_types.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Project Types</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedApplicant.project_types.map((type: string, idx: number) => (
                            <Badge key={idx} className="bg-green-100 text-green-900">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
      
                    {/* Languages */}
                    {selectedApplicant?.languages && selectedApplicant.languages.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Languages</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {selectedApplicant.languages.map((lang: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                              {lang}
                            </div>
                          ))}
                        </div>
                        {selectedApplicant?.language_proficiency && (
                          <p className="text-xs text-gray-600 mt-2">
                            Proficiency: <span className="capitalize font-semibold">{selectedApplicant.language_proficiency}</span>
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
                            {selectedApplicant?.work_authorized ? '✓ Yes' : '✗ No'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Driver's License</p>
                          <p className="font-semibold text-gray-900">
                            {selectedApplicant?.has_drivers_license ? '✓ Yes' : '✗ No'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Own Vehicle</p>
                          <p className="font-semibold text-gray-900">
                            {selectedApplicant?.has_car ? '✓ Yes' : '✗ No'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Open to Training</p>
                          <p className="font-semibold text-gray-900">
                            {selectedApplicant?.open_to_training ? '✓ Yes' : '✗ No'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Freelancer</p>
                          <p className="font-semibold text-gray-900">
                            {selectedApplicant?.is_freelancer ? '✓ Yes' : '✗ No'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Open to Nearby Cities</p>
                          <p className="font-semibold text-gray-900">
                            {selectedApplicant?.open_to_nearby_cities ? '✓ Yes' : '✗ No'}
                          </p>
                        </div>
                      </div>
                    </div>
      
                    {/* CV Download */}
              {/* {console.log("Selected Application", selectedApplicant)} */}
                    {selectedApplicant?.cv_url && (
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
                            handleViewResume(selectedApplicant.cv_url);
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

export default Applications;
