
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useDataContext } from "@/hooks/useDataContext";

const EngineerJobs = () => {
  const [search, setSearch] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [openJD, setOpenJD] = useState<number | null>(null);
  const [jobsList, setJobsList] = useState([]);
  
  const { getJobs, loading } = useDataContext();

  useEffect(() => {
    const fetchJobs = async () => {
      const filters = {
        remote: remoteOnly || undefined,
        search: search || undefined
      };
      const jobs = await getJobs(filters);
      setJobsList(jobs);
    };

    fetchJobs();
  }, [getJobs, search, remoteOnly]);

  const filtered = jobsList.filter(
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
              onChange={() => setRemoteOnly((v) => !v)}
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
        {loading ? (
          Array(3)
            .fill(0)
            .map((_, i) => (
              <Card className="mb-4" key={i}>
                <CardHeader>
                  <CardTitle>
                    <Skeleton className="h-6 w-2/3 mb-2" />
                  </CardTitle>
                  <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-3">
                    <Skeleton className="h-6 w-16 rounded px-2 py-1" />
                    <Skeleton className="h-6 w-12 rounded px-2 py-1" />
                    <Skeleton className="h-6 w-20 rounded px-2 py-1" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-9 w-20 rounded" />
                    <Skeleton className="h-9 w-20 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))
        ) : (
          <>
            {filtered.map((job, idx) => (
              <React.Fragment key={job.id}>
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle className="flex justify-between">
                      {job.title}
                      {job.remote && (
                        <span className="text-green-600 text-xs">Remote</span>
                      )}
                    </CardTitle>
                    <div className="text-sm text-text-muted">{job.location}</div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {job.skills.map((skill) => (
                        <span
                          key={skill}
                          className="bg-primary-light text-primary rounded px-2 py-1 text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm">Apply</Button>
                      <Dialog open={openJD === job.id} onOpenChange={open => setOpenJD(open ? job.id : null)}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            View JD
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{job.title} - Job Details</DialogTitle>
                            <DialogDescription>
                              <span className="text-xs text-muted-foreground">
                                {job.location} {job.remote && "｜Remote"}
                              </span>
                            </DialogDescription>
                          </DialogHeader>
                          <div className="mb-3">
                            <strong className="block text-primary mb-1">
                              Description
                            </strong>
                            <div>{job.description}</div>
                          </div>
                          <div className="mb-3">
                            <strong className="block text-primary mb-1">
                              Responsibilities
                            </strong>
                            <ul className="list-disc ml-6 text-sm">
                              {job.responsibilities.map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <strong className="block text-primary mb-1">
                              Requirements
                            </strong>
                            <ul className="list-disc ml-6 text-sm">
                              {job.requirements.map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </div>
                          <DialogFooter>
                            <Button onClick={() => setOpenJD(null)} variant="secondary">
                              Close
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              </React.Fragment>
            ))}
            {filtered.length === 0 && <div>No jobs found.</div>}
          </>
        )}
      </div>
    </div>
  );
};

export default EngineerJobs;
