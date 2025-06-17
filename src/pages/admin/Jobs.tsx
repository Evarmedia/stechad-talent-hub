
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Eye, MapPin, Calendar } from "lucide-react";

const JOBS = [
  {
    id: 1,
    title: "React Developer",
    company: "TechCorp Inc.",
    location: "Paris, France",
    type: "Full-time",
    status: "Active",
    applications: 12,
    posted: "2025-06-02",
    salary: "€50,000 - €70,000"
  },
  {
    id: 2,
    title: "DevOps Engineer", 
    company: "StartupXYZ",
    location: "Berlin, Germany",
    type: "Contract",
    status: "Active", 
    applications: 8,
    posted: "2025-06-01",
    salary: "€60,000 - €80,000"
  },
  {
    id: 3,
    title: "Java Backend Engineer",
    company: "Enterprise Ltd",
    location: "London, UK",
    type: "Full-time",
    status: "Closed",
    applications: 25,
    posted: "2025-05-20",
    salary: "£45,000 - £65,000"
  }
];

const AdminJobs = () => {
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  const filteredJobs = statusFilter === "All" 
    ? JOBS 
    : JOBS.filter(job => job.status === statusFilter);

  const getStatusColor = (status: string) => {
    return status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Job Management</h1>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-md px-3 py-2 bg-background"
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Jobs List ({filteredJobs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile: Card layout */}
          <div className="md:hidden space-y-4">
            {loading
              ? Array(3).fill(0).map((_, i) => (
                  <div key={i} className="border rounded-lg p-4 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </div>
                  </div>
                ))
              : filteredJobs.map((job) => (
                  <div key={job.id} className="border rounded-lg p-4 space-y-3">
                    <div>
                      <h3 className="font-medium text-base">{job.title}</h3>
                      <p className="text-sm text-muted-foreground">{job.company}</p>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>Posted: {job.posted}</span>
                      </div>
                      <div>
                        <span className="font-medium">Salary: </span>
                        <span>{job.salary}</span>
                      </div>
                      <div>
                        <span className="font-medium">Applications: </span>
                        <span>{job.applications}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
          </div>

          {/* Desktop: Table layout */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="p-3 text-sm font-medium text-muted-foreground">Job Title</th>
                  <th className="p-3 text-sm font-medium text-muted-foreground">Company</th>
                  <th className="p-3 text-sm font-medium text-muted-foreground">Location</th>
                  <th className="p-3 text-sm font-medium text-muted-foreground">Applications</th>
                  <th className="p-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="p-3 text-sm font-medium text-muted-foreground">Posted</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array(3).fill(0).map((_, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-3"><Skeleton className="h-5 w-40" /></td>
                        <td className="p-3"><Skeleton className="h-5 w-32" /></td>
                        <td className="p-3"><Skeleton className="h-5 w-28" /></td>
                        <td className="p-3"><Skeleton className="h-5 w-16" /></td>
                        <td className="p-3"><Skeleton className="h-5 w-20" /></td>
                        <td className="p-3"><Skeleton className="h-5 w-24" /></td>
                        <td className="p-3"><Skeleton className="h-8 w-20" /></td>
                      </tr>
                    ))
                  : filteredJobs.map((job) => (
                      <tr key={job.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div>
                            <span className="font-medium">{job.title}</span>
                            <div className="text-sm text-muted-foreground">{job.type}</div>
                          </div>
                        </td>
                        <td className="p-3">{job.company}</td>
                        <td className="p-3 text-sm">{job.location}</td>
                        <td className="p-3 text-center">{job.applications}</td>
                        <td className="p-3">
                          <Badge className={getStatusColor(job.status)}>
                            {job.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">{job.posted}</td>
                        <td className="p-3">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
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

export default AdminJobs;
