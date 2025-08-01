
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ScheduleInterviewDialog from "@/components/ScheduleInterviewDialog";
import { useDataContext } from "@/hooks/useDataContext";

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
  const [loading, setLoading] = useState(true);
  const [applicants, setApplicants] = useState([]);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [job, setJob] = useState(null);
  
  const { getApplications, getJobById, getEngineerById, updateApplication } = useDataContext();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching data for jobId:', jobId);
        
        const [jobData, applicationsData] = await Promise.all([
          getJobById(parseInt(jobId || '1')),
          getApplications({ jobId: parseInt(jobId || '1') })
        ]);
        
        console.log('Job data:', jobData);
        console.log('Applications data:', applicationsData);
        
        setJob(jobData);
        
        // Fetch engineer details for each application
        const applicantsWithDetails = await Promise.all(
          applicationsData.map(async (app) => {
            try {
              const engineer = await getEngineerById(app.engineerId);
              console.log('Engineer for app:', app.id, engineer);
              
              return {
                ...app,
                name: engineer?.name || app.engineerName || 'Unknown',
                experience: engineer?.experience || 'N/A',
                skills: engineer?.skills || app.skills || [],
                resume: `${(engineer?.name || app.engineerName || 'Unknown')?.replace(' ', '_')}_resume.pdf`
              };
            } catch (error) {
              console.error('Error fetching engineer details:', error);
              return {
                ...app,
                name: app.engineerName || 'Unknown',
                experience: 'N/A',
                skills: app.skills || [],
                resume: 'resume.pdf'
              };
            }
          })
        );
        
        console.log('Final applicants with details:', applicantsWithDetails);
        setApplicants(applicantsWithDetails);
      } catch (error) {
        console.error('Error fetching applicants:', error);
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchData();
    }
  }, [jobId, getApplications, getJobById, getEngineerById]);

  const updateApplicantStatus = async (applicationId: number, newStatus: string) => {
    try {
      await updateApplication(applicationId, { status: newStatus });
      setApplicants(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));
    } catch (error) {
      console.error('Error updating application status:', error);
    }
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
            Applicants for {jobTitle} ({applicants.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile: Card layout */}
          <div className="md:hidden space-y-4">
            {applicants.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No applicants found for this job.</p>
              </div>
            ) : (
              applicants.map((a) => (
                <div key={a.id} className="border rounded-lg p-4 space-y-3">
                  <div>
                    <h3 className="font-medium text-base">{a.name}</h3>
                    <p className="text-sm text-muted-foreground">{a.experience} years experience</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {a.skills.map(s => (
                        <span key={s} className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">{s}</span>
                      ))}
                    </div>
                    <div className="mt-2">
                      <a href="#" className="underline text-primary text-sm">{a.resume}</a>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded ${statusColor(a.status)} text-xs`}>{a.status}</span>
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs px-2 h-7"
                          onClick={() => updateApplicantStatus(a.id, "Shortlisted")}
                        >
                          Shortlist
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs px-2 h-7"
                          onClick={() => updateApplicantStatus(a.id, "Rejected")}
                        >
                          Reject
                        </Button>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs px-2 h-7"
                          onClick={() => updateApplicantStatus(a.id, "Hired")}
                        >
                          Hire
                        </Button>
                        {a.status === "Shortlisted" && (
                          <Button 
                            size="sm" 
                            variant="default" 
                            className="text-xs px-2 h-7"
                            onClick={() => handleScheduleInterview(a)}
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
            {applicants.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No applicants found for this job.</p>
              </div>
            ) : (
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="text-left">
                    <th className="p-2 text-sm text-muted-foreground">Name</th>
                    <th className="p-2 text-sm text-muted-foreground">Experience</th>
                    <th className="p-2 text-sm text-muted-foreground">Skills</th>
                    <th className="p-2 text-sm text-muted-foreground">Resume</th>
                    <th className="p-2 text-sm text-muted-foreground">Status</th>
                    <th className="p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {applicants.map((a) => (
                    <tr key={a.id} className="border-b">
                      <td className="p-2">
                        <div className="font-medium">{a.name}</div>
                      </td>
                      <td className="p-2">{a.experience} yrs</td>
                      <td className="p-2">
                        <div className="flex gap-1 flex-wrap">
                          {a.skills.map(s => (
                            <span key={s} className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">{s}</span>
                          ))}
                        </div>
                      </td>
                      <td className="p-2">
                        <a href="#" className="underline text-primary text-sm">{a.resume}</a>
                      </td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded ${statusColor(a.status)} text-xs`}>{a.status}</span>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-1 flex-wrap">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs px-2"
                            onClick={() => updateApplicantStatus(a.id, "Shortlisted")}
                          >
                            Shortlist
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs px-2"
                            onClick={() => updateApplicantStatus(a.id, "Rejected")}
                          >
                            Reject
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs px-2"
                            onClick={() => updateApplicantStatus(a.id, "Hired")}
                          >
                            Hire
                          </Button>
                          {a.status === "Shortlisted" && (
                            <Button 
                              size="sm" 
                              variant="default" 
                              className="text-xs px-2 bg-green-600 hover:bg-green-700"
                              onClick={() => handleScheduleInterview(a)}
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
          jobId={parseInt(jobId || '1')}
          jobTitle={jobTitle}
        />
      )}
    </div>
  );
};

export default Applicants;
