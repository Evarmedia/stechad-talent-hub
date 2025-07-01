
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, User } from "lucide-react";
import { EngineerDetailsDialog } from "@/components/EngineerDetailsDialog";
import { useDataContext } from "@/hooks/useDataContext";

const Engineers = () => {
  const [loading, setLoading] = useState(true);
  const [engineers, setEngineers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedEngineer, setSelectedEngineer] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { getEngineers } = useDataContext();

  useEffect(() => {
    const fetchEngineers = async () => {
      try {
        const engineersData = await getEngineers();
        setEngineers(engineersData);
      } catch (error) {
        console.error('Error fetching engineers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEngineers();
  }, [getEngineers]);

  const filteredEngineers = engineers.filter(engineer => {
    const matchesSearch = engineer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         engineer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || engineer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    return status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800";
  };

  const handleViewEngineer = (engineer: any) => {
    setSelectedEngineer(engineer);
    setIsDetailsOpen(true);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Engineers Management</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search engineers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-md px-3 py-2 bg-background"
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Engineers List ({filteredEngineers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile: Card layout */}
          <div className="md:hidden space-y-4">
            {loading
              ? Array(3).fill(0).map((_, i) => (
                  <div key={i} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-40" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </div>
                  </div>
                ))
              : filteredEngineers.map((engineer) => (
                  <div key={engineer.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{engineer.name}</h3>
                          {engineer.isVetted && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                              Vetted
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{engineer.email}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium">Skills: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {engineer.skills.map(skill => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Experience: </span>
                        <span className="font-medium">{engineer.experience} years</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Country: </span>
                        <span className="font-medium">{engineer.country}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <Badge className={getStatusColor(engineer.status)}>
                        {engineer.status}
                      </Badge>
                      <Button size="sm" variant="outline" onClick={() => handleViewEngineer(engineer)}>
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
                  <th className="p-3 text-sm font-medium text-muted-foreground">Engineer</th>
                  <th className="p-3 text-sm font-medium text-muted-foreground">Skills</th>
                  <th className="p-3 text-sm font-medium text-muted-foreground">Experience</th>
                  <th className="p-3 text-sm font-medium text-muted-foreground">Country</th>
                  <th className="p-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="p-3 text-sm font-medium text-muted-foreground">Joined</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array(3).fill(0).map((_, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-3"><Skeleton className="h-5 w-40" /></td>
                        <td className="p-3"><Skeleton className="h-5 w-32" /></td>
                        <td className="p-3"><Skeleton className="h-5 w-20" /></td>
                        <td className="p-3"><Skeleton className="h-5 w-20" /></td>
                        <td className="p-3"><Skeleton className="h-5 w-16" /></td>
                        <td className="p-3"><Skeleton className="h-5 w-24" /></td>
                        <td className="p-3"><Skeleton className="h-8 w-20" /></td>
                      </tr>
                    ))
                  : filteredEngineers.map((engineer) => (
                      <tr key={engineer.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{engineer.name}</span>
                                {engineer.isVetted && (
                                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                    Vetted
                                  </Badge>
                                )}
                              </div>
                              <span className="text-sm text-muted-foreground">{engineer.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {engineer.skills.slice(0, 2).map(skill => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {engineer.skills.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{engineer.skills.length - 2}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-sm">{engineer.experience} years</td>
                        <td className="p-3 text-sm">{engineer.country}</td>
                        <td className="p-3">
                          <Badge className={getStatusColor(engineer.status)}>
                            {engineer.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">{engineer.joinedAt}</td>
                        <td className="p-3">
                          <Button size="sm" variant="outline" onClick={() => handleViewEngineer(engineer)}>
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

      <EngineerDetailsDialog
        engineer={selectedEngineer}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </div>
  );
};

export default Engineers;
