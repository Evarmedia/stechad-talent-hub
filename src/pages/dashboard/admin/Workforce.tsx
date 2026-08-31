import ReviewActionDialog from "@/components/ReviewActionDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/hooks/useAuthContext";
import apiService from "@/services/apiService";
import { ChevronDown, MapPin } from "lucide-react";
import { useEffect, useState } from "react";

const emptyInvite = { first_name: "", last_name: "", email: "", department_id: "", job_title: "", role: "staff" };
const emptyDepartment = { name: "", code: "", description: "", location: "", manager_user_id: "" };
const emptyHoliday = { name: "", date: "", type: "Public holiday", region: "" };
const createCriterion = () => ({ id: globalThis.crypto?.randomUUID?.() || `criterion-${Date.now()}-${Math.random()}`, title: "" });
const createEmptyKpi = () => ({ assigned_to_user_id: "", title: "", description: "", review_cycle: "Monthly", criteria: [createCriterion()] });

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
  const [kpi, setKpi] = useState(createEmptyKpi);
  const [editingKpiId, setEditingKpiId] = useState<string | null>(null);
  const [editingDepartmentId, setEditingDepartmentId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [permissionDialog, setPermissionDialog] = useState<any>(null);
  const [permissionValue, setPermissionValue] = useState<string[]>([]);
  const [approvalDialog, setApprovalDialog] = useState<{ item: any; action: string } | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [appraisalDialog, setAppraisalDialog] = useState<any>(null);
  const [appraisal, setAppraisal] = useState<{ scores: Record<string, string>; notes: string }>({ scores: {}, notes: "" });

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
      const result = await work();
      if (success) toast({ title: success });
      await loadWorkforce();
      return result || true;
    } catch (error: any) {
      toast({ title: "Action failed", description: error.message, variant: "destructive" });
      return false;
    } finally {
      setBusy(false);
    }
  };

  const handleInvite = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await mutate(() => apiService.post("admin/workforce/invite", { ...invite, department_id: invite.department_id || null }), "");
    if (result) {
      toast({ title: "Invitation sent", description: result?.data?.employee_id ? `Employee ID ${result.data.employee_id} has been reserved.` : undefined });
      setInvite(emptyInvite);
    }
  };

  const updateMember = (memberId: string, updates: Record<string, unknown>) => mutate(
    () => apiService.put("admin/workforce/users", memberId, updates),
    "Staff record updated",
  );

  const manageMemberPermissions = (member: any) => {
    setPermissionValue(member.permissions || []);
    setPermissionDialog(member);
  };

  const saveMemberPermissions = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!permissionDialog) return;
    const saved = await updateMember(permissionDialog.id, { workforce_permissions: permissionValue });
    if (saved) setPermissionDialog(null);
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
    setReviewNotes("");
    setApprovalDialog({ item, action });
  };

  const submitApprovalReview = async () => {
    if (!approvalDialog) return;
    const saved = await mutate(
      () => apiService.put(`admin/workforce/approvals/${approvalDialog.item.type}`, approvalDialog.item.id, { action: approvalDialog.action, notes: reviewNotes.trim() }),
      "Approval updated",
    );
    if (saved) setApprovalDialog(null);
  };

  const handleHoliday = async (event: React.FormEvent) => {
    event.preventDefault();
    await mutate(() => apiService.post("admin/holidays", holiday), "Holiday added and staff notified");
    setHoliday(emptyHoliday);
  };

  const handleKpi = async (event: React.FormEvent) => {
    event.preventDefault();
    const criteria = kpi.criteria.map((criterion) => ({ ...criterion, title: criterion.title.trim() })).filter((criterion) => criterion.title);
    if (!criteria.length) return toast({ title: "Success criteria required", description: "Add at least one KPI line item.", variant: "destructive" });
    const payload = { ...kpi, title: kpi.title.trim(), description: kpi.description.trim(), criteria };
    const saved = await mutate(
      () => editingKpiId ? apiService.put("admin/kpis", editingKpiId, payload) : apiService.post("admin/kpis", payload),
      editingKpiId ? "KPI assignment updated" : "Reusable KPI assigned",
    );
    if (saved) {
      setKpi(createEmptyKpi());
      setEditingKpiId(null);
    }
  };

  const editKpiTemplate = (item: any) => {
    setEditingKpiId(item.id);
    setKpi({
      assigned_to_user_id: item.assignedToUserId,
      title: item.title || "",
      description: item.description || "",
      review_cycle: item.review || "Monthly",
      criteria: item.criteria?.length ? item.criteria : [createCriterion()],
    });
  };

  const editKpi = (item: any) => {
    const currentScores = Object.fromEntries((item.currentAppraisal?.criteriaScores || []).map((score: any) => [score.criterionId, String(score.score)]));
    setAppraisal({ scores: currentScores, notes: item.currentAppraisal?.notes || "" });
    setAppraisalDialog(item);
  };

  const saveKpiAppraisal = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!appraisalDialog) return;
    const saved = await mutate(
      () => apiService.post(`admin/kpis/${appraisalDialog.id}/appraisals`, {
        criteria_scores: appraisalDialog.criteria.map((criterion: any) => ({ criterion_id: criterion.id, score: Number(appraisal.scores[criterion.id]) })),
        notes: appraisal.notes.trim(),
      }),
      appraisalDialog.currentAppraisal ? "Periodic appraisal updated" : "Periodic appraisal recorded",
    );
    if (saved) setAppraisalDialog(null);
  };

  const appraisalScores = appraisalDialog?.criteria
    ?.map((criterion: any) => Number(appraisal.scores[criterion.id]))
    .filter((score: number) => Number.isFinite(score)) || [];
  const calculatedAppraisalScore = appraisalDialog?.criteria?.length && appraisalScores.length === appraisalDialog.criteria.length
    ? (appraisalScores.reduce((sum: number, score: number) => sum + score, 0) / appraisalScores.length).toFixed(1)
    : null;

  const setPermission = (permission: any, role: string, value: boolean) => mutate(
    () => apiService.put("admin/role-permissions", permission.id, { [role]: value }),
    "Permission matrix updated",
  );

  return (
    <div className="p-4 md:p-8">
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
              <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Department</TableHead><TableHead>Role</TableHead><TableHead>Location</TableHead><TableHead>Attendance</TableHead><TableHead>Delegated access</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>{staff.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell><p className="font-medium">{member.name}</p><p className="text-xs text-muted-foreground">{member.email}<br />{member.employeeId ? `${member.employeeId} · ` : ""}{member.jobTitle}</p></TableCell>
                    <TableCell><select value={member.departmentId || ""} onChange={(event) => updateMember(member.id, { department_id: event.target.value || null })} className="rounded-md border px-2 py-1 text-sm"><option value="">Unassigned</option>{departments.map((item) => <option key={item.department_id} value={item.department_id}>{item.name}</option>)}</select></TableCell>
                    <TableCell>{member.roleKey === "super_admin" ? <Badge>Super Admin</Badge> : <select value={member.roleKey} onChange={(event) => updateMember(member.id, { role: event.target.value })} className="rounded-md border px-2 py-1 text-sm"><option value="admin">Admin</option><option value="project_manager">Project Manager</option><option value="staff">Staff</option></select>}</TableCell>
                    <TableCell><span className={`inline-flex items-center gap-1 text-sm ${member.browserLocation ? "text-primary" : "text-muted-foreground"}`} title={member.browserLocation?.formattedAddress || undefined}><MapPin className="h-3.5 w-3.5" />{member.location}</span></TableCell>
                    <TableCell><Badge variant="outline">{member.attendance}</Badge></TableCell>
                    <TableCell><Button size="sm" variant="outline" onClick={() => manageMemberPermissions(member)}>{member.permissions?.length || 0} grants</Button></TableCell>
                    <TableCell><Button size="sm" variant={member.status === "Active" ? "outline" : "default"} disabled={busy || member.roleKey === "super_admin"} onClick={() => updateMember(member.id, { is_active: member.status !== "Active" })}>{member.status}</Button></TableCell>
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
                <select value={invite.role} onChange={(e) => setInvite((p) => ({ ...p, role: e.target.value }))} className="w-full rounded-md border px-3 py-2 text-sm"><option value="admin">Admin</option><option value="project_manager">Project Manager</option><option value="staff">Staff</option></select>
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
              {item.type === "invoice" && item.status === "Accounts Approved"
                ? <Button size="sm" variant="outline" disabled>Accounts approved</Button>
                : item.type === "expense" && item.status.startsWith("Approved")
                ? <Button size="sm" onClick={() => reviewApproval(item, "receipt_verified")}>Verify receipt</Button>
                : item.type === "invoice" && item.status === "Approved"
                  ? <Button size="sm" onClick={() => reviewApproval(item, "accounts_approved")}>Accounts approve & sync</Button>
                  : <Button size="sm" onClick={() => reviewApproval(item, "approved")}>Approve</Button>}
              {!(item.type === "invoice" && item.status === "Accounts Approved") && <Button size="sm" variant="destructive" onClick={() => reviewApproval(item, item.type === "invoice" ? "disputed" : "rejected")}>{item.type === "invoice" ? "Dispute" : "Reject"}</Button>}
            </TableCell></TableRow>)}</TableBody>
          </Table>
          {!approvals.length && <p className="py-8 text-center text-muted-foreground">There are no open approvals.</p>}
        </CardContent></Card></TabsContent>

        <TabsContent value="holidays"><div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
          <Card><CardHeader><CardTitle>Company holiday calendar</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Date</TableHead><TableHead>Scope</TableHead><TableHead /></TableRow></TableHeader><TableBody>{holidays.map((item) => <TableRow key={item.holiday_id}><TableCell>{item.name}</TableCell><TableCell>{item.date}</TableCell><TableCell>{item.region || item.type}</TableCell><TableCell><Button size="sm" variant="destructive" onClick={() => mutate(() => apiService.delete("admin/holidays", item.holiday_id), "Holiday deleted")}>Delete</Button></TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
          <Card><CardHeader><CardTitle>Add holiday</CardTitle></CardHeader><CardContent><form onSubmit={handleHoliday} className="space-y-3"><Input required placeholder="Holiday name" value={holiday.name} onChange={(e) => setHoliday((p) => ({ ...p, name: e.target.value }))} /><Input required type="date" value={holiday.date} onChange={(e) => setHoliday((p) => ({ ...p, date: e.target.value }))} /><select value={holiday.type} onChange={(e) => setHoliday((p) => ({ ...p, type: e.target.value }))} className="w-full rounded-md border px-3 py-2 text-sm"><option>Public holiday</option><option>Regional</option><option>Optional</option></select><Input placeholder="Region (optional)" value={holiday.region} onChange={(e) => setHoliday((p) => ({ ...p, region: e.target.value }))} /><Button className="w-full" disabled={busy}>Save and notify staff</Button></form></CardContent></Card>
        </div></TabsContent>

        <TabsContent value="kpis"><div className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.75fr] gap-6">
          <Card><CardHeader><CardTitle>KPI and appraisal assignments</CardTitle></CardHeader><CardContent className="space-y-4">
            {kpis.map((item) => <details key={item.id} className="group rounded-lg border bg-card">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-3 p-4 [&::-webkit-details-marker]:hidden">
                <div><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{item.title}</p><Badge variant="outline">{item.review}</Badge><Badge variant={item.currentAppraisal ? "white" : "secondary"}>{item.currentPeriod?.label}: {item.currentAppraisal ? `${item.currentAppraisal.overallScore}%` : "Not scored"}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{item.owner}</p></div>
                <ChevronDown className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <div className="border-t p-4">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div>{item.description && <p className="text-sm">{item.description}</p>}</div><div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => editKpiTemplate(item)}>Edit</Button><Button size="sm" onClick={() => editKpi(item)}>Appraise</Button><Button size="sm" variant="destructive" onClick={() => mutate(() => apiService.delete("admin/kpis", item.id), "KPI deleted")}>Delete</Button></div></div>
                <div className="mt-4 space-y-2">{item.criteria.map((criterion: any, index: number) => {
                  const score = item.currentAppraisal?.criteriaScores?.find((entry: any) => entry.criterionId === criterion.id)?.score;
                  return <div key={criterion.id} className="flex items-center justify-between gap-3 rounded-md bg-muted/50 px-3 py-2 text-sm"><span>{index + 1}. {criterion.title}</span><span className="shrink-0 font-semibold text-primary">{score === undefined ? "—" : `${score}%`}</span></div>;
                })}</div>
                {item.appraisals?.length > 0 && <details className="mt-3"><summary className="cursor-pointer text-sm font-medium text-primary">Score history ({item.appraisals.length})</summary><div className="mt-2 space-y-2">{item.appraisals.map((record: any) => <div key={record.id} className="rounded-md border px-3 py-2 text-sm"><div className="flex justify-between"><span>{record.periodLabel}</span><strong>{record.overallScore}%</strong></div>{record.notes && <p className="mt-1 text-muted-foreground">{record.notes}</p>}</div>)}</div></details>}
              </div>
            </details>)}
            {!kpis.length && <p className="py-8 text-center text-muted-foreground">No reusable KPI assignments yet.</p>}
          </CardContent></Card>
          <Card><CardHeader><CardTitle>{editingKpiId ? "Edit KPI assignment" : "Assign reusable KPI"}</CardTitle></CardHeader><CardContent><form onSubmit={handleKpi} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="kpi-assignee">Staff member</Label><select id="kpi-assignee" required value={kpi.assigned_to_user_id} onChange={(e) => setKpi((p) => ({ ...p, assigned_to_user_id: e.target.value }))} className="w-full rounded-md border px-3 py-2 text-sm"><option value="">Select staff member</option>{staff.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></div>
            <div className="space-y-2"><Label htmlFor="kpi-title">KPI title</Label><Input id="kpi-title" required placeholder="e.g. Customer delivery quality" value={kpi.title} onChange={(e) => setKpi((p) => ({ ...p, title: e.target.value }))} /></div>
            <div className="space-y-2"><Label htmlFor="kpi-description">Description</Label><Textarea id="kpi-description" placeholder="Optional context for this recurring KPI" value={kpi.description} onChange={(e) => setKpi((p) => ({ ...p, description: e.target.value }))} /></div>
            <div className="space-y-2"><Label htmlFor="kpi-cycle">Scoring cycle</Label><select id="kpi-cycle" value={kpi.review_cycle} onChange={(e) => setKpi((p) => ({ ...p, review_cycle: e.target.value }))} className="w-full rounded-md border px-3 py-2 text-sm"><option>Monthly</option><option>Quarterly</option><option>Annual</option></select><p className="text-xs text-muted-foreground">The same assignment is reused and receives a new score each period.</p></div>
            <div className="space-y-3"><div className="flex items-center justify-between"><Label>Target and success criteria</Label><Button type="button" size="sm" variant="outline" onClick={() => setKpi((current) => ({ ...current, criteria: [...current.criteria, createCriterion()] }))}>Add line item</Button></div>
              {kpi.criteria.map((criterion, index) => <div key={criterion.id} className="flex items-center gap-2"><span className="w-6 text-center text-sm text-muted-foreground">{index + 1}</span><Input required value={criterion.title} placeholder="Measurable KPI line item" onChange={(event) => setKpi((current) => ({ ...current, criteria: current.criteria.map((item) => item.id === criterion.id ? { ...item, title: event.target.value } : item) }))} /><Button type="button" size="sm" variant="destructive" disabled={kpi.criteria.length === 1} onClick={() => setKpi((current) => ({ ...current, criteria: current.criteria.filter((item) => item.id !== criterion.id) }))}>Remove</Button></div>)}
            </div>
            <div className="flex gap-2"><Button className="flex-1" disabled={busy}>{editingKpiId ? "Save KPI changes" : "Assign KPI"}</Button>{editingKpiId && <Button type="button" variant="outline" onClick={() => { setEditingKpiId(null); setKpi(createEmptyKpi()); }}>Cancel</Button>}</div>
          </form></CardContent></Card>
        </div></TabsContent>

        <TabsContent value="zoho"><div className="space-y-4"><div className="flex items-center gap-2"><Badge variant={zohoConfigured ? "default" : "secondary"}>{zohoConfigured ? "Zoho configured" : "Zoho credentials required"}</Badge><span className="text-sm text-muted-foreground">Operational cards remain live from STECHAD Hub.</span></div><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">{zohoMetrics.map((metric) => <Card key={metric.label}><CardContent className="p-4"><p className="text-sm text-muted-foreground">{metric.label}</p><p className="mt-2 text-3xl font-bold text-primary">{metric.value}</p><p className="mt-2 text-sm text-success">{metric.delta}</p></CardContent></Card>)}</div></div></TabsContent>

        <TabsContent value="permissions"><Card><CardHeader><CardTitle>Role permissions</CardTitle></CardHeader><CardContent><p className="mb-4 text-sm text-muted-foreground">Admins can configure permissions for Admin, Project Manager, and Staff roles. Super Admin permissions are always enabled and cannot be changed.</p><Table><TableHeader><TableRow><TableHead>Permission</TableHead><TableHead>Super Admin</TableHead><TableHead>Admin</TableHead><TableHead>Project Manager</TableHead><TableHead>Staff</TableHead></TableRow></TableHeader><TableBody>{permissions.map((item) => <TableRow key={item.id}><TableCell>{item.name}</TableCell><TableCell><Switch checked disabled aria-label={`${item.name} for Super Admin`} /></TableCell>{["admin", "project_manager", "staff"].map((role) => <TableCell key={role}><Switch disabled={busy} checked={Boolean(item[role])} onCheckedChange={(value) => setPermission(item, role, value)} aria-label={`${item.name} for ${role.replace("_", " ")}`} /></TableCell>)}</TableRow>)}</TableBody></Table></CardContent></Card></TabsContent>
      </Tabs>

      <Dialog open={Boolean(permissionDialog)} onOpenChange={(open) => !busy && !open && setPermissionDialog(null)}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-xl">
          <DialogHeader>
            <DialogTitle>Manage delegated access</DialogTitle>
            <DialogDescription>Select the individual permissions that should be granted to {permissionDialog?.name} in addition to their role defaults.</DialogDescription>
          </DialogHeader>
          <form className="space-y-5" onSubmit={saveMemberPermissions}>
            <div className="space-y-2">
              <p className="text-sm font-medium">Available permissions</p>
              <div className="max-h-80 space-y-2 overflow-y-auto rounded-lg border bg-muted/30 p-3">
                {permissions.map((permission) => {
                  const selected = permissionValue.includes(permission.key);
                  return <label key={permission.key} className="flex cursor-pointer items-start gap-3 rounded-md border bg-white p-3 transition hover:border-primary/40"><Checkbox checked={selected} onCheckedChange={(checked) => setPermissionValue((current) => checked ? [...current, permission.key] : current.filter((key) => key !== permission.key))} /><span><span className="block text-sm font-medium">{permission.name}</span><code className="text-xs text-muted-foreground">{permission.key}</code></span></label>;
                })}
              </div>
              <p className="text-xs text-muted-foreground">{permissionValue.length} permission{permissionValue.length === 1 ? "" : "s"} selected.</p>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" disabled={busy} onClick={() => setPermissionDialog(null)}>Cancel</Button>
              <Button type="submit" disabled={busy}>{busy ? "Saving..." : "Save permissions"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ReviewActionDialog
        open={Boolean(approvalDialog)}
        action={approvalDialog?.action || ""}
        requestLabel={approvalDialog ? `${approvalDialog.item.owner}: ${approvalDialog.item.item}` : ""}
        notes={reviewNotes}
        busy={busy}
        onNotesChange={setReviewNotes}
        onOpenChange={(open) => !open && setApprovalDialog(null)}
        onConfirm={submitApprovalReview}
      />

      <Dialog open={Boolean(appraisalDialog)} onOpenChange={(open) => !busy && !open && setAppraisalDialog(null)}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{appraisalDialog?.currentAppraisal ? "Update" : "Record"} periodic KPI appraisal</DialogTitle>
            <DialogDescription>{appraisalDialog?.title} · {appraisalDialog?.owner} · {appraisalDialog?.currentPeriod?.label}. Score each KPI line item from 0 to 100.</DialogDescription>
          </DialogHeader>
          <form className="space-y-5" onSubmit={saveKpiAppraisal}>
            <div className="space-y-3">
              {appraisalDialog?.criteria?.map((criterion: any, index: number) => <div key={criterion.id} className="grid grid-cols-[1fr_110px] items-center gap-3 rounded-lg border p-3"><Label htmlFor={`criterion-score-${criterion.id}`} className="leading-5">{index + 1}. {criterion.title}</Label><div className="relative"><Input id={`criterion-score-${criterion.id}`} type="number" min="0" max="100" step="0.1" required value={appraisal.scores[criterion.id] || ""} onChange={(event) => setAppraisal((current) => ({ ...current, scores: { ...current.scores, [criterion.id]: event.target.value } }))} className="pr-7" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span></div></div>)}
            </div>
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4"><p className="text-sm text-muted-foreground">Calculated overall KPI score</p><p className="mt-1 text-3xl font-bold text-primary">{calculatedAppraisalScore === null ? "—" : `${calculatedAppraisalScore}%`}</p><p className="mt-1 text-xs text-muted-foreground">Average of all individual KPI line-item scores.</p></div>
            <div className="space-y-2"><Label htmlFor="appraisal-notes">Appraisal note (optional)</Label><Textarea id="appraisal-notes" className="min-h-[100px]" placeholder="Add context, feedback, or follow-up actions..." value={appraisal.notes} onChange={(event) => setAppraisal((current) => ({ ...current, notes: event.target.value }))} /></div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" disabled={busy} onClick={() => setAppraisalDialog(null)}>Cancel</Button>
              <Button type="submit" disabled={busy || calculatedAppraisalScore === null}>{busy ? "Saving..." : appraisalDialog?.currentAppraisal ? "Update period score" : "Record period score"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminWorkforce;
