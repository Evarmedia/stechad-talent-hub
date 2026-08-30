import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/hooks/useAuthContext";
import apiService from "@/services/apiService";
import { useEffect, useState } from "react";

const emptyInvite = { first_name: "", last_name: "", email: "", department_id: "", job_title: "", role: "staff" };
const emptyDepartment = { name: "", code: "", description: "", location: "", manager_user_id: "" };
const emptyHoliday = { name: "", date: "", type: "Public holiday", region: "" };
const emptyKpi = { assigned_to_user_id: "", title: "", target: "", review_cycle: "Quarterly", period_start: "", period_end: "", progress: "0" };

const AdminWorkforce = () => {
  const { toast } = useToast();
  const { user } = useAuthContext();
  const [staff, setStaff] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any[]>([]);
  const [zohoMetrics, setZohoMetrics] = useState<any[]>([]);
  const [zohoConfigured, setZohoConfigured] = useState(false);
  const [invite, setInvite] = useState(emptyInvite);
  const [holiday, setHoliday] = useState(emptyHoliday);
  const [department, setDepartment] = useState(emptyDepartment);
  const [kpi, setKpi] = useState(emptyKpi);
  const [editingDepartmentId, setEditingDepartmentId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadWorkforce = async () => {
    try {
      const response = await apiService.get("admin/workforce");
      const payload = response?.data || response;
      setStaff(payload.staff || []);
      setDepartments(payload.departments || []);
      setPermissions(payload.permissions || []);
      setApprovals(payload.approvalsQueue || []);
      setHolidays(payload.holidays || []);
      setKpis(payload.kpiLibrary || []);
      setZohoMetrics(payload.zohoMetrics || []);
      setZohoConfigured(Boolean(payload.zoho?.configured));
    } catch (error: any) {
      toast({ title: "Could not load workforce", description: error.message, variant: "destructive" });
    }
  };

  useEffect(() => { loadWorkforce(); }, []);

  const mutate = async (work: () => Promise<any>, success: string) => {
    setBusy(true);
    try {
      await work();
      toast({ title: success });
      await loadWorkforce();
    } catch (error: any) {
      toast({ title: "Action failed", description: error.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const handleInvite = async (event: React.FormEvent) => {
    event.preventDefault();
    await mutate(() => apiService.post("admin/workforce/invite", { ...invite, department_id: invite.department_id || null }), "Invitation sent");
    setInvite(emptyInvite);
  };

  const updateMember = (memberId: string, updates: Record<string, unknown>) => mutate(
    () => apiService.put("admin/workforce/users", memberId, updates),
    "Staff record updated",
  );

  const manageMemberPermissions = (member: any) => {
    const available = permissions.map((item) => item.key).join(", ");
    const value = window.prompt(`Individual permission keys (comma-separated). Available: ${available}`, (member.permissions || []).join(", "));
    if (value === null) return;
    const workforce_permissions = value.split(",").map((item) => item.trim()).filter(Boolean);
    return updateMember(member.id, { workforce_permissions });
  };

  const handleDepartmentSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = { ...department, manager_user_id: department.manager_user_id || null };
    await mutate(
      () => editingDepartmentId
        ? apiService.put("admin/departments", editingDepartmentId, payload)
        : apiService.post("admin/departments", payload),
      editingDepartmentId ? "Department updated" : "Department created",
    );
    setDepartment(emptyDepartment);
    setEditingDepartmentId(null);
  };

  const editDepartment = (item: any) => {
    setEditingDepartmentId(item.department_id);
    setDepartment({
      name: item.name || "",
      code: item.code || "",
      description: item.description || "",
      location: item.location || "",
      manager_user_id: item.manager_user_id || "",
    });
  };

  const reviewApproval = (item: any, action: string) => {
    const notes = window.prompt(action === "rejected" || action === "disputed" ? "Add feedback for the requester:" : "Optional review notes:", "") || "";
    return mutate(
      () => apiService.put(`admin/workforce/approvals/${item.type}`, item.id, { action, notes }),
      "Approval updated",
    );
  };

  const handleHoliday = async (event: React.FormEvent) => {
    event.preventDefault();
    await mutate(() => apiService.post("admin/holidays", holiday), "Holiday added and staff notified");
    setHoliday(emptyHoliday);
  };

  const handleKpi = async (event: React.FormEvent) => {
    event.preventDefault();
    await mutate(() => apiService.post("admin/kpis", { ...kpi, progress: Number(kpi.progress), period_start: kpi.period_start || null, period_end: kpi.period_end || null }), "KPI assigned");
    setKpi(emptyKpi);
  };

  const editKpi = (item: any) => {
    const progress = window.prompt("Progress (0–100)", String(item.progress ?? 0));
    if (progress === null) return;
    const score = window.prompt("Appraisal score (optional)", item.score === null ? "" : String(item.score));
    return mutate(
      () => apiService.put("admin/kpis", item.id, { progress: Math.min(100, Math.max(0, Number(progress))), appraisal_score: score ? Number(score) : null }),
      "KPI and appraisal updated",
    );
  };

  const setPermission = (permission: any, role: string, value: boolean) => mutate(
    () => apiService.put("admin/role-permissions", permission.id, { [role]: value }),
    "Permission matrix updated",
  );

  return (
    <div className="py-8 max-w-7xl mx-auto px-4">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.2em] text-primary/80">HR & Finance Controls</p>
        <h1 className="text-2xl font-bold text-primary">Workforce operations</h1>
      </div>

      <Tabs defaultValue="people" className="space-y-6">
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="people">People</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
          <TabsTrigger value="holidays">Holidays</TabsTrigger>
          <TabsTrigger value="kpis">KPIs & appraisals</TabsTrigger>
          <TabsTrigger value="zoho">Zoho</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="people">
          <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_0.5fr] gap-6">
            <Card><CardHeader><CardTitle>Staff directory</CardTitle></CardHeader><CardContent>
              <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Department</TableHead><TableHead>Role</TableHead><TableHead>Attendance</TableHead><TableHead>Delegated access</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>{staff.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell><p className="font-medium">{member.name}</p><p className="text-xs text-muted-foreground">{member.email}<br />{member.jobTitle}</p></TableCell>
                    <TableCell><select value={member.departmentId || ""} onChange={(event) => updateMember(member.id, { department_id: event.target.value || null })} className="rounded-md border px-2 py-1 text-sm"><option value="">Unassigned</option>{departments.map((item) => <option key={item.department_id} value={item.department_id}>{item.name}</option>)}</select></TableCell>
                    <TableCell>{member.roleKey === "super_admin" && user?.role !== "super_admin" ? <Badge>Super Admin</Badge> : <select value={member.roleKey} onChange={(event) => updateMember(member.id, { role: event.target.value })} className="rounded-md border px-2 py-1 text-sm">{user?.role === "super_admin" && <option value="super_admin">Super Admin</option>}<option value="admin">Admin</option><option value="project_manager">Project Manager</option><option value="staff">Staff</option></select>}</TableCell>
                    <TableCell><Badge variant="outline">{member.attendance}</Badge></TableCell>
                    <TableCell><Button size="sm" variant="outline" onClick={() => manageMemberPermissions(member)}>{member.permissions?.length || 0} grants</Button></TableCell>
                    <TableCell><Button size="sm" variant={member.status === "Active" ? "outline" : "default"} disabled={busy} onClick={() => updateMember(member.id, { is_active: member.status !== "Active" })}>{member.status}</Button></TableCell>
                  </TableRow>
                ))}</TableBody>
              </Table>
            </CardContent></Card>

            <Card><CardHeader><CardTitle>Invite workforce member</CardTitle></CardHeader><CardContent>
              <form onSubmit={handleInvite} className="space-y-3">
                <div className="grid grid-cols-2 gap-2"><Input required placeholder="First name" value={invite.first_name} onChange={(e) => setInvite((p) => ({ ...p, first_name: e.target.value }))} /><Input placeholder="Last name" value={invite.last_name} onChange={(e) => setInvite((p) => ({ ...p, last_name: e.target.value }))} /></div>
                <Input required type="email" placeholder="Work email" value={invite.email} onChange={(e) => setInvite((p) => ({ ...p, email: e.target.value }))} />
                <Input placeholder="Job title" value={invite.job_title} onChange={(e) => setInvite((p) => ({ ...p, job_title: e.target.value }))} />
                <select value={invite.department_id} onChange={(e) => setInvite((p) => ({ ...p, department_id: e.target.value }))} className="w-full rounded-md border px-3 py-2 text-sm"><option value="">No department</option>{departments.map((item) => <option key={item.department_id} value={item.department_id}>{item.name}</option>)}</select>
                <select value={invite.role} onChange={(e) => setInvite((p) => ({ ...p, role: e.target.value }))} className="w-full rounded-md border px-3 py-2 text-sm">{user?.role === "super_admin" && <option value="super_admin">Super Admin</option>}<option value="admin">Admin</option><option value="project_manager">Project Manager</option><option value="staff">Staff</option></select>
                <Button disabled={busy} type="submit" className="w-full">Send invitation</Button>
              </form>
            </CardContent></Card>
          </div>
        </TabsContent>

        <TabsContent value="departments">
          <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
            <Card><CardHeader><CardTitle>Departments</CardTitle></CardHeader><CardContent>
              <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Code</TableHead><TableHead>Manager</TableHead><TableHead>Members</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>{departments.map((item) => <TableRow key={item.department_id}><TableCell>{item.name}</TableCell><TableCell>{item.code}</TableCell><TableCell>{item.manager ? `${item.manager.first_name || ""} ${item.manager.last_name || ""}`.trim() || item.manager.email : "Unassigned"}</TableCell><TableCell>{item.members?.length || 0}</TableCell><TableCell className="space-x-2"><Button size="sm" variant="outline" onClick={() => editDepartment(item)}>Edit</Button><Button size="sm" variant="destructive" onClick={() => mutate(() => apiService.delete("admin/departments", item.department_id), "Department deleted")}>Delete</Button></TableCell></TableRow>)}</TableBody>
              </Table>
            </CardContent></Card>
            <Card><CardHeader><CardTitle>{editingDepartmentId ? "Edit department" : "Add department"}</CardTitle></CardHeader><CardContent>
              <form onSubmit={handleDepartmentSubmit} className="space-y-3">
                <Input required placeholder="Department name" value={department.name} onChange={(e) => setDepartment((p) => ({ ...p, name: e.target.value }))} />
                <Input required placeholder="Code" value={department.code} onChange={(e) => setDepartment((p) => ({ ...p, code: e.target.value.toUpperCase() }))} />
                <Input placeholder="Location" value={department.location} onChange={(e) => setDepartment((p) => ({ ...p, location: e.target.value }))} />
                <Textarea placeholder="Description" value={department.description} onChange={(e) => setDepartment((p) => ({ ...p, description: e.target.value }))} />
                <select value={department.manager_user_id} onChange={(e) => setDepartment((p) => ({ ...p, manager_user_id: e.target.value }))} className="w-full rounded-md border px-3 py-2 text-sm"><option value="">No department manager</option>{staff.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select>
                <div className="flex gap-2"><Button disabled={busy} className="flex-1" type="submit">{editingDepartmentId ? "Save changes" : "Create department"}</Button>{editingDepartmentId && <Button type="button" variant="outline" onClick={() => { setEditingDepartmentId(null); setDepartment(emptyDepartment); }}>Cancel</Button>}</div>
              </form>
            </CardContent></Card>
          </div>
        </TabsContent>

        <TabsContent value="approvals"><Card><CardHeader><CardTitle>Live approvals queue</CardTitle></CardHeader><CardContent>
          <Table><TableHeader><TableRow><TableHead>Request</TableHead><TableHead>Owner</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>{approvals.map((item) => <TableRow key={`${item.type}-${item.id}`}><TableCell>{item.item}</TableCell><TableCell>{item.owner}</TableCell><TableCell className="capitalize">{item.type}</TableCell><TableCell><Badge variant="secondary">{item.status}</Badge></TableCell><TableCell className="space-x-2">
              {item.type === "expense" && item.status.startsWith("Approved")
                ? <Button size="sm" onClick={() => reviewApproval(item, "receipt_verified")}>Verify receipt</Button>
                : item.type === "invoice" && item.status === "Approved"
                  ? <Button size="sm" onClick={() => reviewApproval(item, "accounts_approved")}>Accounts approve & sync</Button>
                  : <Button size="sm" onClick={() => reviewApproval(item, "approved")}>Approve</Button>}
              <Button size="sm" variant="destructive" onClick={() => reviewApproval(item, item.type === "invoice" ? "disputed" : "rejected")}>{item.type === "invoice" ? "Dispute" : "Reject"}</Button>
            </TableCell></TableRow>)}</TableBody>
          </Table>
          {!approvals.length && <p className="py-8 text-center text-muted-foreground">There are no open approvals.</p>}
        </CardContent></Card></TabsContent>

        <TabsContent value="holidays"><div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
          <Card><CardHeader><CardTitle>Company holiday calendar</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Date</TableHead><TableHead>Scope</TableHead><TableHead /></TableRow></TableHeader><TableBody>{holidays.map((item) => <TableRow key={item.holiday_id}><TableCell>{item.name}</TableCell><TableCell>{item.date}</TableCell><TableCell>{item.region || item.type}</TableCell><TableCell><Button size="sm" variant="destructive" onClick={() => mutate(() => apiService.delete("admin/holidays", item.holiday_id), "Holiday deleted")}>Delete</Button></TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
          <Card><CardHeader><CardTitle>Add holiday</CardTitle></CardHeader><CardContent><form onSubmit={handleHoliday} className="space-y-3"><Input required placeholder="Holiday name" value={holiday.name} onChange={(e) => setHoliday((p) => ({ ...p, name: e.target.value }))} /><Input required type="date" value={holiday.date} onChange={(e) => setHoliday((p) => ({ ...p, date: e.target.value }))} /><select value={holiday.type} onChange={(e) => setHoliday((p) => ({ ...p, type: e.target.value }))} className="w-full rounded-md border px-3 py-2 text-sm"><option>Public holiday</option><option>Regional</option><option>Optional</option></select><Input placeholder="Region (optional)" value={holiday.region} onChange={(e) => setHoliday((p) => ({ ...p, region: e.target.value }))} /><Button className="w-full" disabled={busy}>Save and notify staff</Button></form></CardContent></Card>
        </div></TabsContent>

        <TabsContent value="kpis"><div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
          <Card><CardHeader><CardTitle>KPI and appraisal assignments</CardTitle></CardHeader><CardContent className="space-y-3">{kpis.map((item) => <div key={item.id} className="rounded-lg border p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{item.title}</p><p className="text-sm text-muted-foreground">{item.owner} · {item.review}</p><p className="mt-2 text-sm">Target: {item.target}</p></div><div className="space-x-2"><Button size="sm" variant="outline" onClick={() => editKpi(item)}>Appraise</Button><Button size="sm" variant="destructive" onClick={() => mutate(() => apiService.delete("admin/kpis", item.id), "KPI deleted")}>Delete</Button></div></div><div className="mt-3 h-2 rounded-full bg-red-50"><div className="h-2 rounded-full bg-primary" style={{ width: `${item.progress}%` }} /></div><p className="mt-1 text-right text-xs">{item.progress}%{item.score !== null ? ` · score ${item.score}` : ""}</p></div>)}</CardContent></Card>
          <Card><CardHeader><CardTitle>Assign KPI</CardTitle></CardHeader><CardContent><form onSubmit={handleKpi} className="space-y-3"><select required value={kpi.assigned_to_user_id} onChange={(e) => setKpi((p) => ({ ...p, assigned_to_user_id: e.target.value }))} className="w-full rounded-md border px-3 py-2 text-sm"><option value="">Select staff member</option>{staff.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select><Input required placeholder="KPI title" value={kpi.title} onChange={(e) => setKpi((p) => ({ ...p, title: e.target.value }))} /><Textarea required placeholder="Target and success criteria" value={kpi.target} onChange={(e) => setKpi((p) => ({ ...p, target: e.target.value }))} /><select value={kpi.review_cycle} onChange={(e) => setKpi((p) => ({ ...p, review_cycle: e.target.value }))} className="w-full rounded-md border px-3 py-2 text-sm"><option>Monthly</option><option>Quarterly</option><option>Annual</option></select><div className="grid grid-cols-2 gap-2"><Input type="date" value={kpi.period_start} onChange={(e) => setKpi((p) => ({ ...p, period_start: e.target.value }))} /><Input type="date" value={kpi.period_end} onChange={(e) => setKpi((p) => ({ ...p, period_end: e.target.value }))} /></div><Button className="w-full" disabled={busy}>Assign KPI</Button></form></CardContent></Card>
        </div></TabsContent>

        <TabsContent value="zoho"><div className="space-y-4"><div className="flex items-center gap-2"><Badge variant={zohoConfigured ? "default" : "secondary"}>{zohoConfigured ? "Zoho configured" : "Zoho credentials required"}</Badge><span className="text-sm text-muted-foreground">Operational cards remain live from STECHAD Hub.</span></div><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">{zohoMetrics.map((metric) => <Card key={metric.label}><CardContent className="p-4"><p className="text-sm text-muted-foreground">{metric.label}</p><p className="mt-2 text-3xl font-bold text-primary">{metric.value}</p><p className="mt-2 text-sm text-success">{metric.delta}</p></CardContent></Card>)}</div></div></TabsContent>

        <TabsContent value="permissions"><Card><CardHeader><CardTitle>Role permissions</CardTitle></CardHeader><CardContent><p className="mb-4 text-sm text-muted-foreground">This matrix is intentionally isolated to this Permissions tab. Super Admin access cannot be disabled.{user?.role !== "super_admin" ? " Only a super admin can change the matrix." : ""}</p><Table><TableHeader><TableRow><TableHead>Permission</TableHead><TableHead>Super Admin</TableHead><TableHead>Admin</TableHead><TableHead>Project Manager</TableHead><TableHead>Staff</TableHead></TableRow></TableHeader><TableBody>{permissions.map((item) => <TableRow key={item.id}><TableCell>{item.name}</TableCell><TableCell><Switch checked disabled /></TableCell>{["admin", "project_manager", "staff"].map((role) => <TableCell key={role}><Switch disabled={user?.role !== "super_admin"} checked={Boolean(item[role])} onCheckedChange={(value) => setPermission(item, role, value)} /></TableCell>)}</TableRow>)}</TableBody></Table></CardContent></Card></TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminWorkforce;
