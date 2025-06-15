
import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const JOB_LIST = [
  {
    title: "React Developer",
    location: "Paris, France",
    skills: ["React", "TypeScript", "Node.js"],
    remote: true,
  },
  {
    title: "DevOps Engineer",
    location: "Berlin, Germany",
    skills: ["AWS", "Docker", "Kubernetes"],
    remote: false,
  },
  {
    title: "Java Backend Engineer",
    location: "Remote",
    skills: ["Java", "Spring", "SQL"],
    remote: true,
  },
];

const EngineerJobs = () => {
  const [search, setSearch] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);

  const filtered = JOB_LIST.filter(
    (job) =>
      (!remoteOnly || job.remote) &&
      job.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-2">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search jobs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <label className="flex items-center gap-1 text-sm ml-3">
            <input
              type="checkbox"
              checked={remoteOnly}
              onChange={() => setRemoteOnly(v => !v)}
              className="mr-1"
            />
            Remote only
          </label>
        </div>
        <Button variant="outline" disabled>
          Filter by Skills (coming soon)
        </Button>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {filtered.map((job, idx) => (
          <Card key={idx} className="mb-4">
            <CardHeader>
              <CardTitle className="flex justify-between">
                {job.title}
                {job.remote && <span className="text-green-600 text-xs">Remote</span>}
              </CardTitle>
              <div className="text-sm text-text-muted">{job.location}</div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-3">
                {job.skills.map(skill => (
                  <span key={skill} className="bg-primary-light text-primary rounded px-2 py-1 text-xs">
                    {skill}
                  </span>
                ))}
              </div>
              <Button size="sm">Apply</Button>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && <div>No jobs found.</div>}
      </div>
    </div>
  );
};

export default EngineerJobs;
