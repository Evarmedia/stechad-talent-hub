import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useDataContext } from "@/hooks/useDataContext";
import React, { useState } from "react";

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

const EXPERIENCE_LEVELS = ["entry", "intermediate", "advanced", "expert"] as const;

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
    employment_type: "full-time",
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
        employment_type: form.employment_type,
        salary: form.salary || "Competitive",
        duration: form.duration,
        openings: Number(form.openings),
        experience_level: form.experience_level,
        skills_required: form.skills_required,
        // remote: form.remote,
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
    <div className="px-4 py-6 sm:px-6 lg:px-10 max-w-6xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl sm:text-2xl">
            Post a Job
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* BASIC INFO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <Label>Job Title <span className="text-red-700">*</span></Label>
                <Input name="title" value={form.title} onChange={handleChange} />
              </div>

              <div>
                <Label>Company(optional)</Label>
                <Input name="company" value={form.company} onChange={handleChange} />
              </div>

              <div>
                <Label>Location <span className="text-red-700">*</span></Label>
                <Input name="location" value={form.location} onChange={handleChange} />
              </div>

              <div>
                <Label>Salary(optional)</Label>
                <Input name="salary" value={form.salary} onChange={handleChange} />
              </div>
            </div>

            <div>
              <Label>Description <span className="text-red-700">*</span></Label>
              <Textarea
                name="description"
                rows={4}
                value={form.description}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Required Skills <span className="text-red-700">*</span></Label>
              <MultiSelect
                options={ALL_SKILLS}
                selected={form.skills_required}
                onChange={handleSkillsChange}
              />
            </div>

            {/* REQUIREMENTS & RESPONSIBILITIES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div>
                <Label>Duration <span className="text-red-700">*</span></Label>
                <Input
                  name="duration"
                  placeholder="Duration"
                  value={form.duration}
                  onChange={handleChange}
                />
              </div>

              <div>

                <Label>Openings <span className="text-red-700">*</span></Label>
                <Input
                  name="openings"
                  type="number"
                  placeholder="Openings"
                  value={form.openings}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label>Experience Level <span className="text-red-700">*</span></Label>
                <Select
                  value={form.experience_level}
                  onValueChange={(value) =>
                    setForm(f => ({ ...f, experience_level: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {EXPERIENCE_LEVELS.map(level => (
                      <SelectItem key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* EMPLOYMENT TYPE */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <RadioGroup
                value={form.employment_type}
                onValueChange={handleEmploymentTypeChange}
                className="flex flex-wrap gap-4"
              >
                <label className="flex items-center gap-2">
                  <RadioGroupItem value="full-time" />
                  Full-time
                </label>

                <label className="flex items-center gap-2">
                  <RadioGroupItem value="contract" />
                  Contract
                </label>

                <label className="flex items-center gap-2">
                  <RadioGroupItem value="part-time" />
                  Part-time
                </label>
              </RadioGroup>
            </div>

            <Button
              className="w-full text-base sm:text-lg py-5 sm:py-6 text-white"
              disabled={loading}
            >
              {loading ? "Posting..." : "Post Job"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostJob;
