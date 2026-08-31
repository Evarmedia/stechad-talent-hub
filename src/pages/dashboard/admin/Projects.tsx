import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useDataContext } from "@/hooks/useDataContext";
import { useEffect, useState } from "react";

const defaultValues = {
  title: "",
  description: "",
  status: "planning",
  priority: "medium",
  project_manager_id: "",
};

const AdminProjects = () => {
  const { createProject, getProjects, getProjectManagers, projects, projectManagers, loading } = useDataContext();
  const [form, setForm] = useState(defaultValues);

  useEffect(() => {
    void Promise.all([getProjectManagers(), getProjects()]).catch((error) => {
      const message = error instanceof Error ? error.message : "Could not load project data.";
      toast({ title: "Project data unavailable", description: message, variant: "destructive" });
    });
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateProject = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title.trim()) {
      toast({ title: "Validation error", description: "Project title is required.", variant: "destructive" });
      return;
    }

    try {
      await createProject({
        title: form.title,
        description: form.description,
        status: form.status,
        priority: form.priority,
        project_manager_id: form.project_manager_id || undefined,
      });

      toast({ title: "Project created", description: "The project has been created successfully." });
      setForm(defaultValues);
      await getProjects();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create project.";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-primary/80">Portfolio control</p>
          <h1 className="text-2xl font-bold text-primary">Projects</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[0.8fr_1.2fr] gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create project</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleCreateProject}>
              <div className="space-y-2">
                <label className="text-sm font-medium">Project title</label>
                <Input name="title" value={form.title} onChange={handleChange} placeholder="Customer onboarding portal" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea name="description" value={form.description} onChange={handleChange} placeholder="Summarize the project scope and deliverables" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <select name="status" value={form.status} onChange={handleChange} className="w-full rounded-md border border-border px-3 py-2 text-sm">
                    <option value="planning">Planning</option>
                    <option value="in_progress">In progress</option>
                    <option value="on_hold">On hold</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <select name="priority" value={form.priority} onChange={handleChange} className="w-full rounded-md border border-border px-3 py-2 text-sm">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Assign project manager</label>
                <select name="project_manager_id" value={form.project_manager_id} onChange={handleChange} className="w-full rounded-md border border-border px-3 py-2 text-sm">
                  <option value="">Unassigned</option>
                  {projectManagers.map((pm) => (
                    <option key={pm.project_managers_id} value={pm.project_managers_id}>
                      {pm.user?.first_name || "Project"} {pm.user?.last_name || "Manager"}
                    </option>
                  ))}
                </select>
              </div>

              <Button type="submit" className="w-full text-white" disabled={loading}>Create project</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent projects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground">No projects yet.</p>
            ) : (
              projects.slice(0, 8).map((project) => (
                <div key={project.projects_id || project.id} className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-primary">{project.title}</p>
                      <p className="text-xs text-muted-foreground">{project.project_manager?.user?.first_name || "Unassigned"} {project.project_manager?.user?.last_name || "manager"}</p>
                    </div>
                    <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">{project.status}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{project.priority}</span>
                    <span>{project.progress || 0}% progress</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminProjects;
