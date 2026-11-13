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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/apiService";
import { Loader2, Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type Role = {
  role_id: string;
  role_key: string;
  name: string;
  description?: string | null;
  is_system: boolean;
};

const emptyForm = { name: "", role_key: "", description: "" };

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") return error.message;
  return "An unexpected error occurred.";
};

const AdminRoles = () => {
  const { toast } = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null);

  const loadRoles = useCallback(async () => {
    try {
      const response = await apiService.get("admin/roles");
      setRoles(response?.data || response || []);
    } catch (error) {
      toast({ title: "Could not load roles", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadRoles();
  }, [loadRoles]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingRole(null);
  };

  const startEditing = (role: Role) => {
    if (role.is_system) return;
    setEditingRole(role);
    setForm({
      name: role.name,
      role_key: role.role_key,
      description: role.description || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitRole = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim()) {
      toast({ title: "Role name required", variant: "destructive" });
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      ...(form.role_key.trim() ? { role_key: form.role_key.trim() } : {}),
    };

    setSaving(true);
    try {
      if (editingRole) await apiService.put("admin/roles", editingRole.role_id, payload);
      else await apiService.post("admin/roles", payload);

      toast({
        title: editingRole ? "Role updated" : "Role created",
        description: editingRole ? "The custom role changes have been saved." : "The new custom role is ready to use.",
      });
      resetForm();
      await loadRoles();
    } catch (error) {
      toast({ title: editingRole ? "Could not update role" : "Could not create role", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const deleteRole = async () => {
    if (!roleToDelete) return;
    setDeletingRoleId(roleToDelete.role_id);
    try {
      await apiService.delete("admin/roles", roleToDelete.role_id);
      toast({ title: "Role deleted", description: `${roleToDelete.name} has been deleted.` });
      if (editingRole?.role_id === roleToDelete.role_id) resetForm();
      setRoleToDelete(null);
      await loadRoles();
    } catch (error) {
      toast({ title: "Could not delete role", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setDeletingRoleId(null);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-primary/80">Access control</p>
        <h1 className="text-2xl font-bold text-primary">Roles</h1>
        <p className="mt-1 text-sm text-muted-foreground">Create and manage custom roles. Seeded system roles are protected from changes.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {editingRole ? <Pencil className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {editingRole ? "Edit custom role" : "Create custom role"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={submitRole}>
              <div className="space-y-2">
                <label htmlFor="role-name" className="text-sm font-medium">Role name</label>
                <Input
                  id="role-name"
                  required
                  maxLength={100}
                  placeholder="Finance Reviewer"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="role-key" className="text-sm font-medium">Role key</label>
                <Input
                  id="role-key"
                  maxLength={64}
                  placeholder="Generated from the role name"
                  value={form.role_key}
                  onChange={(event) => setForm((current) => ({ ...current, role_key: event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_") }))}
                  disabled={saving}
                />
                <p className="text-xs text-muted-foreground">Use lowercase letters, numbers, and underscores. Leave blank to generate it.</p>
              </div>
              <div className="space-y-2">
                <label htmlFor="role-description" className="text-sm font-medium">Description</label>
                <Textarea
                  id="role-description"
                  className="min-h-[100px]"
                  placeholder="Describe what this role is used for"
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  disabled={saving}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {saving ? "Saving..." : editingRole ? "Save role" : "Create role"}
                </Button>
                {editingRole && <Button type="button" variant="outline" onClick={resetForm} disabled={saving}>Cancel</Button>}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" />Available roles</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading roles...
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.role_id}>
                      <TableCell>
                        <p className="font-medium">{role.name}</p>
                        <p className="max-w-sm text-xs text-muted-foreground">{role.description || "No description"}</p>
                      </TableCell>
                      <TableCell><code className="rounded bg-muted px-2 py-1 text-xs">{role.role_key}</code></TableCell>
                      <TableCell><Badge variant={role.is_system ? "secondary" : "outline"}>{role.is_system ? "System" : "Custom"}</Badge></TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button type="button" size="icon" variant="outline" onClick={() => startEditing(role)} disabled={role.is_system || saving} title={role.is_system ? "System roles cannot be edited" : `Edit ${role.name}`}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button type="button" size="icon" variant="destructive" onClick={() => setRoleToDelete(role)} disabled={role.is_system || deletingRoleId === role.role_id} title={role.is_system ? "System roles cannot be deleted" : `Delete ${role.name}`}>
                            {deletingRoleId === role.role_id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!roles.length && <TableRow><TableCell colSpan={4} className="py-10 text-center text-muted-foreground">No roles found.</TableCell></TableRow>}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={Boolean(roleToDelete)} onOpenChange={(open) => { if (!open && !deletingRoleId) setRoleToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete custom role?</AlertDialogTitle>
            <AlertDialogDescription>
              {roleToDelete?.name || "This role"} will be permanently deleted. Roles assigned to users or invitations cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(deletingRoleId)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={Boolean(deletingRoleId)}
              onClick={(event) => {
                event.preventDefault();
                void deleteRole();
              }}
            >
              {deletingRoleId && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {deletingRoleId ? "Deleting..." : "Delete role"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminRoles;
