
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const APPLICATIONS = [
  {
    title: "React Developer",
    date: "2025-06-01",
    status: "Pending",
  },
  {
    title: "DevOps Engineer",
    date: "2025-05-24",
    status: "Shortlisted",
  },
  {
    title: "Java Backend Engineer",
    date: "2025-05-20",
    status: "Rejected",
  },
];

const statusColor = (status: string) => {
  switch (status) {
    case "Pending": return "bg-warning text-white";
    case "Shortlisted": return "bg-success text-white";
    case "Rejected": return "bg-destructive text-white";
    default: return "bg-muted";
  }
};

const Applications = () => (
  <div className="p-8">
    <Card>
      <CardHeader>
        <CardTitle>My Applications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[400px]">
            <thead>
              <tr className="text-left">
                <th className="p-2 text-sm text-text-muted">Title</th>
                <th className="p-2 text-sm text-text-muted">Date Applied</th>
                <th className="p-2 text-sm text-text-muted">Status</th>
              </tr>
            </thead>
            <tbody>
              {APPLICATIONS.map((app, idx) => (
                <tr key={idx} className="border-b">
                  <td className="p-2">{app.title}</td>
                  <td className="p-2">{app.date}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded ${statusColor(app.status)} text-xs`}>{app.status}</span>
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

export default Applications;
