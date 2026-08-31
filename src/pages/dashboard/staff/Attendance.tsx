import AttendanceTimer from "@/components/AttendanceTimer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/apiService";
import { CalendarDays, CheckCircle2, Clock3 } from "lucide-react";
import { useEffect, useState } from "react";

const StaffAttendancePage = () => {
  const { toast } = useToast();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [workLog, setWorkLog] = useState("");
  const [busy, setBusy] = useState(false);

  const loadAttendance = async () => {
    try {
      const response = await apiService.get("staff/attendance");
      const payload = response?.data || response;
      setAttendance(payload.entries || []);
      setSummary(payload.summary || {});
    } catch (error: any) {
      toast({ title: "Could not load attendance", description: error.message, variant: "destructive" });
    }
  };
  useEffect(() => {
    loadAttendance();
    const interval = window.setInterval(loadAttendance, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const submitClock = async (clockOut: boolean) => {
    if (clockOut && !workLog.trim()) return toast({ title: "Daily summary required", variant: "destructive" });
    setBusy(true);
    try {
      await apiService.post(clockOut ? "staff/attendance/clock-out" : "staff/attendance/clock-in", clockOut ? { work_log: workLog } : {});
      toast({ title: clockOut ? "Clocked out" : "Clocked in" });
      setWorkLog("");
      await loadAttendance();
    } catch (error: any) {
      toast({ title: "Attendance action failed", description: error.message, variant: "destructive" });
    } finally { setBusy(false); }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div><p className="text-xs uppercase tracking-[0.2em] text-primary/80">STECHAD People</p><h1 className="text-2xl font-bold text-primary">Attendance</h1></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-5 flex items-center justify-between"><div><p className="text-xs uppercase text-muted-foreground">Current status</p><p className="text-2xl font-bold text-primary mt-2">{summary.currentStatus || "Not clocked in"}</p></div><CheckCircle2 className="w-6 h-6 text-emerald-700" /></CardContent></Card>
        <Card><CardContent className="p-5 flex items-center justify-between"><div><p className="text-xs uppercase text-muted-foreground">This month</p><p className="text-2xl font-bold text-primary mt-2">{summary.attendanceRate || 0}%</p></div><Clock3 className="w-6 h-6 text-primary" /></CardContent></Card>
        <Card><CardContent className="p-5 flex items-center justify-between"><div><p className="text-xs uppercase text-muted-foreground">Days logged</p><p className="text-2xl font-bold text-primary mt-2">{summary.daysLogged || 0}/{summary.expectedDays || 0}</p></div><CalendarDays className="w-6 h-6 text-amber-700" /></CardContent></Card>
      </div>

      <Card><CardHeader><CardTitle>Today&apos;s work session</CardTitle></CardHeader><CardContent className="space-y-4">
        {summary.today?.isOpen ? <><AttendanceTimer active startedAt={summary.today.clockInAt} /><Textarea className="min-h-[100px]" placeholder="Daily work summary required before clock-out" value={workLog} onChange={(event) => setWorkLog(event.target.value)} /><Button disabled={busy} onClick={() => submitClock(true)}>Clock out and save summary</Button></> : <Button disabled={busy || Boolean(summary.today)} onClick={() => submitClock(false)}>{summary.today ? (summary.today.status === "Absent" ? "Marked absent" : "Workday completed") : "Clock in"}</Button>}
      </CardContent></Card>

      <Card><CardHeader><CardTitle>Attendance history</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Clock in</TableHead><TableHead>Clock out</TableHead><TableHead>Total time</TableHead><TableHead>Work log</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{attendance.map((entry) => <TableRow key={entry.id}><TableCell>{entry.date}</TableCell><TableCell>{entry.clockIn || "—"}</TableCell><TableCell>{entry.clockOut || "—"}</TableCell><TableCell className="font-medium">{entry.workedDuration || (entry.isOpen ? "In progress" : "—")}</TableCell><TableCell className="max-w-sm whitespace-normal">{entry.workLog || (entry.status === "Absent" ? "Clock-out missed" : "In progress")}</TableCell><TableCell><Badge variant={entry.status === "Absent" ? "destructive" : entry.status === "Late" ? "secondary" : "white"}>{entry.status}</Badge></TableCell></TableRow>)}</TableBody></Table>{!attendance.length && <p className="py-8 text-center text-muted-foreground">No attendance records yet.</p>}</CardContent></Card>
    </div>
  );
};

export default StaffAttendancePage;
