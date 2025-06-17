import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const stats = [
  { label: "Engineers", value: 74 },
  { label: "Job Posts", value: 29 },
  { label: "Active Jobs", value: 23 },
  { label: "Applications", value: 112 },
];

const recentEngineers = [
  { name: "Jane Doe", country: "France" },
  { name: "Max Mustermann", country: "Germany" },
  { name: "Alice Smith", country: "Spain" },
  { name: "Hong Lee", country: "Poland" },
  { name: "Olga Ivanova", country: "Russia" },
];

const recentJobs = [
  { title: "Java Backend Engineer", posted: "1 day ago" },
  { title: "React Developer", posted: "2 days ago" },
];

const AdminIndex = () => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-primary mb-6">Admin Dashboard Overview</h1>
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {loading
          ? Array(4)
              .fill(0)
              .map((_,i) => (
                <Card key={i} className="text-center">
                  <CardContent className="py-4">
                    <Skeleton className="h-9 w-20 mx-auto mb-3" />
                    <Skeleton className="h-5 w-16 mx-auto" />
                  </CardContent>
                </Card>
              ))
          : stats.map((stat) => (
              <Card key={stat.label} className="text-center">
                <CardContent className="py-4">
                  <div className="text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="text-md text-text-main">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
      </div>
      <div className="md:flex gap-8">
        <Card className="mb-6 flex-1">
          <CardHeader>
            <CardTitle>Recent Engineer Signups</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>
                {Array(5).fill(0).map((_,i)=>(
                  <Skeleton key={i} className="h-5 w-full mb-2" />
                ))}
              </div>
            ) : (
              <ul>
                {recentEngineers.map((e, idx) => (
                  <li key={idx} className="mb-2">{e.name} – <span className="text-xs text-text-muted">{e.country}</span></li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card className="mb-6 flex-1">
          <CardHeader>
            <CardTitle>Latest Job Postings</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>
                {Array(2).fill(0).map((_,i)=>(
                  <Skeleton key={i} className="h-5 w-full mb-2" />
                ))}
              </div>
            ) : (
              <ul>
                {recentJobs.map((j, idx) => (
                  <li key={idx} className="mb-2">{j.title} – <span className="text-xs text-text-muted">{j.posted}</span></li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminIndex;
