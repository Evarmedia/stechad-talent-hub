/* eslint-disable @typescript-eslint/no-explicit-any */
import AttendanceTimer from "@/components/AttendanceTimer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/apiService";
import { requestBrowserLocationPermission } from "@/utils/locationPermission";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  DollarSign,
  MapPin,
  ReceiptText,
  TrendingUp,
} from "lucide-react";
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
      toast({
        title: "Could not load dashboard",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadDashboard();
    const interval = window.setInterval(loadDashboard, 60_000);
    window.addEventListener("stechad:location-updated", loadDashboard);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("stechad:location-updated", loadDashboard);
    };
  }, []);

  const getLocation = () =>
    new Promise<Record<string, number>>((resolve) => {
      if (!data?.user?.locationSharingEnabled || !navigator.geolocation)
        return resolve({});
      navigator.geolocation.getCurrentPosition(
        (position) =>
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          }),
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
      toast({
        title: "Clock-in failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const clockOut = async () => {
    if (!workLog.trim()) {
      toast({
        title: "Daily summary required",
        description: "Record what you completed before clocking out.",
        variant: "destructive",
      });
      return;
    }
    setBusy(true);
    try {
      await apiService.post("staff/attendance/clock-out", {
        work_log: workLog,
        ...(await getLocation()),
      });
      toast({
        title: "Clocked out",
        description: "Your daily work log has been saved.",
      });
      setWorkLog("");
      await loadDashboard();
    } catch (error: any) {
      toast({
        title: "Clock-out failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const setLocationSharing = async (enabled: boolean) => {
    try {
      const result = enabled
        ? await requestBrowserLocationPermission()
        : { status: data?.user?.locationPermissionStatus, location: undefined };
      const canEnable = enabled && result.status === "granted";
      const response = await apiService.putNoId("staff/location-sharing", {
        enabled: canEnable,
        ...(result.status ? { permission_status: result.status } : {}),
        ...result.location,
      });
      setData((current: any) => ({
        ...current,
        user: {
          ...current.user,
          locationSharingEnabled: canEnable,
          locationPermissionStatus: result.status,
          browserLocation:
            response?.data?.browserLocation ||
            (canEnable ? current.user.browserLocation : null),
        },
      }));
      toast({
        title: canEnable
          ? "Location sharing enabled"
          : enabled
            ? "Location permission not granted"
            : "Location sharing disabled",
        description:
          enabled && !canEnable
            ? "Allow location access in your browser settings to enable this feature."
            : canEnable
              ? "Location consent saved."
              : "Location sharing is off.",
      });
    } catch (error: any) {
      toast({
        title: "Could not update location consent",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const isClockedIn = Boolean(data?.attendanceSummary?.today?.isOpen);
  const browserLocation = data?.user?.browserLocation;
  const stats = [
    {
      label: "Attendance",
      value: data?.summary?.attendance || "0%",
      icon: Clock3,
    },
    {
      label: "Leave balance",
      value: data?.summary?.leaveBalance || "0 days",
      icon: CalendarDays,
    },
    {
      label: "Expenses",
      value: `$${Number(data?.summary?.expenseTotal || 0).toLocaleString()}`,
      icon: DollarSign,
    },
    {
      label: "KPI score",
      value: data?.summary?.kpiScore || "Not scored",
      icon: TrendingUp,
    },
  ];

  return (
    <div className='p-4 md:p-8 space-y-8'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
        <div>
          <p className='text-sm uppercase tracking-[0.2em] text-primary/80'>
            STECHAD People
          </p>
          <h1 className='text-2xl font-bold text-primary'>
            Welcome, {data?.user?.name || "Staff member"}
          </h1>
        </div>
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <CalendarDays className='w-4 h-4' />
          Today: {data?.user?.today || new Date().toLocaleDateString()}
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4'>
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className='p-4 flex items-center justify-between'>
              <div>
                <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                  {stat.label}
                </p>
                <p className='text-2xl font-bold text-primary mt-2'>
                  {stat.value}
                </p>
              </div>
              <div className='rounded-full bg-primary/10 p-2 text-primary'>
                <stat.icon className='w-5 h-5' />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
        <Card className='xl:col-span-2'>
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              <span>Attendance</span>
              {isClockedIn ? (
                <Button disabled={busy} variant='outline' onClick={clockOut}>
                  Clock out
                </Button>
              ) : (
                <Button
                  disabled={busy || Boolean(data?.attendanceSummary?.today)}
                  onClick={clockIn}
                >
                  {data?.attendanceSummary?.today
                    ? data.attendanceSummary.today.status === "Absent"
                      ? "Marked absent"
                      : "Completed today"
                    : "Clock in"}
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between rounded-lg border bg-red-50 p-3'>
              <div>
                <p className='text-sm text-muted-foreground'>Current status</p>
                <p className='font-semibold text-primary'>
                  {data?.attendanceSummary?.currentStatus || "Not clocked in"}
                </p>
              </div>
              <CheckCircle2
                className={`w-5 h-5 ${isClockedIn ? "text-success" : "text-muted-foreground"}`}
              />
            </div>
            <AttendanceTimer
              active={isClockedIn}
              startedAt={data?.attendanceSummary?.today?.clockInAt}
              compact
            />
            {isClockedIn && (
              <div>
                <label className='mb-2 block text-sm font-medium'>
                  Daily work summary
                </label>
                <Textarea
                  className='min-h-[110px]'
                  placeholder='Summarize the work completed today...'
                  value={workLog}
                  onChange={(event) => setWorkLog(event.target.value)}
                />
                <p className='mt-2 text-xs text-muted-foreground'>
                  This summary is required before clock-out.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              <span>Location consent</span>
              <Switch
                checked={Boolean(data?.user?.locationSharingEnabled)}
                onCheckedChange={setLocationSharing}
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-start gap-3 rounded-lg border bg-slate-50 p-3'>
              <MapPin className='w-5 h-5 shrink-0 text-primary' />
              <div className='text-sm'>
                {data?.user?.locationSharingEnabled && browserLocation ? (
                  <>
                    <p className='font-medium text-foreground'>
                      {browserLocation.country || "Location consent"}
                    </p>
                    {/* {browserLocation.formattedAddress && (
                      <p className='mt-1 text-xs text-muted-foreground'>
                        {browserLocation.label}
                      </p>
                    )} */}
                  </>
                ) : (
                  <p className='text-muted-foreground'>
                    {data?.user?.locationPermissionStatus === "granted"
                      ? "Location consent accepted. Resolving the current address."
                      : data?.user?.locationPermissionStatus === "denied"
                        ? "Browser permission was denied. You can change it in browser settings; the system will not prompt again."
                        : "Location sharing is off. No coordinates are collected."}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 xl:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              Recent leave{" "}
              <Button asChild size='sm' variant='outline'>
                <Link to='/dashboard/staff/leave'>Manage leave</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.leave || []).map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{item.dates}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.status === "Approved"
                            ? "white"
                            : item.status === "Rejected"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              <span className='flex items-center gap-2'>
                <ReceiptText className='w-5 h-5' />
                Recent expenses
              </span>
              <Button asChild size='sm' variant='outline'>
                <Link to='/dashboard/staff/expenses'>Manage expenses</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.expenses || []).map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>
                      {item.currency} {item.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.status === "Approved" ||
                          item.status === "Receipt Verified"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 xl:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming holidays</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            {(data?.holidays || []).map((item: any) => (
              <div
                key={item.holiday_id}
                className='flex items-center justify-between rounded-lg border p-3'
              >
                <div>
                  <p className='font-medium'>{item.name}</p>
                  <p className='text-sm text-muted-foreground'>{item.date}</p>
                </div>
                <Badge variant='outline'>{item.region || item.type}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>KPI & appraisal tracker</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {(data?.kpis || []).map((item: any) => (
              <div key={item.id} className='rounded-lg border p-4'>
                <div className='mb-3 flex flex-wrap justify-between gap-2'>
                  <p className='font-medium'>{item.title}</p>
                  <Badge
                    variant={item.currentAppraisal ? "white" : "secondary"}
                  >
                    {item.currentPeriod.label}:{" "}
                    {item.currentAppraisal
                      ? `${item.currentAppraisal.overallScore}%`
                      : "Not scored"}
                  </Badge>
                </div>
                <div className='space-y-1'>
                  {item.criteria.map((criterion: any) => (
                    <p
                      key={criterion.id}
                      className='text-sm text-muted-foreground'
                    >
                      • {criterion.title}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaffDashboard;
