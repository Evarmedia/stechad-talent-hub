import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

const demoJobs = [
  { title: "React Fullstack Developer", posted: "2025-06-07", applicants: 5 },
  { title: "AWS DevOps Lead", posted: "2025-05-31", applicants: 3 },
];

const PMDashboard = () => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 950);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="py-8 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <ul className="divide-y">
                {Array(2).fill(0).map((_,i)=>(
                  <li key={i} className="py-2 flex justify-between items-center">
                    <Skeleton className="h-5 w-56" />
                    <Skeleton className="h-5 w-20" />
                  </li>
                ))}
              </ul>
            ) : (
            <ul className="divide-y">
              {demoJobs.map((j,i)=>(
                <li key={i} className="py-2 flex justify-between items-center">
                  <span>
                    <span className="font-medium">{j.title}</span>
                    <span className="ml-2 text-xs text-muted-foreground"> — {j.posted}</span>
                  </span>
                  <span className="text-xs">{j.applicants} applicants</span>
                </li>
              ))}
            </ul>
            )}
            <Button asChild size="sm" variant="ghost" className="mt-3" disabled={loading}>
              <Link to="/dashboard/pm/manage-jobs">Go to all Jobs</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Post a new Job</CardTitle>
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
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Shortcuts</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex gap-4 flex-wrap">
              {Array(2).fill(0).map((_,i)=>(
                <Skeleton key={i} className="h-10 w-44" />
              ))}
            </div>
          ) : (
            <div className="flex gap-4 flex-wrap">
              <Button asChild variant="outline">
                <Link to="/dashboard/pm/applicants/1">See Applicants</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/dashboard/pm/manage-jobs">Manage Jobs</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
export default PMDashboard;
