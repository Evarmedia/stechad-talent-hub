import { useRef, useState } from "react";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useRemoteData } from "@/hooks/useRemoteData";
import { useToast } from "@/hooks/use-toast";
import { can } from "@/lib/permissions";
import { getErrorMessage } from "@/lib/errors";
import apiService from "@/services/apiService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import ServerDataState from "@/components/ServerDataState";

type Project = { projects_id: string; created_by_user_id?: string; title: string; description?: string; status: string; priority: string; deadline?: string | null };
const emptyForm = () => ({ title: "", description: "", priority: "medium", deadline: "" });
const deletable = (project: Project) => ["planning", "on_hold", "cancelled"].includes(project.status);

export default function CreatedProjects() {
  const { user } = useAuthContext();
  const remote = useRemoteData<{ projects: Project[] }>("projects", { created_by_me: true });
  const { toast } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const owns = (project: Project) => can(user, "create_projects") && project.created_by_user_id === user?.user_id;
  const reset = () => { setEditing(null); setForm(emptyForm()); setError(""); };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy || !can(user, "create_projects") || (editing && !owns(editing))) return;
    setBusy(true); setError("");
    try {
      const payload = { ...form, deadline: form.deadline || null };
      if (editing) await apiService.put("projects", editing.projects_id, payload);
      else await apiService.post("projects", payload);
      toast({ title: editing ? "Project updated" : "Project created" });
      reset(); remote.reload();
    } catch (cause) { setError(getErrorMessage(cause)); }
    finally { setBusy(false); }
  };
  const remove = async () => {
    if (!deleting || busy || !owns(deleting) || !deletable(deleting)) return;
    setBusy(true); setDeleteError("");
    try {
      await apiService.delete("projects", deleting.projects_id);
      if (editing?.projects_id === deleting.projects_id) reset();
      setDeleting(null); remote.reload(); toast({ title: "Project deleted" });
    } catch (cause) { setDeleteError(getErrorMessage(cause)); }
    finally { setBusy(false); }
  };
  return <div className="space-y-6 p-4 md:p-8">
    <h1 className="text-2xl font-bold text-primary">Create projects</h1>
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <Card><CardHeader><CardTitle>{editing ? "Edit project" : "New project"}</CardTitle></CardHeader><CardContent>
        <form ref={formRef} className="space-y-4" onSubmit={(event) => void submit(event)}>
          <div><Label htmlFor="project-title">Title</Label><Input id="project-title" required disabled={busy} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></div>
          <div><Label htmlFor="project-description">Description</Label><Textarea id="project-description" disabled={busy} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></div>
          <div><Label htmlFor="project-priority">Priority</Label><select id="project-priority" disabled={busy} className="w-full p-2 text-sm" value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>{["low", "medium", "high", "critical"].map((priority) => <option key={priority}>{priority}</option>)}</select></div>
          <div><Label htmlFor="project-deadline">Deadline</Label><Input id="project-deadline" type="date" disabled={busy} value={form.deadline} onChange={(event) => setForm({ ...form, deadline: event.target.value })} /></div>
          {!editing && <p className="text-sm text-muted-foreground">The project will start in planning{user?.role === "project_manager" ? " and be assigned to you." : " and remain unassigned until a manager assigns it."}</p>}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <div className="flex flex-wrap gap-2"><Button disabled={busy || !form.title.trim() || !can(user, "create_projects")}>{busy ? "Saving…" : editing ? "Save changes" : "Create project"}</Button>{editing && <Button type="button" variant="outline" disabled={busy} onClick={reset}>Cancel editing</Button>}</div>
        </form>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Your created projects</CardTitle></CardHeader><CardContent>
        {remote.loading || remote.error ? <ServerDataState title="Created projects" error={remote.error} onRetry={remote.reload} /> : <div className="space-y-3">{remote.data?.projects.map((project) => <article key={project.projects_id} className="space-y-3 rounded-md border p-4">
          <div><h2 className="break-words font-semibold">{project.title}</h2><p className="mt-1 whitespace-pre-wrap break-words text-sm text-muted-foreground">{project.description}</p><p className="mt-2 text-xs capitalize">{project.status.replace(/_/g, " ")} · {project.priority} priority{project.deadline ? ` · Due ${project.deadline.slice(0, 10)}` : ""}</p></div>
          {owns(project) && <div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" disabled={busy} onClick={() => { setEditing(project); setForm({ title: project.title, description: project.description || "", priority: project.priority, deadline: project.deadline?.slice(0, 10) || "" }); setError(""); formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); }}>Edit</Button><Button variant="destructive" size="sm" disabled={busy || !deletable(project)} onClick={() => { setDeleting(project); setDeleteError(""); }}>Delete</Button></div>}
          {!deletable(project) && <p className="text-xs text-muted-foreground">Deletion is available only while planning, on hold, or cancelled.</p>}
        </article>)}{!remote.data?.projects.length && <p className="text-sm text-muted-foreground">You have not created any projects yet.</p>}</div>}
      </CardContent></Card>
    </div>
    <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && !busy && setDeleting(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete project?</AlertDialogTitle><AlertDialogDescription>Delete “{deleting?.title}”? This permanently removes the project.</AlertDialogDescription></AlertDialogHeader>{deleteError && <p role="alert" className="text-sm text-destructive">{deleteError}</p>}<AlertDialogFooter><AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel><AlertDialogAction disabled={busy} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={(event) => { event.preventDefault(); void remove(); }}>{busy ? "Deleting…" : "Delete project"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>;
}
