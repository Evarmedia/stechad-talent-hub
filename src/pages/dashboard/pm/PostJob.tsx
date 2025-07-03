import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MultiSelect } from "@/components/ui/multi-select";
import { toast } from "@/hooks/use-toast";
import { useDataContext } from "@/hooks/useDataContext";

const ALL_SKILLS = [
  "React", "Node.js", "Python", "Java", "AWS", "Docker", "C#", "SQL", "TypeScript", "Kubernetes",
  "JavaScript", "Angular", "Vue.js", "Express.js", "MongoDB", "PostgreSQL", "Redis", "GraphQL",
  "Next.js", "Laravel", "Spring Boot", "Django", "Flask", "Ruby on Rails", "PHP", "Go",
  "Rust", "Swift", "Kotlin", "Flutter", "React Native", "Firebase", "Azure", "GCP"
];

const PostJob = () => {
  const { createJob } = useDataContext();
  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    description: "",
    skills: [] as string[],
    duration: "",
    openings: "",
    remote: false,
    employmentType: "fulltime",
    salary: "",
    experience: "",
  });
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const target = e.target;
    const { name, type, value } = target;

    if (type === "checkbox" && target instanceof HTMLInputElement) {
      setForm(f => ({
        ...f,
        [name]: target.checked,
      }));
    } else {
      setForm(f => ({
        ...f,
        [name]: value,
      }));
    }
  }

  function handleSkillsChange(skills: string[]) {
    setForm(f => ({
      ...f,
      skills,
    }));
  }

  function handleEmploymentTypeChange(value: string) {
    setForm(f => ({
      ...f,
      employmentType: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!form.title || !form.location || !form.description || !form.duration || !form.openings) {
      toast({ 
        title: "Error", 
        description: "Please fill in all required fields.",
        variant: "destructive"
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
        skills: form.skills,
        duration: form.duration,
        openings: parseInt(form.openings),
        remote: form.remote,
        employmentType: form.employmentType,
        salary: form.salary || "Competitive",
        experience: form.experience || "Mid-level",
        posted: new Date().toISOString().split('T')[0],
        status: "active"
      };

      await createJob(jobData);
      
      toast({ 
        title: "Success!", 
        description: `Job "${form.title}" was successfully posted.` 
      });
      
      // Reset form
      setForm({
        title: "",
        company: "",
        location: "",
        description: "",
        skills: [],
        duration: "",
        openings: "",
        remote: false,
        employmentType: "fulltime",
        salary: "",
        experience: "",
      });
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to post job. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Post a Job</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Job Title *</Label>
                <Input 
                  id="title"
                  name="title" 
                  value={form.title} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                <Input 
                  id="company"
                  name="company" 
                  value={form.company} 
                  onChange={handleChange} 
                  placeholder="Your Company"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input 
                  id="location"
                  name="location" 
                  value={form.location} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="salary">Salary</Label>
                <Input 
                  id="salary"
                  name="salary" 
                  value={form.salary} 
                  onChange={handleChange} 
                  placeholder="e.g. $80,000 - $120,000"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Job Description *</Label>
              <Textarea 
                id="description"
                name="description" 
                value={form.description} 
                onChange={handleChange} 
                rows={4} 
                required 
              />
            </div>

            <div>
              <Label>Required Skills</Label>
              <MultiSelect
                options={ALL_SKILLS}
                selected={form.skills}
                onChange={handleSkillsChange}
                placeholder="Type to search or add custom skills..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="duration">Duration *</Label>
                <Input 
                  id="duration"
                  name="duration" 
                  value={form.duration} 
                  onChange={handleChange} 
                  placeholder="e.g. 6 months" 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="openings">Number of Openings *</Label>
                <Input 
                  id="openings"
                  name="openings" 
                  type="number" 
                  value={form.openings} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="experience">Experience Level</Label>
                <Input 
                  id="experience"
                  name="experience" 
                  value={form.experience} 
                  onChange={handleChange} 
                  placeholder="e.g. Mid-level"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    name="remote" 
                    checked={form.remote} 
                    onChange={handleChange} 
                  />
                  Remote Position
                </Label>
              </div>

              <div>
                <Label className="text-sm font-medium">Employment Type</Label>
                <RadioGroup 
                  value={form.employmentType} 
                  onValueChange={handleEmploymentTypeChange}
                  className="flex flex-col space-y-2 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fulltime" id="fulltime" />
                    <Label htmlFor="fulltime">Full-time</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="contract" id="contract" />
                    <Label htmlFor="contract">Contract</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="parttime" id="parttime" />
                    <Label htmlFor="parttime">Part-time</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <Button type="submit" className="w-full mt-6" disabled={loading}>
              {loading ? "Posting..." : "Post Job"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostJob;
