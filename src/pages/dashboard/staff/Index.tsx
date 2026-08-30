import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/apiService";
import { CalendarDays, CheckCircle2, Clock3, DollarSign, MapPin, ReceiptText, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const StaffDashboard = () => {
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [workLog, setWorkLog] = useState("");
  const [busy, setBusy] = useState(false);

  const loadDashboard = async () => {
    try {
      const response = await apiService.get("staff/dashboard");
      setData(response?.data || response);
    } catch (error: any) {
      toast({ title: "Could not load dashboard", description: error.message, variant: "destructive" });
    }
  };

  useEffect(() => { loadDashboard(); }, []);

  const getLocation = () => new Promise<Record<string, number>>((resolve) => {
    if (!data?.user?.locationSharingEnabled || !navigator.geolocation) return resolve({});
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy }),
      () => resolve({}),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  });

  const clockIn = async () => {
    setBusy(true);
    try {
      await apiService.post("staff/attendance/clock-in", await getLocation());
      toast({ title: "Clocked in" });
      await loadDashboard();
    } catch (error: any) {
      toast({ title: "Clock-in failed", description: error.message, variant: "destructive" });
    } finally { setBusy(false); }
  };

  const clockOut = async () => {
    if (!workLog.trim()) {
      toast({ title: "Daily summary required", description: "Record what you completed before clocking out.", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      await apiService.post("staff/attendance/clock-out", { work_log: workLog, ...(await getLocation()) });
      toast({ title: "Clocked out", description: "Your daily work log has been saved." });
      setWorkLog("");
      await loadDashboard();
    } catch (error: any) {
      toast({ title: "Clock-out failed", description: error.message, variant: "destructive" });
    } finally { setBusy(false); }
  };

  const setLocationSharing = async (enabled: boolean) => {
    try {
      await apiService.putNoId("staff/location-sharing", { enabled });
      setData((current: any) => ({ ...current, user: { ...current.user, locationSharingEnabled: enabled } }));
      toast({ title: enabled ? "Location sharing enabled" : "Location sharing disabled", description: "Location is only captured while you are clocked in." });
    } catch (error: any) {
      toast({ title: "Could not update location consent", description: error.message, variant: "destructive" });
    }
  };

  const isClockedIn = Boolean(data?.attendanceSummary?.today?.isOpen);
  const stats = [
    { label: "Attendance", value: data?.summary?.attendance || "0%", icon: Clock3 },
    { label: "Leave balance", value: data?.summary?.leaveBalance || "0 days", icon: CalendarDays },
    { label: "Expenses", value: `$${Number(data?.summary?.expenseTotal || 0).toLocaleString()}`, icon: DollarSign },
    { label: "KPI progress", value: data?.summary?.kpiProgress || "0%", icon: TrendingUp },
  ];

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div><p className="text-sm uppercase tracking-[0.2em] text-primary/80">STECHAD People</p><h1 className="text-2xl font-bold text-primary">Welcome, {data?.user?.name || "Staff member"}</h1></div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays className="w-4 h-4" />Today: {data?.user?.today || new Date().toLocaleDateString()}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">{stats.map((stat) => <Card key={stat.label}><CardContent className="p-4 flex items-center justify-between"><div><p className="text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</p><p className="text-2xl font-bold text-primary mt-2">{stat.value}</p></div><div className="rounded-full bg-primary/10 p-2 text-primary"><stat.icon className="w-5 h-5" /></div></CardContent></Card>)}</div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2"><CardHeader><CardTitle className="flex items-center justify-between"><span>Attendance</span>{isClockedIn ? <Button disabled={busy} variant="outline" onClick={clockOut}>Clock out</Button> : <Button disabled={busy || Boolean(data?.attendanceSummary?.today)} onClick={clockIn}>{data?.attendanceSummary?.today ? "Completed today" : "Clock in"}</Button>}</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border bg-red-50 p-3"><div><p className="text-sm text-muted-foreground">Current status</p><p className="font-semibold text-primary">{data?.attendanceSummary?.currentStatus || "Not clocked in"}</p></div><CheckCircle2 className={`w-5 h-5 ${isClockedIn ? "text-success" : "text-muted-foreground"}`} /></div>
          {isClockedIn && <div><label className="mb-2 block text-sm font-medium">Daily work summary</label><Textarea className="min-h-[110px]" placeholder="Summarize the work completed today..." value={workLog} onChange={(event) => setWorkLog(event.target.value)} /><p className="mt-2 text-xs text-muted-foreground">This summary is required before clock-out.</p></div>}
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center justify-between"><span>Location consent</span><Switch checked={Boolean(data?.user?.locationSharingEnabled)} onCheckedChange={setLocationSharing} /></CardTitle></CardHeader><CardContent><div className="flex items-start gap-3 rounded-lg border bg-slate-50 p-3"><MapPin className="w-5 h-5 text-primary" /><p className="text-sm text-muted-foreground">{data?.user?.locationSharingEnabled ? "Your location may be captured only during an active work session." : "Location sharing is off. No coordinates are collected."}</p></div></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle className="flex items-center justify-between">Recent leave <Button asChild size="sm" variant="outline"><Link to="/dashboard/staff/leave">Manage leave</Link></Button></CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Dates</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{(data?.leave || []).map((item: any) => <TableRow key={item.id}><TableCell>{item.type}</TableCell><TableCell>{item.dates}</TableCell><TableCell><Badge variant={item.status === "Approved" ? "default" : item.status === "Rejected" ? "destructive" : "secondary"}>{item.status}</Badge></TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center justify-between"><span className="flex items-center gap-2"><ReceiptText className="w-5 h-5" />Recent expenses</span><Button asChild size="sm" variant="outline"><Link to="/dashboard/staff/expenses">Manage expenses</Link></Button></CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Category</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{(data?.expenses || []).map((item: any) => <TableRow key={item.id}><TableCell>{item.category}</TableCell><TableCell>{item.currency} {item.amount.toLocaleString()}</TableCell><TableCell><Badge variant={item.status === "Approved" || item.status === "Receipt Verified" ? "default" : "secondary"}>{item.status}</Badge></TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle>Upcoming holidays</CardTitle></CardHeader><CardContent className="space-y-3">{(data?.holidays || []).map((item: any) => <div key={item.holiday_id} className="flex items-center justify-between rounded-lg border p-3"><div><p className="font-medium">{item.name}</p><p className="text-sm text-muted-foreground">{item.date}</p></div><Badge variant="outline">{item.region || item.type}</Badge></div>)}</CardContent></Card>
        <Card><CardHeader><CardTitle>KPI & appraisal tracker</CardTitle></CardHeader><CardContent className="space-y-4">{(data?.kpis || []).map((item: any) => <div key={item.id} className="rounded-lg border p-4"><div className="mb-2 flex justify-between"><p className="font-medium">{item.title}</p><Badge variant="outline">{item.review}</Badge></div><p className="mb-3 text-sm text-muted-foreground">{item.target}</p><Progress value={item.progress} /><p className="mt-2 text-right text-xs">{item.progress}%{item.score !== null ? ` · appraisal ${item.score}` : ""}</p></div>)}</CardContent></Card>
      </div>
    </div>
  );
};

export default StaffDashboard;
