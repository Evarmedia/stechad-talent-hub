
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Briefcase, FileText, UserCheck, TrendingUp, Calendar } from "lucide-react";

const stats = [
  { label: "Engineers", value: 74, icon: Users, change: "+12%" },
  { label: "Project Managers", value: 8, icon: UserCheck, change: "+2%" },
  { label: "Active Jobs", value: 23, icon: Briefcase, change: "+5%" },
  { label: "Applications", value: 112, icon: FileText, change: "+18%" },
];

const recentEngineers = [
  { name: "Jane Doe", country: "France", isVetted: true },
  { name: "Max Mustermann", country: "Germany", isVetted: false },
  { name: "Alice Smith", country: "Spain", isVetted: true },
  { name: "Hong Lee", country: "Poland", isVetted: false },
  { name: "Olga Ivanova", country: "Russia", isVetted: true },
];

const recentJobs = [
  { title: "Java Backend Engineer", posted: "1 day ago", applications: 8 },
  { title: "React Developer", posted: "2 days ago", applications: 12 },
  { title: "DevOps Engineer", posted: "3 days ago", applications: 6 },
];

const recentProjects = [
  { title: "E-commerce Platform", pm: "John Doe", status: "In Progress" },
  { title: "Mobile App", pm: "Alice Smith", status: "Planning" },
  { title: "Analytics Dashboard", pm: "John Doe", status: "Completed" },
];

const AdminIndex = () => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-800";
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "Planning": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-primary">Admin Dashboard Overview</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Last updated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading
          ? Array(4)
              .fill(0)
              .map((_,i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-5 rounded" />
                    </div>
                    <Skeleton className="h-8 w-20 mb-2" />
                    <Skeleton className="h-4 w-12" />
                  </CardContent>
                </Card>
              ))
          : stats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-green-600" />
                    <span className="text-xs text-green-600">{stat.change}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Engineers */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              Recent Engineer Signups
              <Button variant="outline" size="sm" className="text-xs">
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array(5).fill(0).map((_,i)=>(
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {recentEngineers.map((e, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{e.name}</div>
                      <div className="text-xs text-muted-foreground">{e.country}</div>
                    </div>
                    {e.isVetted && (
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                        Vetted
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Latest Job Postings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              Latest Job Postings
              <Button variant="outline" size="sm" className="text-xs">
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array(3).fill(0).map((_,i)=>(
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {recentJobs.map((j, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="font-medium text-sm">{j.title}</div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{j.posted}</span>
                      <span>{j.applications} applications</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              Recent Projects
              <Button variant="outline" size="sm" className="text-xs">
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array(3).fill(0).map((_,i)=>(
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {recentProjects.map((p, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="font-medium text-sm">{p.title}</div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">PM: {p.pm}</span>
                      <Badge className={getProjectStatusColor(p.status)} variant="outline">
                        {p.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminIndex;
