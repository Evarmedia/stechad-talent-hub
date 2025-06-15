import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const COUNTRIES = ["France", "Germany", "Spain", "Italy", "Netherlands", "Poland", "Portugal"];
const SKILLS = ["React", "Node.js", "Python", "Java", "AWS", "Docker", "C#", "SQL", "TypeScript", "Kubernetes"];

const Onboarding = () => {
  const [form, setForm] = useState({
    name: "",
    country: "",
    languages: "",
    experience: "",
    skills: [] as string[],
    resume: null as File | null,
    github: "",
    linkedin: "",
    portfolio: "",
    availability: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  function handleSkillToggle(skill: string) {
    setForm(f => ({
      ...f,
      skills: f.skills.includes(skill)
        ? f.skills.filter(s => s !== skill)
        : [...f.skills, skill],
    }));
  }
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setForm(f => ({ ...f, resume: file }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({ title: "Onboarding Complete!", description: "Welcome aboard. Your profile has been submitted!" });
      navigate("/dashboard/engineer");
    }, 1200);
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-2">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="mb-2 text-primary text-center">Engineer Onboarding</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block font-semibold text-primary">Full Name</label>
            <Input
              name="name"
              value={form.name}
              readOnly
              placeholder="Your full name"
              className="bg-muted"
            />
            <label className="block font-semibold text-primary">Country of Residence</label>
            <select
              name="country"
              value={form.country}
              onChange={handleInputChange}
              className="border p-3 rounded w-full"
              required
            >
              <option value="">Select country</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <label className="block font-semibold text-primary">Languages Spoken</label>
            <Input
              name="languages"
              value={form.languages}
              onChange={handleInputChange}
              placeholder="E.g., English, French"
              required
            />
            <label className="block font-semibold text-primary">Years of Experience</label>
            <Input
              name="experience"
              type="number"
              value={form.experience}
              placeholder="5"
              onChange={handleInputChange}
              required
            />
            <label className="block font-semibold text-primary">Primary Skills</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {SKILLS.map(skill => (
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
            <label className="block font-semibold text-primary">Resume (PDF)</label>
            <Input type="file" accept=".pdf" onChange={handleFileChange} />
            {form.resume && (
              <span className="text-xs text-text-muted">{form.resume.name}</span>
            )}
            <label className="block font-semibold text-primary">Links (GitHub, LinkedIn, Portfolio)</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input name="github" placeholder="GitHub URL" value={form.github} onChange={handleInputChange} />
              <Input name="linkedin" placeholder="LinkedIn URL" value={form.linkedin} onChange={handleInputChange} />
              <Input name="portfolio" placeholder="Portfolio URL" value={form.portfolio} onChange={handleInputChange} />
            </div>
            <label className="block font-semibold text-primary">Availability</label>
            <select
              name="availability"
              value={form.availability}
              className="border p-3 rounded w-full"
              onChange={handleInputChange}
              required
            >
              <option value="">Select</option>
              <option value="immediate">Immediate</option>
              <option value="2w">2 Weeks</option>
              <option value="1m">1 Month</option>
            </select>
            <Button
              type="submit"
              className="w-full mt-3"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Onboarding"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
