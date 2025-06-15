import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

const initialJobs = [
  {
    title: "React Developer",
    pm: "John Doe",
    location: "Paris",
    date: "2025-06-01",
    applications: 5,
    status: "Active",
  },
  {
    title: "DevOps Engineer",
    pm: "Alice Smith",
    location: "Remote",
    date: "2025-05-28",
    applications: 2,
    status: "Closed",
  },
];

const statusColor = (status: string) =>
  status === "Active"
    ? "bg-success text-white"
    : "bg-muted text-text-main";

const AdminJobs = () => {
  const [jobs, setJobs] = useState(initialJobs);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState({
    title: "",
    pm: "",
    location: "",
    status: "Active",
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  // Open dialog and populate form
  const handleEditClick = (idx: number) => {
    setEditIndex(idx);
    const job = jobs[idx];
    setForm({
      title: job.title,
      pm: job.pm,
      location: job.location,
      status: job.status,
    });
  };

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Save edits (local only)
  const handleSave = () => {
    if (editIndex !== null) {
      const updated = [...jobs];
      updated[editIndex] = {
        ...updated[editIndex],
        ...form,
        status: form.status as "Active" | "Closed",
      };
      setJobs(updated);
      setEditIndex(null);
    }
  };

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Jobs Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="text-left">
                  <th className="p-2 text-sm text-text-muted">Title</th>
                  <th className="p-2 text-sm text-text-muted">PM Name</th>
                  <th className="p-2 text-sm text-text-muted">Location</th>
                  <th className="p-2 text-sm text-text-muted">Date Posted</th>
                  <th className="p-2 text-sm text-text-muted">Applications</th>
                  <th className="p-2 text-sm text-text-muted">Status</th>
                  <th className="p-2 text-sm"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(2).fill(0).map((_,i)=>(
                    <tr key={i} className="border-b">
                      <td className="p-2"><Skeleton className="h-6 w-40" /></td>
                      <td className="p-2"><Skeleton className="h-6 w-32" /></td>
                      <td className="p-2"><Skeleton className="h-6 w-24" /></td>
                      <td className="p-2"><Skeleton className="h-6 w-20" /></td>
                      <td className="p-2"><Skeleton className="h-6 w-16" /></td>
                      <td className="p-2"><Skeleton className="h-6 w-20" /></td>
                      <td className="p-2"><Skeleton className="h-8 w-24" /></td>
                    </tr>
                  ))
                ) : (
                  jobs.map((job, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2">{job.title}</td>
                      <td className="p-2">{job.pm}</td>
                      <td className="p-2">{job.location}</td>
                      <td className="p-2">{job.date}</td>
                      <td className="p-2">{job.applications}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded ${statusColor(job.status)} text-xs`}>{job.status}</span>
                      </td>
                      <td className="p-2">
                        <Dialog open={editIndex === i} onOpenChange={open => { if (!open) setEditIndex(null); }}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => handleEditClick(i)}>Edit</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Job</DialogTitle>
                              <DialogDescription>Update job details and status.</DialogDescription>
                            </DialogHeader>
                            <form
                              onSubmit={e => { e.preventDefault(); handleSave(); }}
                              className="space-y-4"
                            >
                              <div>
                                <label className="block text-sm mb-1 font-medium">Title</label>
                                <input
                                  name="title"
                                  className="w-full rounded border px-2 py-1 text-sm"
                                  value={form.title}
                                  onChange={handleChange}
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm mb-1 font-medium">PM Name</label>
                                <input
                                  name="pm"
                                  className="w-full rounded border px-2 py-1 text-sm"
                                  value={form.pm}
                                  onChange={handleChange}
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm mb-1 font-medium">Location</label>
                                <input
                                  name="location"
                                  className="w-full rounded border px-2 py-1 text-sm"
                                  value={form.location}
                                  onChange={handleChange}
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm mb-1 font-medium">Status</label>
                                <select
                                  name="status"
                                  className="w-full rounded border px-2 py-1 text-sm"
                                  value={form.status}
                                  onChange={handleChange}
                                >
                                  <option value="Active">Active</option>
                                  <option value="Closed">Closed</option>
                                </select>
                              </div>
                              <DialogFooter>
                                <Button type="submit">Save</Button>
                                <DialogClose asChild>
                                  <Button type="button" variant="outline">Cancel</Button>
                                </DialogClose>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                        <Button size="sm" variant="outline" className="ml-2">Delete</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminJobs;
