import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const APPLICATIONS = [
  { engineer: "Jane Doe", job: "React Developer", status: "Pending", date: "2025-06-02" },
  { engineer: "Max Mustermann", job: "DevOps Engineer", status: "Shortlisted", date: "2025-05-30" },
  { engineer: "Alice Smith", job: "Java Backend Engineer", status: "Hired", date: "2025-05-21" },
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

const AdminApplications = () => {
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  const filtered = filter === "All"
    ? APPLICATIONS
    : APPLICATIONS.filter(a => a.status === filter);

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Applications Review</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label className="mr-2 font-semibold text-primary">Filter by Status:</label>
            <select value={filter} onChange={e => setFilter(e.target.value)} className="border rounded p-1">
              <option>All</option>
              <option>Pending</option>
              <option>Shortlisted</option>
              <option>Rejected</option>
              <option>Hired</option>
            </select>
            <Button size="sm" variant="outline" className="ml-4">Export (CSV)</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px]">
              <thead>
                <tr className="text-left">
                  <th className="p-2 text-sm text-text-muted">Engineer</th>
                  <th className="p-2 text-sm text-text-muted">Job Title</th>
                  <th className="p-2 text-sm text-text-muted">Status</th>
                  <th className="p-2 text-sm text-text-muted">Applied</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array(3).fill(0).map((_,i)=>(
                    <tr key={i} className="border-b">
                      <td className="p-2"><Skeleton className="h-5 w-40" /></td>
                      <td className="p-2"><Skeleton className="h-5 w-44" /></td>
                      <td className="p-2"><Skeleton className="h-5 w-28" /></td>
                      <td className="p-2"><Skeleton className="h-5 w-20" /></td>
                    </tr>
                  ))
                  : filtered.map((a, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2">{a.engineer}</td>
                      <td className="p-2">{a.job}</td>
                      <td className="p-2"><span className={`px-2 py-1 rounded ${statusColor(a.status)} text-xs`}>{a.status}</span></td>
                      <td className="p-2">{a.date}</td>
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

export default AdminApplications;
