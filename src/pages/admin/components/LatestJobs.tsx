
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

const recentJobs = [
  { title: "Java Backend Engineer", posted: "1 day ago", applications: 8 },
  { title: "React Developer", posted: "2 days ago", applications: 12 },
  { title: "DevOps Engineer", posted: "3 days ago", applications: 6 },
];

interface LatestJobsProps {
  loading: boolean;
}

const LatestJobs: React.FC<LatestJobsProps> = ({ loading }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          Latest Job Postings
          <Button asChild variant="outline" size="sm" className="text-xs">
            <Link to="/admin/jobs">View All</Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array(3).fill(0).map((_, i) => (
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
  );
};

export default LatestJobs;
