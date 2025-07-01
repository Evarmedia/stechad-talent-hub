
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useDataContext } from "@/hooks/useDataContext";
import { useAuthContext } from "@/hooks/useAuthContext";

const statusColor = (status: string) => {
  switch (status) {
    case "pending": return "bg-yellow-100 text-yellow-800";
    case "reviewed": return "bg-blue-100 text-blue-800";
    case "rejected": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const Applications = () => {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  
  const { getApplications } = useDataContext();
  const { user } = useAuthContext();

  useEffect(() => {
    const fetchApplications = async () => {
      if (user) {
        try {
          const applicationsData = await getApplications({ engineerId: user.id });
          setApplications(applicationsData);
        } catch (error) {
          console.error('Error fetching applications:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchApplications();
  }, [getApplications, user]);

  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">My Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile: Card layout */}
          <div className="md:hidden space-y-4">
            {loading
              ? Array(3).fill(0).map((_, i) => (
                  <div key={i} className="border rounded-lg p-4 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))
              : applications.map((app, idx) => (
                  <div key={idx} className="border rounded-lg p-4 space-y-3">
                    <div>
                      <h3 className="font-medium text-base">{app.jobTitle}</h3>
                      <p className="text-sm text-muted-foreground">Applied: {app.appliedDate}</p>
                    </div>
                    <Badge className={statusColor(app.status)}>{app.status}</Badge>
                  </div>
                ))}
            {!loading && applications.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No applications found. Start applying to jobs to see them here.
              </div>
            )}
          </div>

          {/* Desktop: Table layout */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[400px]">
              <thead>
                <tr className="text-left">
                  <th className="p-2 text-sm text-muted-foreground">Title</th>
                  <th className="p-2 text-sm text-muted-foreground">Date Applied</th>
                  <th className="p-2 text-sm text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array(3).fill(0).map((_,i)=>(
                    <tr key={i} className="border-b">
                      <td className="p-2"><Skeleton className="h-6 w-40" /></td>
                      <td className="p-2"><Skeleton className="h-6 w-28" /></td>
                      <td className="p-2"><Skeleton className="h-6 w-24" /></td>
                    </tr>
                  ))
                  : applications.map((app, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="p-2">{app.jobTitle}</td>
                      <td className="p-2">{app.appliedDate}</td>
                      <td className="p-2">
                        <Badge className={statusColor(app.status)}>{app.status}</Badge>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {!loading && applications.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No applications found. Start applying to jobs to see them here.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Applications;
