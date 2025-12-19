
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useDataContext } from "@/hooks/useDataContext";
import { Briefcase, Calendar, Clock, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const PMDashboard = () => {
  // const [loading, setLoading] = useState(true);
  const { pmDashboardData, loading } = useDataContext();
  // const [jobs, setJobs] = useState([]);
  // const [projects, setProjects] = useState([]);
  // const [applications, setApplications] = useState([]);
  const [activeProjectsCount, setActiveProjectsCount] = useState(0);
  const [totalApplicationsCount, setTotalApplicationsCount] = useState(0);
  const [totalJobsCount, setTotalJobsCount] = useState(0);
  const [totalProjectsCount, setTotalProjectsCount] = useState(0);
  const [recentApplications, setRecentApplications] = useState([]);
  const [activeProjects, setActiveProjects] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);

  
  const { user } = useAuthContext();
  
  useEffect(() => {
    if (pmDashboardData) {
      setActiveProjectsCount(pmDashboardData.statistics.activeProjectsCount);
      setTotalApplicationsCount(pmDashboardData.statistics.totalApplicationsCount);
      setTotalJobsCount(pmDashboardData.statistics.totalJobsCount);
      setTotalProjectsCount(pmDashboardData.statistics.totalProjectsCount);
      setRecentApplications(pmDashboardData.recentApplications);
      setActiveProjects(pmDashboardData.activeProjects);
      setRecentJobs(pmDashboardData.recentJobs);
    }
  }, []);
  
  // console.log("recentJobs state:", recentJobs);
  // console.log("pmDashboardData:", pmDashboardData);
  // const activeJobs = jobs.filter(job => job.status === 'active').length;
  // const totalApplications = applications.length;
  // const totalProjects = projects.length;
  // const completedProjects = projects.filter(p => p.status === 'Completed').length;

  const stats = [
    { label: "Active Jobs", value: totalJobsCount, icon: Briefcase, change: `+${recentJobs.length} this week` },
    { label: "Total Applicantions", value: totalApplicationsCount, icon: Users, change: `+${recentApplications.length} new` },
    { label: "Projects", value: activeProjectsCount, icon: Clock, change: `${totalProjectsCount} completed` },
    { label: "Success Rate", value: "94%", icon: TrendingUp, change: "+2%" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-800";
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "Planning": return "bg-yellow-100 text-yellow-800";
      case "active": return "bg-green-100 text-green-800";
      case "closed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="py-8 max-w-6xl mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-primary">Project Manager Dashboard</h1>
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
        {/* Your Jobs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              Your Jobs
              <Button asChild variant="outline" size="sm" className="text-xs">
                <Link to="/dashboard/pm/manage-jobs">View All</Link>
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
                  {recentJobs.map((job) => (
                  <div key={job.jobs_id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{job.title}</span>
                      <Badge className={getStatusColor(job.status)} variant="outline">
                        {job.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Posted: {job.posted_at.split("T")[0]}</span>
                        <span>{job.applications_count} applicants</span>
                    </div>
                  </div>
                ))}
                  {recentJobs.length === 0 && (
                    <div className="col-span-2 text-center text-muted-foreground py-8">
                      No Active Jobs yet...
                    </div>
                  )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Your Projects */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              Your Projects
              <Button asChild variant="outline" size="sm" className="text-xs">
                <Link to="/dashboard/pm/projects">View All</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
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
              <div className="space-y-4">
                  {activeProjects.slice(0, 3).map((project, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{project.title}</span>
                      <Badge className={getStatusColor(project.status)} variant="outline">
                        {project.status}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{project.team?.length || 0} team members</span>
                      <span>Due: {project.deadline}</span>
                    </div>
                  </div>
                ))}
                  {activeProjects.length === 0 && (
                    <div className="col-span-2 text-center text-muted-foreground py-8">
                      No projects yet...
                    </div>
                  )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Post a New Job</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <>
                <Skeleton className="h-5 w-44 mb-3" />
                <Skeleton className="h-10 w-36" />
              </>
            ) : (
              <>
                <p className="mb-4 text-sm text-muted-foreground">Start hiring top talent by posting new positions to the STECHAD platform.</p>
                <Button asChild>
                  <Link to="/dashboard/pm/post-job">Post New Job</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex gap-4 flex-wrap">
                {Array(3).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-32" />
                ))}
              </div>
            ) : (
              <div className="flex gap-4 flex-wrap">
                <Button asChild variant="outline" size="sm">
                  <Link to="/dashboard/pm/applicant/">View Applicants</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/dashboard/pm/manage-jobs">Manage Jobs</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/dashboard/pm/projects">View Projects</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PMDashboard;
