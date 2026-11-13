import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useDataContext } from "@/hooks/useDataContext";
import { Loader2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

const defaultValues = {
  title: "",
  description: "",
  status: "planning",
  priority: "medium",
  project_manager_id: "",
  progress: "0",
  start_date: "",
  deadline: "",
};

type AdminProject = {
  projects_id?: string;
  id?: string;
  title: string;
  description?: string | null;
  status?: string;
  priority?: string;
  progress?: number;
  project_managers_id?: string | null;
  project_manager?: {
    project_managers_id?: string;
    user?: {
      first_name?: string;
      last_name?: string;
    };
  } | null;
  start_date?: string | null;
  deadline?: string | null;
};

const AdminProjects = () => {
  const { createProject, updateProject, deleteProject, getProjects, getProjectManagers, projects, projectManagers, loading } = useDataContext();
  const [form, setForm] = useState(defaultValues);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<AdminProject | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([getProjectManagers(), getProjects()]).catch((error) => {
      const message = error instanceof Error ? error.message : "Could not load project data.";
      toast({ title: "Project data unavailable", description: message, variant: "destructive" });
    });
  // The context actions are intentionally run once when this page mounts.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProjectSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title.trim()) {
      toast({ title: "Validation error", description: "Project title is required.", variant: "destructive" });
      return;
    }

    try {
      const payload = {
        title: form.title,
        description: form.description,
        status: form.status,
        priority: form.priority,
        progress: Number(form.progress),
        project_manager_id: form.project_manager_id || null,
        start_date: form.start_date || null,
        deadline: form.deadline || null,
      };

      if (editingProjectId) await updateProject(editingProjectId, payload);
      else await createProject(payload);

      toast({
        title: editingProjectId ? "Project updated" : "Project created",
        description: editingProjectId ? "The project changes have been saved." : "The project has been created successfully.",
      });
      setForm(defaultValues);
      setEditingProjectId(null);
      await getProjects();
    } catch (error) {
      const message = error instanceof Error ? error.message : `Failed to ${editingProjectId ? "update" : "create"} project.`;
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const editProject = (project: AdminProject) => {
    setEditingProjectId(project.projects_id || project.id);
    setForm({
      title: project.title || "",
      description: project.description || "",
      status: project.status || "planning",
      priority: project.priority || "medium",
      project_manager_id: project.project_managers_id || project.project_manager?.project_managers_id || "",
      progress: String(project.progress ?? 0),
      start_date: project.start_date ? String(project.start_date).slice(0, 10) : "",
      deadline: project.deadline ? String(project.deadline).slice(0, 10) : "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const confirmProjectDelete = async () => {
    if (!projectToDelete) return;
    const projectId = projectToDelete.projects_id || projectToDelete.id;
    setDeletingProjectId(projectId);

    try {
      await deleteProject(projectId);
      if (editingProjectId === projectId) {
        setEditingProjectId(null);
        setForm(defaultValues);
      }
      toast({ title: "Project deleted", description: `${projectToDelete.title} has been deleted.` });
      setProjectToDelete(null);
    } catch {
      return;
    } finally {
      setDeletingProjectId(null);
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
            <CardTitle>{editingProjectId ? "Edit project" : "Create project"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleProjectSubmit}>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Progress (%)</label>
                  <Input name="progress" type="number" min="0" max="100" value={form.progress} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start date</label>
                  <Input name="start_date" type="date" value={form.start_date} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Deadline</label>
                  <Input name="deadline" type="date" value={form.deadline} onChange={handleChange} />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1 text-white" disabled={loading}>{editingProjectId ? "Save project changes" : "Create project"}</Button>
                {editingProjectId && <Button type="button" variant="outline" onClick={() => { setEditingProjectId(null); setForm(defaultValues); }}>Cancel</Button>}
              </div>
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
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">{project.status}</span>
                      <Button type="button" size="sm" variant="outline" onClick={() => editProject(project)}>Edit</Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => setProjectToDelete(project)}
                        disabled={deletingProjectId === (project.projects_id || project.id)}
                      >
                        {deletingProjectId === (project.projects_id || project.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        <span className="sr-only">Delete {project.title}</span>
                      </Button>
                    </div>
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

      <AlertDialog open={Boolean(projectToDelete)} onOpenChange={(open) => { if (!open && !deletingProjectId) setProjectToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes {projectToDelete?.title || "this project"} and its associated project data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(deletingProjectId)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={Boolean(deletingProjectId)}
              onClick={(event) => {
                event.preventDefault();
                void confirmProjectDelete();
              }}
            >
              {deletingProjectId && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {deletingProjectId ? "Deleting..." : "Delete project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminProjects;
