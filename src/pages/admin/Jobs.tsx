
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const JOBS = [
  {
    title: "React Developer",
    pm: "John Doe",
    location: "Paris",
    date: "2025-06-01",
    applications: 5,
    status: "Active",
  },
  {
    title: "DevOps Engineer",
    pm: "Alice Smith",
    location: "Remote",
    date: "2025-05-28",
    applications: 2,
    status: "Closed",
  },
];

const statusColor = (status: string) =>
  status === "Active"
    ? "bg-success text-white"
    : "bg-muted text-text-main";

const AdminJobs = () => (
  <div className="p-8">
    <Card>
      <CardHeader>
        <CardTitle>Jobs Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="text-left">
                <th className="p-2 text-sm text-text-muted">Title</th>
                <th className="p-2 text-sm text-text-muted">PM Name</th>
                <th className="p-2 text-sm text-text-muted">Location</th>
                <th className="p-2 text-sm text-text-muted">Date Posted</th>
                <th className="p-2 text-sm text-text-muted">Applications</th>
                <th className="p-2 text-sm text-text-muted">Status</th>
                <th className="p-2 text-sm"></th>
              </tr>
            </thead>
            <tbody>
              {JOBS.map((job, i) => (
                <tr key={i} className="border-b">
                  <td className="p-2">{job.title}</td>
                  <td className="p-2">{job.pm}</td>
                  <td className="p-2">{job.location}</td>
                  <td className="p-2">{job.date}</td>
                  <td className="p-2">{job.applications}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded ${statusColor(job.status)} text-xs`}>{job.status}</span>
                  </td>
                  <td className="p-2">
                    <Button size="sm" variant="outline">Edit</Button>
                    <Button size="sm" variant="outline" className="ml-2">Delete</Button>
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

export default AdminJobs;
