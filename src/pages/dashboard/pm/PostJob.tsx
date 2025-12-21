import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useDataContext } from "@/hooks/useDataContext";

const ALL_SKILLS = [
  "React", "Node.js", "Python", "Java", "AWS", "Docker", "C#", "SQL", "TypeScript", "Kubernetes",
  "JavaScript", "Angular", "Vue.js", "Express.js", "MongoDB", "PostgreSQL", "Redis", "GraphQL",
  "Next.js", "Laravel", "Spring Boot", "Django", "Flask", "Ruby on Rails", "PHP", "Go",
  "Rust", "Swift", "Kotlin", "Flutter", "React Native", "Firebase", "Azure", "GCP"
];

const DEFAULT_REQUIREMENTS = [
  "Relevant experience in the required field",
  "Ability to work collaboratively in a team",
  "Strong communication and problem-solving skills",
];

const DEFAULT_RESPONSIBILITIES = [
  "Execute assigned tasks efficiently",
  "Collaborate with team members and stakeholders",
  "Meet project deadlines and quality standards",
];

const EXPERIENCE_LEVELS = ["entry", "intermediate", "senior", "expert"] as const;

const PostJob = () => {
  const { createJob } = useDataContext();

  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    description: "",
    skills_required: [] as string[],
    duration: "",
    openings: "",
    remote: false,
    employment_type: "fulltime",
    salary: "",
    experience_level: "",
    requirements: "",
    responsibilities: "",
    deadline: "",
  });

  const [loading, setLoading] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, type, value, checked } = e.target as HTMLInputElement;
    setForm(f => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleSkillsChange(skills: string[]) {
    setForm(f => ({ ...f, skills_required: skills }));
  }

  function handleEmploymentTypeChange(value: string) {
    setForm(f => ({ ...f, employment_type: value }));
  }

  const toArray = (text: string, fallback: string[]) =>
    text
      .split("\n")
      .map(t => t.trim())
      .filter(Boolean).length
      ? text.split("\n").map(t => t.trim()).filter(Boolean)
      : fallback;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.title || !form.location || !form.description || !form.duration || !form.openings) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const jobData = {
        title: form.title,
        company: form.company || "Your Company",
        location: form.location,
        description: form.description,
        skills_required: form.skills_required,
        duration: form.duration,
        openings: Number(form.openings),
        remote: form.remote,
        employment_type: form.employment_type,
        salary: form.salary || "Competitive",
        experience_level: form.experience_level,
        requirements: toArray(form.requirements, DEFAULT_REQUIREMENTS),
        responsibilities: toArray(form.responsibilities, DEFAULT_RESPONSIBILITIES),
        posted: new Date().toISOString().split("T")[0],
        status: "active",
      };

      await createJob(jobData);

      toast({
        title: "Success",
        description: `Job "${form.title}" was posted successfully.`,
      });

      setForm({
        title: "",
        company: "",
        location: "",
        description: "",
        skills_required: [],
        duration: "",
        openings: "",
        remote: false,
        employment_type: "fulltime",
        salary: "",
        experience_level: "intermediate",
        requirements: "",
        responsibilities: "",
        deadline: "",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to post job.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-10 max-w-6xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Post a Job</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* BASIC INFO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Job Title *</Label>
                <Input name="title" value={form.title} onChange={handleChange} />
              </div>
              <div>
                <Label>Company</Label>
                <Input name="company" value={form.company} onChange={handleChange} />
              </div>
              <div>
                <Label>Location *</Label>
                <Input name="location" value={form.location} onChange={handleChange} />
              </div>
              <div>
                <Label>Salary</Label>
                <Input name="salary" value={form.salary} onChange={handleChange} />
              </div>
            </div>

            <div>
              <Label>Description *</Label>
              <Textarea name="description" rows={4} value={form.description} onChange={handleChange} />
            </div>

            <div>
              <Label>Required Skills</Label>
              <MultiSelect
                options={ALL_SKILLS}
                selected={form.skills_required}
                onChange={handleSkillsChange}
              />
            </div>

            {/* REQUIREMENTS & RESPONSIBILITIES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Requirements</Label>
                <Textarea
                  name="requirements"
                  rows={4}
                  placeholder="One per line (optional)"
                  value={form.requirements}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Responsibilities</Label>
                <Textarea
                  name="responsibilities"
                  rows={4}
                  placeholder="One per line (optional)"
                  value={form.responsibilities}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* META */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input name="duration" placeholder="Duration *" value={form.duration} onChange={handleChange} />
              <Input name="openings" type="number" placeholder="Openings *" value={form.openings} onChange={handleChange} />

              <div>
                {/* <Label>Experience Level</Label> */}
                <Select
                  value={form.experience_level}
                  onValueChange={(value) =>
                    setForm(f => ({ ...f, experience_level: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent className='bg-white'>
                    {EXPERIENCE_LEVELS.map(level => (
                      <SelectItem key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              {/* <Label className="flex gap-2 items-center">
                <input type="checkbox" name="remote" checked={form.remote} onChange={handleChange} />
                Remote role
              </Label> */}

              <RadioGroup
                value={form.employment_type}
                onValueChange={handleEmploymentTypeChange}
                className="flex gap-6"
              >
                <RadioGroupItem value="fulltime" /> Full-time
                <RadioGroupItem value="contract" /> Contract
                <RadioGroupItem value="parttime" /> Part-time
              </RadioGroup>
            </div>

            <Button className="w-full text-lg py-6" disabled={loading}>
              {loading ? "Posting..." : "Post Job"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostJob;
