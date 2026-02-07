
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, FileText, Clock, Check, X } from "lucide-react";
import { useDataContext } from "@/hooks/useDataContext";

const AdminApplications = () => {
  // const [applicationsList, setApplicationsList] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  // const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const { getApplications, updateApplication, applications, loading } = useDataContext();

  // useEffect(() => {
  //   const fetchApplications = async () => {
  //     try {
  //       const applications = await getApplications();
  //       setApplicationsList(applications);
  //       setFilteredApplications(applications);
  //     } catch (error) {
  //       console.error('Error fetching applications:', error);
  //     } finally {
  //       setIsInitialLoad(false);
  //     }
  //   };

  //   fetchApplications();
  // }, []); // []<-- getApplications 

  useEffect(() => {
    if (applications) {
      let filtered = [...applications];

      if (searchTerm) {
        filtered = filtered.filter(app => 
          app.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.engineer_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (statusFilter !== "all") {
        filtered = filtered.filter(app => app.status === statusFilter);
      }

      setFilteredApplications(filtered);
    }
  }, [applications, searchTerm, statusFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "reviewed": return "bg-blue-100 text-blue-800";
      case "shortlisted": return "bg-blue-100 text-blue-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "accepted": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "reviewed": return <FileText className="w-4 h-4" />;
      case "accepted": return <Check className="w-4 h-4" />;
      case "rejected": return <X className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      await updateApplication(applicationId, { status: newStatus });
      const updatedApplications = await getApplications();
      setFilteredApplications(updatedApplications);
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === "pending").length,
    reviewed: applications.filter(app => app.status === "reviewed").length,
    accepted: applications.filter(app => app.status === "accepted").length,
    rejected: applications.filter(app => app.status === "rejected").length,
    shortlisted: applications.filter(app => app.status === "shortlisted").length
  };

  // Loading Skeleton
  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {Array(5).fill(0).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-8 w-12 mb-2" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-40" />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-32 mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Application Management</h1>
        <p className="text-gray-600">Review and manage job applications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Applications</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.reviewed}</div>
            <div className="text-sm text-gray-600">Reviewed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
            <div className="text-sm text-gray-600">Accepted</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by job title or engineer name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-gray-500">No applications found</div>
            </CardContent>
          </Card>
        ) : (
          filteredApplications.map((application) => (
            <Card key={application.applications_id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{application.job_title}</h3>
                    <p className="text-gray-600">Applied by {application.engineer_name}</p>
                    <p className="text-sm text-gray-500">Applied on {new Date(application.applied_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(application.status)}>
                      {getStatusIcon(application.status)}
                      <span className="ml-1 capitalize">{application.status}</span>
                    </Badge>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Experience: {`${application.experience || 'X'} years`}</p>
                  {application.skills && (
                    <div className="flex flex-wrap gap-1">
                      {application.skills.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 text-gray-300">
                  {application.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(application.applications_id, "reviewed")}
                      >
                        Mark as Reviewed
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(application.applications_id, "accepted")}
                        className="bg-green-800"
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleStatusUpdate(application.applications_id, "rejected")}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {application.status === "shortlisted" && (
                    <>
                      <Button 
                        size="sm"
                        onClick={() => handleStatusUpdate(application.applications_id, "accepted")}
                        className="bg-green-800"
                      >
                        Accept
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleStatusUpdate(application.applications_id, "rejected")}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {application.status === "reviewed" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(application.applications_id, "accepted")}
                        className="bg-green-800"
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleStatusUpdate(application.applications_id, "rejected")}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminApplications;
