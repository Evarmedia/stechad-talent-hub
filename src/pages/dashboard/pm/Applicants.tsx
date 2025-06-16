
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 950);
    return () => clearTimeout(t);
  }, []);
  
  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Applicants for Job {jobId}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="text-left">
                  <th className="p-2 text-sm text-text-muted">Name</th>
                  <th className="p-2 text-sm text-text-muted hidden sm:table-cell">Experience</th>
                  <th className="p-2 text-sm text-text-muted hidden md:table-cell">Skills</th>
                  <th className="p-2 text-sm text-text-muted hidden lg:table-cell">Resume</th>
                  <th className="p-2 text-sm text-text-muted">Status</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array(3).fill(0).map((_,i)=>(
                    <tr key={i} className="border-b">
                      <td className="p-2"><Skeleton className="h-5 w-24 md:w-32" /></td>
                      <td className="p-2 hidden sm:table-cell"><Skeleton className="h-5 w-24" /></td>
                      <td className="p-2 hidden md:table-cell"><Skeleton className="h-5 w-36" /></td>
                      <td className="p-2 hidden lg:table-cell"><Skeleton className="h-5 w-24" /></td>
                      <td className="p-2"><Skeleton className="h-5 w-20" /></td>
                      <td className="p-2"><Skeleton className="h-8 w-20 md:w-36" /></td>
                    </tr>
                  ))
                  : APPLICANTS.map((a, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2">
                        <div className="font-medium">{a.name}</div>
                        <div className="text-xs text-gray-500 sm:hidden">{a.experience} yrs</div>
                        <div className="text-xs text-gray-500 md:hidden">
                          {a.skills.slice(0, 2).join(", ")}
                          {a.skills.length > 2 && "..."}
                        </div>
                        <div className="text-xs text-gray-500 lg:hidden">
                          <a href="#" className="underline text-primary">{a.resume}</a>
                        </div>
                      </td>
                      <td className="p-2 hidden sm:table-cell">{a.experience} yrs</td>
                      <td className="p-2 hidden md:table-cell">
                        <div className="flex gap-1 flex-wrap">
                          {a.skills.map(s => (
                            <span key={s} className="bg-primary-light text-primary px-2 py-1 rounded text-xs">{s}</span>
                          ))}
                        </div>
                      </td>
                      <td className="p-2 hidden lg:table-cell">
                        <a href="#" className="underline text-primary text-sm">{a.resume}</a>
                      </td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded ${statusColor(a.status)} text-xs`}>{a.status}</span>
                      </td>
                      <td className="p-2">
                        <div className="flex flex-col md:flex-row gap-1">
                          <Button size="sm" variant="outline" className="text-xs px-2">Shortlist</Button>
                          <Button size="sm" variant="outline" className="text-xs px-2">Reject</Button>
                          <Button size="sm" variant="outline" className="text-xs px-2 hidden md:inline-flex">Mark Hired</Button>
                          <Button size="sm" variant="outline" className="text-xs px-2 md:hidden">Hire</Button>
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
