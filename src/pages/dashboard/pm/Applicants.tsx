
import React from "react";
import { useParams } from "react-router-dom";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Applicants for Job {jobId}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
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
                {APPLICANTS.map((a, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2">{a.name}</td>
                    <td className="p-2">{a.experience} yrs</td>
                    <td className="p-2">
                      <div className="flex gap-1 flex-wrap">
                        {a.skills.map(s => (
                          <span key={s} className="bg-primary-light text-primary px-2 py-1 rounded text-xs">{s}</span>
                        ))}
                      </div>
                    </td>
                    <td className="p-2">
                      <a href="#" className="underline text-primary">{a.resume}</a>
                    </td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded ${statusColor(a.status)} text-xs`}>{a.status}</span>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline">Shortlist</Button>
                        <Button size="sm" variant="outline">Reject</Button>
                        <Button size="sm" variant="outline">Mark Hired</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Applicants;
