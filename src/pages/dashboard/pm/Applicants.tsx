import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ScheduleInterviewDialog from "@/components/ScheduleInterviewDialog";

const APPLICANTS = [
  {
    name: "Jane Doe",
    experience: 5,
    skills: ["React", "Node.js", "AWS"],
    resume: "jane_resume.pdf",
    status: "Pending"
  },
  {
    name: "Max Mustermann",
    experience: 7,
    skills: ["Java", "Spring"],
    resume: "max_resume.pdf",
    status: "Shortlisted"
  },
  {
    name: "Alice Smith",
    experience: 3,
    skills: ["Python", "SQL"],
    resume: "alice_cv.pdf",
    status: "Rejected"
  }
];

const statusColor = (status: string) => {
  switch (status) {
    case "Pending": return "bg-warning text-white";
    case "Shortlisted": return "bg-success text-white";
    case "Rejected": return "bg-destructive text-white";
    case "Hired": return "bg-primary text-white";
    default: return "bg-muted";
  }
};

const Applicants = () => {
  const { jobId } = useParams();
  const [loading, setLoading] = useState(true);
  const [applicants, setApplicants] = useState(APPLICANTS);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 950);
    return () => clearTimeout(t);
  }, []);

  const updateApplicantStatus = (index: number, newStatus: string) => {
    const updated = [...applicants];
    updated[index].status = newStatus;
    setApplicants(updated);
  };

  const handleScheduleInterview = (applicant: any, index: number) => {
    setSelectedApplicant({
      ...applicant,
      id: index + 1, // Mock ID
      index: index
    });
    setScheduleDialogOpen(true);
  };

  const jobTitle = `Job ${jobId}`;
  
  return (
    <div className="p-2 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Applicants for Job {jobId}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile: Card layout */}
          <div className="md:hidden space-y-4">
            {loading
              ? Array(3).fill(0).map((_, i) => (
                  <div key={i} className="border rounded-lg p-4 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                ))
              : applicants.map((a, i) => (
                  <div key={i} className="border rounded-lg p-4 space-y-3">
                    <div>
                      <h3 className="font-medium text-base">{a.name}</h3>
                      <p className="text-sm text-muted-foreground">{a.experience} years experience</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {a.skills.map(s => (
                          <span key={s} className="bg-primary-light text-primary px-2 py-1 rounded text-xs">{s}</span>
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
                            onClick={() => updateApplicantStatus(i, "Shortlisted")}
                          >
                            Shortlist
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs px-2 h-7"
                            onClick={() => updateApplicantStatus(i, "Rejected")}
                          >
                            Reject
                          </Button>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs px-2 h-7"
                            onClick={() => updateApplicantStatus(i, "Hired")}
                          >
                            Hire
                          </Button>
                          {a.status === "Shortlisted" && (
                            <Button 
                              size="sm" 
                              variant="default" 
                              className="text-xs px-2 h-7"
                              onClick={() => handleScheduleInterview(a, i)}
                            >
                              Interview
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
          </div>

          {/* Desktop: Table layout */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="text-left">
                  <th className="p-2 text-sm text-text-muted">Name</th>
                  <th className="p-2 text-sm text-text-muted">Experience</th>
                  <th className="p-2 text-sm text-text-muted">Skills</th>
                  <th className="p-2 text-sm text-text-muted">Resume</th>
                  <th className="p-2 text-sm text-text-muted">Status</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array(3).fill(0).map((_,i)=>(
                    <tr key={i} className="border-b">
                      <td className="p-2"><Skeleton className="h-5 w-32" /></td>
                      <td className="p-2"><Skeleton className="h-5 w-24" /></td>
                      <td className="p-2"><Skeleton className="h-5 w-36" /></td>
                      <td className="p-2"><Skeleton className="h-5 w-24" /></td>
                      <td className="p-2"><Skeleton className="h-5 w-20" /></td>
                      <td className="p-2"><Skeleton className="h-8 w-36" /></td>
                    </tr>
                  ))
                  : applicants.map((a, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2">
                        <div className="font-medium">{a.name}</div>
                      </td>
                      <td className="p-2">{a.experience} yrs</td>
                      <td className="p-2">
                        <div className="flex gap-1 flex-wrap">
                          {a.skills.map(s => (
                            <span key={s} className="bg-primary-light text-primary px-2 py-1 rounded text-xs">{s}</span>
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
                            onClick={() => updateApplicantStatus(i, "Shortlisted")}
                          >
                            Shortlist
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs px-2"
                            onClick={() => updateApplicantStatus(i, "Rejected")}
                          >
                            Reject
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs px-2"
                            onClick={() => updateApplicantStatus(i, "Hired")}
                          >
                            Hire
                          </Button>
                          {a.status === "Shortlisted" && (
                            <Button 
                              size="sm" 
                              variant="default" 
                              className="text-xs px-2 bg-green-600 hover:bg-green-700"
                              onClick={() => handleScheduleInterview(a, i)}
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
