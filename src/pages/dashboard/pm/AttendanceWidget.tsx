import AttendanceTimer from "@/components/AttendanceTimer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/apiService";
import { Clock3, Loader2, LogIn, LogOut } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

type AttendanceSummary = {
  currentStatus?: string;
  today?: {
    isOpen?: boolean;
    clockInAt?: string | null;
    status?: string;
  } | null;
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") return error.message;
  return "An unexpected error occurred.";
};

const ProjectManagerAttendanceWidget = () => {
  const { toast } = useToast();
  const [summary, setSummary] = useState<AttendanceSummary>({});
  const [workLog, setWorkLog] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const loadAttendance = useCallback(async (showError = true) => {
    try {
      const response = await apiService.get("staff/attendance");
      const payload = response?.data || response || {};
      setSummary(payload.summary || {});
    } catch (error) {
      if (showError) {
        toast({ title: "Could not load attendance", description: getErrorMessage(error), variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadAttendance();
    const interval = window.setInterval(() => void loadAttendance(false), 60_000);
    return () => window.clearInterval(interval);
  }, [loadAttendance]);

  const submitClock = async (clockOut: boolean) => {
    if (clockOut && !workLog.trim()) {
      toast({ title: "Daily summary required", description: "Add a work summary before clocking out.", variant: "destructive" });
      return;
    }

    setBusy(true);
    try {
      await apiService.post(
        clockOut ? "staff/attendance/clock-out" : "staff/attendance/clock-in",
        clockOut ? { work_log: workLog.trim() } : {},
      );
      toast({ title: clockOut ? "Clocked out" : "Clocked in" });
      setWorkLog("");
      await loadAttendance();
    } catch (error) {
      toast({ title: "Attendance action failed", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const isOpen = Boolean(summary.today?.isOpen);
  const completedToday = Boolean(summary.today) && !isOpen;

  return (
    <Card className="mb-8">
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-col gap-3 text-lg sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2">
            <Clock3 className="h-5 w-5 text-primary" />
            Today&apos;s work session
          </span>
          <div className="flex items-center gap-2">
            <Badge variant={isOpen ? "default" : "secondary"}>{summary.currentStatus || "Not clocked in"}</Badge>
            <Button asChild variant="outline" size="sm" className="text-xs">
              <Link to="/dashboard/pm/attendance">View attendance</Link>
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading today&apos;s attendance...
          </div>
        ) : isOpen ? (
          <>
            <AttendanceTimer active startedAt={summary.today.clockInAt} compact />
            <Textarea
              className="min-h-[90px]"
              placeholder="Add the work completed today before clocking out"
              value={workLog}
              onChange={(event) => setWorkLog(event.target.value)}
              disabled={busy}
            />
            <Button type="button" onClick={() => void submitClock(true)} disabled={busy}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
              {busy ? "Clocking out..." : "Clock out and save summary"}
            </Button>
          </>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {completedToday
                ? summary.today.status === "Absent"
                  ? "Today has been marked absent."
                  : "Your work session for today is complete."
                : "Clock in to start tracking your workday."}
            </p>
            <Button type="button" onClick={() => void submitClock(false)} disabled={busy || completedToday}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
              {busy ? "Clocking in..." : completedToday ? "Workday completed" : "Clock in"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectManagerAttendanceWidget;
