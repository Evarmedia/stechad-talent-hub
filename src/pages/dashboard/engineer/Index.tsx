
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Briefcase, User, CheckCircle, Clock, Calendar, TrendingUp } from "lucide-react";

const RECENT_APPS = [
  { id: 1, title: "Frontend React Dev", applied: "2025-06-13", status: "Pending", company: "TechCorp" },
  { id: 2, title: "AWS Cloud Specialist", applied: "2025-05-21", status: "Shortlisted", company: "CloudWorks" },
  { id: 3, title: "Full Stack Developer", applied: "2025-06-10", status: "Interview", company: "StartupX" },
];

const CURRENT_PROJECTS = [
  { title: "E-commerce Platform", progress: 75, status: "In Progress", deadline: "2025-07-15", role: "Frontend Developer" },
  { title: "Mobile App Backend", progress: 60, status: "In Progress", deadline: "2025-08-01", role: "Backend Engineer" },
];

const skills = ["React", "Node.js", "SQL", "AWS", "TypeScript", "Python"];

const stats = [
  { label: "Applications", value: 12, icon: Briefcase, change: "+3 this week" },
  { label: "Interviews", value: 4, icon: User, change: "2 scheduled" },
  { label: "Projects", value: 2, icon: CheckCircle, change: "Active" },
  { label: "Profile Views", value: 24, icon: TrendingUp, change: "+8 this month" },
];

const quickLinks = [
  { to: "/dashboard/engineer/jobs", label: "Browse Jobs", icon: "💼" },
  { to: "/dashboard/engineer/applications", label: "My Applications", icon: "📝" },
  { to: "/dashboard/engineer/projects", label: "My Projects", icon: "🏗️" },
  { to: "/dashboard/engineer/profile", label: "Profile", icon: "👤" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Shortlisted": return "bg-blue-100 text-blue-800";
    case "Interview": return "bg-purple-100 text-purple-800";
    case "Pending": return "bg-yellow-100 text-yellow-800";
    case "In Progress": return "bg-green-100 text-green-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const EngineerDashboard = () => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="py-8 max-w-6xl mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-primary">Engineer Dashboard</h1>
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
              .map((_, i) => (
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
                  <div className="text-xs text-muted-foreground">{stat.change}</div>
                </CardContent>
              </Card>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Account Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Account Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <>
                <Skeleton className="h-6 w-60 mb-3" />
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-5 w-32" />
              </>
            ) : (
              <div className="space-y-3">
                <div>
                  <span className="font-semibold text-sm">Active Skills:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {skills.map(s => (
                      <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Availability:</span>
                  <Badge className="bg-green-100 text-green-800">Available</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Profile Completion:</span>
                  <span>85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              Recent Applications
              <Button asChild variant="outline" size="sm" className="text-xs">
                <Link to="/dashboard/engineer/applications">View All</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-5 w-full" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {RECENT_APPS.map((app) => (
                  <div key={app.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{app.title}</span>
                      <Badge className={getStatusColor(app.status)} variant="outline">
                        {app.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{app.company}</span>
                      <span>{app.applied}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Current Projects */}
      <Card className="mb-8">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            Current Projects
            <Button asChild variant="outline" size="sm" className="text-xs">
              <Link to="/dashboard/engineer/projects">View All</Link>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array(2).fill(0).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-2 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CURRENT_PROJECTS.map((project, idx) => (
                <div key={idx} className="space-y-2 p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{project.title}</span>
                    <Badge className={getStatusColor(project.status)} variant="outline">
                      {project.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">{project.role}</div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Due: {project.deadline}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array(4).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickLinks.map(link => (
                <Button asChild key={link.label} variant="outline" className="h-auto py-3">
                  <Link to={link.to} className="flex flex-col items-center gap-2">
                    <span className="text-lg">{link.icon}</span>
                    <span className="text-xs text-center">{link.label}</span>
                  </Link>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EngineerDashboard;
