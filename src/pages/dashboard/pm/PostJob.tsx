
import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const ALL_SKILLS = [
  "React", "Node.js", "Python", "Java", "AWS", "Docker", "C#", "SQL", "TypeScript", "Kubernetes"
];

const PostJob = () => {
  const [form, setForm] = useState({
    title: "",
    location: "",
    description: "",
    skills: [] as string[],
    duration: "",
    openings: "",
    remote: false,
  });
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  }
  function handleSkillToggle(skill: string) {
    setForm(f => ({
      ...f,
      skills: f.skills.includes(skill)
        ? f.skills.filter(s => s !== skill)
        : [...f.skills, skill],
    }));
  }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({ title: "Job Posted!", description: `Job "${form.title}" was successfully posted.` });
    }, 1100);
  }

  return (
    <div className="p-8 max-w-xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Post a Job</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block font-semibold text-primary">Job Title</label>
            <Input name="title" value={form.title} onChange={handleChange} required />
            <label className="block font-semibold text-primary">Location</label>
            <Input name="location" value={form.location} onChange={handleChange} required />
            <label className="block font-semibold text-primary">Job Description</label>
            <Textarea name="description" value={form.description} onChange={handleChange} rows={4} required />
            <label className="block font-semibold text-primary">Required Skills</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {ALL_SKILLS.map(skill => (
                <Button
                  type="button"
                  key={skill}
                  variant={form.skills.includes(skill) ? "default" : "outline"}
                  onClick={() => handleSkillToggle(skill)}
                  className="rounded-full text-xs"
                >
                  {skill}
                </Button>
              ))}
            </div>
            <label className="block font-semibold text-primary">Duration</label>
            <Input name="duration" value={form.duration} onChange={handleChange} placeholder="e.g. 6 months" required />
            <label className="block font-semibold text-primary">Number of Openings</label>
            <Input name="openings" type="number" value={form.openings} onChange={handleChange} required />
            <label className="block font-semibold text-primary">Remote?</label>
            <input type="checkbox" name="remote" checked={form.remote} onChange={handleChange} className="ml-2" />
            <Button type="submit" className="w-full mt-3" disabled={loading}>
              {loading ? "Posting..." : "Submit Job"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostJob;
