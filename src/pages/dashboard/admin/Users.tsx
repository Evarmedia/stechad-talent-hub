import RecordPagination, {
  type Pagination,
} from "@/components/RecordPagination";
import ServerDataState from "@/components/ServerDataState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useRemoteData } from "@/hooks/useRemoteData";
import { getErrorMessage } from "@/lib/errors";
import { roleName } from "@/lib/permissions";
import apiService from "@/services/apiService";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
type Person = {
  user_id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  employee_id?: string;
  role: string;
  role_details?: { name: string };
  workforce_permissions?: string[];
  is_active: boolean;
  deleted_at?: string;
  department?: { name: string };
};
type Directory = {
  users: Person[];
  roles: { role_key: string; name: string }[];
  permissions: { permission_key: string; name: string }[];
  counts: { totalUsers: number; deletedUsers: number };
  pagination: Pagination;
};
const name = (person: Person) =>
  `${person.first_name || ""} ${person.last_name || ""}`.trim() || person.email;
export default function AdminUsers() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("current");
  const [role, setRole] = useState("");
  const [selected, setSelected] = useState<Person | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [grantUser, setGrantUser] = useState<Person | null>(null);
  const [grants, setGrants] = useState<string[]>([]);
  const saveGrants = async () => {
    if (!grantUser) return;
    setBusy(true);
    setError("");
    try {
      await apiService.putNoId(`admin/users/${grantUser.user_id}/permissions`, {
        workforce_permissions: grants,
      });
      setGrantUser(null);
      remote.reload();
      toast({ title: "Individual permissions updated" });
    } catch (cause) {
      setError(getErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  };
  const remote = useRemoteData<Directory>("admin/users", {
    page,
    search,
    status,
    role,
  });
  useEffect(() => {
    window.addEventListener("focus", remote.reload);
    return () => window.removeEventListener("focus", remote.reload);
  }, [remote.reload]);
  const change = (setter: (value: string) => void, value: string) => {
    setter(value);
    setPage(1);
  };
  const mutate = async () => {
    if (!selected) return;
    setBusy(true);
    setError("");
    try {
      if (selected.deleted_at)
        await apiService.post(`admin/users/${selected.user_id}/restore`, {});
      else await apiService.delete("admin/users", selected.user_id);
      toast({
        title: selected.deleted_at
          ? "Account restored. A new login is required."
          : "User deleted. History preserved.",
      });
      setSelected(null);
      remote.reload();
    } catch (cause: unknown) {
      setError(getErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className='space-y-6 p-4 md:p-8'>
      <h1 className='text-2xl font-bold text-primary'>Users</h1>
      <div className='grid gap-4 sm:grid-cols-2'>
        <Card>
          <CardContent className='p-5'>
            <p className='text-sm text-muted-foreground'>Total users</p>
            <p className='text-3xl font-bold'>
              {remote.data?.counts.totalUsers ?? "—"}
            </p>
            <p className='text-xs text-muted-foreground'>
              Includes inactive workforce accounts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-5'>
            <p className='text-sm text-muted-foreground'>Soft-deleted users</p>
            <p className='text-3xl font-bold'>
              {remote.data?.counts.deletedUsers ?? "—"}
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>User directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='mb-4 grid gap-3 sm:grid-cols-3'>
            <Input
              aria-label='Search users'
              placeholder='Search name, email, or Employee ID'
              value={search}
              onChange={(event) => change(setSearch, event.target.value)}
            />
            <select
              aria-label='Account status'
              value={status}
              onChange={(event) => change(setStatus, event.target.value)}
              className='p-2 text-sm'
            >
              {[
                ["current", "All current users"],
                ["active", "Active"],
                ["inactive", "Inactive"],
                ["deleted", "Deleted"],
                ["all", "Current and deleted"],
              ].map(([value, text]) => (
                <option key={value} value={value}>
                  {text}
                </option>
              ))}
            </select>
            <select
              aria-label='User role'
              value={role}
              onChange={(event) => change(setRole, event.target.value)}
              className='p-2 text-sm'
            >
              <option value=''>All roles</option>
              {remote.data?.roles.map((item) => (
                <option key={item.role_key} value={item.role_key}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          {remote.loading || remote.error ? (
            <ServerDataState
              title='User directory'
              error={remote.error}
              onRetry={remote.reload}
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {remote.data?.users.map((person) => (
                    <TableRow key={person.user_id}>
                      <TableCell>
                        <p className='font-medium'>{name(person)}</p>
                        <p className='text-xs text-muted-foreground'>
                          {person.email}
                        </p>
                      </TableCell>
                      <TableCell>
                        {person.employee_id || "Unassigned"}
                      </TableCell>
                      <TableCell>{roleName(person)}</TableCell>
                      <TableCell>
                        {person.department?.name || "Unassigned"}
                      </TableCell>
                      <TableCell>
                        <Badge variant='secondary'>
                          {person.deleted_at
                            ? "Deleted"
                            : person.is_active
                              ? "Active"
                              : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className='flex gap-2'>
                          {/* If a user is an admin do not display permissions and attendance hostory button only, delete button should show */}

                          {!person.deleted_at &&
                            person.role !== "super_admin" && person.role !== "admin" && (
                              <Button
                                size='sm'
                                variant='outline'
                                onClick={() => {
                                  setGrantUser(person);
                                  setGrants(person.workforce_permissions || []);
                                  setError("");
                                }}
                              >
                                Permissions
                              </Button>
                            )}
                            {person.role !== "admin" &&(
                              <Button asChild size='sm' variant='outline'>
                            <Link
                              to={`/admin/users/${person.user_id}/attendance`}
                            >
                              Attendance history
                            </Link>
                          </Button>)}
                          <Button
                            size='sm'
                            variant={
                              person.deleted_at ? "outline" : "destructive"
                            }
                            disabled={
                              person.user_id === user?.user_id ||
                              person.role === "super_admin"
                            }
                            onClick={() => {
                              setSelected(person);
                              setError("");
                            }}
                          >
                            {person.deleted_at ? "Restore" : "Delete"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!remote.data?.users.length && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className='py-10 text-center text-muted-foreground'
                      >
                        No users match these filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <RecordPagination
                page={page}
                onChange={setPage}
                pagination={remote.data?.pagination}
              />
            </>
          )}
        </CardContent>
      </Card>
      <Dialog
        open={Boolean(grantUser)}
        onOpenChange={(open) => !open && !busy && setGrantUser(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Individual permissions</DialogTitle>
            <DialogDescription>
              Additional grants for {grantUser && name(grantUser)}. Removing a
              grant leaves any permission supplied by their role active.
            </DialogDescription>
          </DialogHeader>
          <div className='max-h-[55vh] space-y-3 overflow-y-auto'>
            {remote.data?.permissions.map((permission) => (
              <label
                key={permission.permission_key}
                className='flex items-center gap-3 rounded-md border p-3'
              >
                <Checkbox
                  disabled={busy}
                  checked={grants.includes(permission.permission_key)}
                  onCheckedChange={(checked) =>
                    setGrants((current) =>
                      checked
                        ? [...current, permission.permission_key]
                        : current.filter(
                            (key) => key !== permission.permission_key,
                          ),
                    )
                  }
                />
                <span className='text-sm'>{permission.name}</span>
              </label>
            ))}
          </div>
          {error && (
            <p role='alert' className='text-sm text-destructive'>
              {error}
            </p>
          )}
          <DialogFooter>
            <Button
              variant='outline'
              disabled={busy}
              onClick={() => setGrantUser(null)}
            >
              Cancel
            </Button>
            <Button disabled={busy} onClick={() => void saveGrants()}>
              {busy ? "Saving…" : "Save permissions"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => !open && !busy && setSelected(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selected?.deleted_at ? "Restore account?" : "Delete user?"}
            </DialogTitle>
            <DialogDescription>
              {selected?.deleted_at
                ? `Restore ${selected && name(selected)} with their current relationships and previous active/inactive status. Later reassignments are preserved. They must log in again.`
                : `Soft-delete ${selected && name(selected)} and revoke access. Their history and existing relationships are preserved for restoration. You can reassign their work at any time.`}
            </DialogDescription>
          </DialogHeader>
          {error && (
            <div role='alert' className='space-y-2 text-sm text-destructive'>
              <p>{error}</p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant='outline'
              disabled={busy}
              onClick={() => setSelected(null)}
            >
              Cancel
            </Button>
            <Button
              disabled={busy}
              variant={selected?.deleted_at ? "default" : "destructive"}
              onClick={() => void mutate()}
            >
              {busy
                ? "Saving…"
                : selected?.deleted_at
                  ? "Restore account"
                  : "Delete user"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
