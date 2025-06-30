
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";

const APPLICATIONS = [
  { engineer: "Jane Doe", job: "React Developer", status: "Pending", date: "2025-06-02" },
  { engineer: "Max Mustermann", job: "DevOps Engineer", status: "Shortlisted", date: "2025-05-30" },
  { engineer: "Alice Smith", job: "Java Backend Engineer", status: "Hired", date: "2025-05-21" },
];

const statusColor = (status: string) => {
  switch (status) {
    case "Pending": return "bg-yellow-100 text-yellow-800";
    case "Shortlisted": return "bg-green-100 text-green-800";
    case "Rejected": return "bg-red-100 text-red-800";
    case "Hired": return "bg-blue-100 text-blue-800";
    default: return "bg-gray-100 text-gray-800";
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
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Applications Review</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <div className="flex-1">
              <label className="mr-2 font-semibold text-primary">Filter by Status:</label>
              <select 
                value={filter} 
                onChange={e => setFilter(e.target.value)} 
                className="border rounded p-2 bg-background"
              >
                <option>All</option>
                <option>Pending</option>
                <option>Shortlisted</option>
                <option>Rejected</option>
                <option>Hired</option>
              </select>
            </div>
            <Button size="sm" variant="outline" className="w-full md:w-auto">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Mobile: Card layout */}
          <div className="md:hidden space-y-4">
            {loading
              ? Array(3).fill(0).map((_, i) => (
                  <div key={i} className="border rounded-lg p-4 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                ))
              : filtered.map((a, i) => (
                  <div key={i} className="border rounded-lg p-4 space-y-3">
                    <div>
                      <h3 className="font-medium text-base">{a.engineer}</h3>
                      <p className="text-sm text-muted-foreground">{a.job}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <Badge className={statusColor(a.status)}>{a.status}</Badge>
                      <span className="text-sm text-muted-foreground">{a.date}</span>
                    </div>
                  </div>
                ))}
          </div>

          {/* Desktop: Table layout */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[650px]">
              <thead>
                <tr className="text-left">
                  <th className="p-2 text-sm text-muted-foreground">Engineer</th>
                  <th className="p-2 text-sm text-muted-foreground">Job Title</th>
                  <th className="p-2 text-sm text-muted-foreground">Status</th>
                  <th className="p-2 text-sm text-muted-foreground">Applied</th>
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
                      <td className="p-2">
                        <Badge className={statusColor(a.status)}>{a.status}</Badge>
                      </td>
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
