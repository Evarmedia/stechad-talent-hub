
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const RECENT_APPS = [
  { title: "Frontend React Dev", applied: "2025-06-13", status: "Pending" },
  { title: "AWS Cloud Specialist", applied: "2025-05-21", status: "Shortlisted" },
];

const skills = ["React", "Node.js", "SQL", "AWS", "TypeScript"];

const quickLinks = [
  { to: "/dashboard/engineer/jobs", label: "Browse jobs" },
  { to: "/dashboard/engineer/applications", label: "My applications" },
  { to: "/dashboard/engineer/profile", label: "Profile" },
];

const EngineerDashboard = () => (
  <div className="py-8 max-w-4xl mx-auto">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      <Card>
        <CardHeader>
          <CardTitle>Account Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <span className="font-semibold mr-2">Active skills:</span>
              <span className="inline-flex flex-wrap gap-1">{skills.map(s => (
                <span key={s} className="bg-primary-light text-primary rounded px-2 py-1 text-xs">{s}</span>
              ))}</span>
            </div>
            <div>
              <span className="font-semibold mr-2">Availability:</span>
              <span>Immediate</span>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {RECENT_APPS.map((a, i) => (
              <li key={i} className="py-2 flex justify-between items-center">
                <span>
                  <span className="font-medium">{a.title}</span>
                  <span className="ml-2 text-xs text-muted-foreground">({a.status})</span>
                </span>
                <span className="text-xs">{a.applied}</span>
              </li>
            ))}
          </ul>
          <Button asChild size="sm" variant="ghost" className="mt-3">
            <Link to="/dashboard/engineer/applications">See all applications</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 flex-wrap">
          {quickLinks.map(l => (
            <Button asChild key={l.label} variant="outline">
              <Link to={l.to}>{l.label}</Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default EngineerDashboard;
