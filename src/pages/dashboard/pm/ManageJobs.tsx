import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

const JOBS = [
  {
    id: 1,
    title: "React Developer",
    location: "Paris, France",
    posted: "2025-06-02",
    applications: 3,
  },
  {
    id: 2,
    title: "DevOps Engineer",
    location: "Berlin, Germany",
    posted: "2025-05-24",
    applications: 8,
  },
];

const ManageJobs = () => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 950);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Your Posted Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="text-left">
                  <th className="p-2 text-sm text-text-muted">Title</th>
                  <th className="p-2 text-sm text-text-muted">Location</th>
                  <th className="p-2 text-sm text-text-muted">Posted</th>
                  <th className="p-2 text-sm text-text-muted">Applications</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array(2).fill(0).map((_,i)=>(
                    <tr key={i} className="border-b">
                      <td className="p-2"><Skeleton className="h-6 w-40" /></td>
                      <td className="p-2"><Skeleton className="h-6 w-32" /></td>
                      <td className="p-2"><Skeleton className="h-6 w-24" /></td>
                      <td className="p-2"><Skeleton className="h-6 w-16" /></td>
                      <td className="p-2"><Skeleton className="h-8 w-32" /></td>
                    </tr>
                  ))
                  : JOBS.map(job => (
                    <tr key={job.id} className="border-b">
                      <td className="p-2">{job.title}</td>
                      <td className="p-2">{job.location}</td>
                      <td className="p-2">{job.posted}</td>
                      <td className="p-2">{job.applications}</td>
                      <td className="p-2">
                        <Link to={`/dashboard/pm/applicants/${job.id}`}>
                          <Button size="sm" variant="outline">
                            View Applicants
                          </Button>
                        </Link>
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

export default ManageJobs;
