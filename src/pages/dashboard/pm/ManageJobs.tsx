import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Edit } from "lucide-react";

const JOBS = [
  {
    id: 1,
    title: "React Developer",
    location: "Paris, France",
    description: "We are looking for a skilled React developer...",
    skills: ["React", "TypeScript", "Node.js"],
    duration: "6 months",
    openings: 2,
    remote: true,
    posted: "2025-06-02",
    applications: 3,
  },
  {
    id: 2,
    title: "DevOps Engineer",
    location: "Berlin, Germany",
    description: "Seeking an experienced DevOps engineer...",
    skills: ["AWS", "Docker", "Kubernetes"],
    duration: "12 months",
    openings: 1,
    remote: false,
    posted: "2025-05-24",
    applications: 8,
  },
];

const ManageJobs = () => {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState(JOBS);
  const [editingJob, setEditingJob] = useState<typeof JOBS[0] | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    location: "",
    description: "",
    skills: [] as string[],
    duration: "",
    openings: "",
    remote: false,
  });

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 950);
    return () => clearTimeout(t);
  }, []);

  const handleEditClick = (job: typeof JOBS[0]) => {
    setEditingJob(job);
    setEditForm({
      title: job.title,
      location: job.location,
      description: job.description,
      skills: job.skills,
      duration: job.duration,
      openings: job.openings.toString(),
      remote: job.remote,
    });
  };

  const handleEditSave = () => {
    if (!editingJob) return;
    
    const updatedJobs = jobs.map(job => 
      job.id === editingJob.id 
        ? { ...job, ...editForm, openings: parseInt(editForm.openings) }
        : job
    );
    setJobs(updatedJobs);
    setEditingJob(null);
    toast({ title: "Success", description: "Job updated successfully!" });
  };

  const handleSkillToggle = (skill: string) => {
    setEditForm(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const allSkills = ["React", "TypeScript", "Node.js", "AWS", "Docker", "Kubernetes", "Python", "Java"];
  
  return (
    <div className="p-2 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Your Posted Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile: Stack layout */}
          <div className="md:hidden space-y-4">
            {loading
              ? Array(2).fill(0).map((_, i) => (
                  <div key={i} className="border rounded-lg p-4 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </div>
                ))
              : jobs.map(job => (
                  <div key={job.id} className="border rounded-lg p-4 space-y-3">
                    <div>
                      <h3 className="font-medium text-base">{job.title}</h3>
                      <p className="text-sm text-muted-foreground">{job.location}</p>
                      <p className="text-xs text-muted-foreground">Posted: {job.posted}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{job.applications} applications</span>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleEditClick(job)}
                              className="h-8 px-2"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md mx-4">
                            <DialogHeader>
                              <DialogTitle>Edit Job</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                              <div>
                                <label className="text-sm font-medium">Title</label>
                                <Input
                                  value={editForm.title}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Location</label>
                                <Input
                                  value={editForm.location}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Description</label>
                                <Textarea
                                  value={editForm.description}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                  rows={3}
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Skills</label>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {allSkills.map(skill => (
                                    <Button
                                      key={skill}
                                      type="button"
                                      variant={editForm.skills.includes(skill) ? "default" : "outline"}
                                      onClick={() => handleSkillToggle(skill)}
                                      className="text-xs h-7 px-2"
                                    >
                                      {skill}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-sm font-medium">Duration</label>
                                  <Input
                                    value={editForm.duration}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, duration: e.target.value }))}
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Openings</label>
                                  <Input
                                    type="number"
                                    value={editForm.openings}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, openings: e.target.value }))}
                                  />
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={editForm.remote}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, remote: e.target.checked }))}
                                />
                                <label className="text-sm font-medium">Remote Work</label>
                              </div>
                            </div>
                            <DialogFooter className="flex gap-2">
                              <DialogClose asChild>
                                <Button variant="outline" size="sm">Cancel</Button>
                              </DialogClose>
                              <Button onClick={handleEditSave} size="sm">Save</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Link to={`/dashboard/pm/applicants/${job.id}`}>
                          <Button size="sm" variant="outline" className="h-8 px-2 text-xs">
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
          </div>

          {/* Desktop: Table layout */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="text-left">
                  <th className="p-2 text-sm text-text-muted">Title</th>
                  <th className="p-2 text-sm text-text-muted">Location</th>
                  <th className="p-2 text-sm text-text-muted">Posted</th>
                  <th className="p-2 text-sm text-text-muted">Applications</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array(2).fill(0).map((_,i)=>(
                    <tr key={i} className="border-b">
                      <td className="p-2"><Skeleton className="h-6 w-40" /></td>
                      <td className="p-2"><Skeleton className="h-6 w-32" /></td>
                      <td className="p-2"><Skeleton className="h-6 w-24" /></td>
                      <td className="p-2"><Skeleton className="h-6 w-16" /></td>
                      <td className="p-2"><Skeleton className="h-8 w-32" /></td>
                    </tr>
                  ))
                  : jobs.map(job => (
                    <tr key={job.id} className="border-b">
                      <td className="p-2">
                        <div className="font-medium">{job.title}</div>
                      </td>
                      <td className="p-2">{job.location}</td>
                      <td className="p-2">{job.posted}</td>
                      <td className="p-2 text-center">{job.applications}</td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleEditClick(job)}
                                className="text-xs"
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Edit Job</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 max-h-96 overflow-y-auto">
                                <div>
                                  <label className="text-sm font-medium">Title</label>
                                  <Input
                                    value={editForm.title}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Location</label>
                                  <Input
                                    value={editForm.location}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Description</label>
                                  <Textarea
                                    value={editForm.description}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                    rows={3}
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Skills</label>
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {allSkills.map(skill => (
                                      <Button
                                        key={skill}
                                        type="button"
                                        variant={editForm.skills.includes(skill) ? "default" : "outline"}
                                        onClick={() => handleSkillToggle(skill)}
                                        className="text-xs h-7 px-2"
                                      >
                                        {skill}
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-sm font-medium">Duration</label>
                                    <Input
                                      value={editForm.duration}
                                      onChange={(e) => setEditForm(prev => ({ ...prev, duration: e.target.value }))}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Openings</label>
                                    <Input
                                      type="number"
                                      value={editForm.openings}
                                      onChange={(e) => setEditForm(prev => ({ ...prev, openings: e.target.value }))}
                                    />
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={editForm.remote}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, remote: e.target.checked }))}
                                  />
                                  <label className="text-sm font-medium">Remote Work</label>
                                </div>
                              </div>
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button onClick={handleEditSave}>Save Changes</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Link to={`/dashboard/pm/applicants/${job.id}`}>
                            <Button size="sm" variant="outline" className="text-xs">
                              View Applicants
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageJobs;
