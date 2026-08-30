import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/apiService";
import { CalendarDays, Clock3 } from "lucide-react";
import { useEffect, useState } from "react";

const StaffLeavePage = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ type: "Annual Leave", start_date: "", end_date: "", reason: "" });
  const [leaves, setLeaves] = useState<any[]>([]);
  const [balance, setBalance] = useState({ allowance: 0, used: 0, remaining: 0 });

  const loadLeaves = async () => {
    try {
      const response = await apiService.get("staff/leave");
      const payload = response?.data || response;
      setLeaves(payload.requests || []);
      setBalance(payload.balance || { allowance: 0, used: 0, remaining: 0 });
    } catch (error: any) {
      toast({ title: "Could not load leave", description: error.message, variant: "destructive" });
    }
  };
  useEffect(() => { loadLeaves(); }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await apiService.post("staff/leave", form);
      toast({ title: "Leave request submitted", description: "An admin has been notified." });
      setForm({ type: "Annual Leave", start_date: "", end_date: "", reason: "" });
      await loadLeaves();
    } catch (error: any) {
      toast({ title: "Could not submit leave", description: error.message, variant: "destructive" });
    }
  };

  return <div className="py-8 max-w-7xl mx-auto px-4 space-y-6">
    <div><p className="text-xs uppercase tracking-[0.2em] text-primary/80">STECHAD People</p><h1 className="text-2xl font-bold text-primary">Leave</h1></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card><CardContent className="p-5 flex justify-between"><div><p className="text-xs uppercase text-muted-foreground">Remaining</p><p className="text-2xl font-bold text-primary mt-2">{balance.remaining} days</p></div><CalendarDays className="w-5 h-5 text-primary" /></CardContent></Card>
      <Card><CardContent className="p-5 flex justify-between"><div><p className="text-xs uppercase text-muted-foreground">Pending</p><p className="text-2xl font-bold text-primary mt-2">{leaves.filter((item) => item.status === "Pending").length}</p></div><Clock3 className="w-5 h-5 text-amber-700" /></CardContent></Card>
      <Card><CardContent className="p-5 flex justify-between"><div><p className="text-xs uppercase text-muted-foreground">Used this year</p><p className="text-2xl font-bold text-primary mt-2">{balance.used}/{balance.allowance}</p></div><CalendarDays className="w-5 h-5 text-emerald-700" /></CardContent></Card>
    </div>
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <Card><CardHeader><CardTitle>Request leave</CardTitle></CardHeader><CardContent><form onSubmit={handleSubmit} className="space-y-4"><div><label className="mb-2 block text-sm font-medium">Leave type</label><select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} className="w-full rounded-md border px-3 py-2 text-sm"><option>Annual Leave</option><option>Sick Leave</option><option>Study Leave</option><option>Compassionate Leave</option></select></div><div className="grid grid-cols-2 gap-3"><div><label className="mb-2 block text-sm font-medium">Start date</label><Input required type="date" value={form.start_date} onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))} /></div><div><label className="mb-2 block text-sm font-medium">End date</label><Input required type="date" min={form.start_date} value={form.end_date} onChange={(e) => setForm((p) => ({ ...p, end_date: e.target.value }))} /></div></div><Textarea placeholder="Reason for leave" value={form.reason} onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))} /><Button>Submit leave request</Button></form></CardContent></Card>
      <Card><CardHeader><CardTitle>Leave history</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Dates</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{leaves.map((item) => <TableRow key={item.id}><TableCell><p>{item.type}</p>{item.feedback && <p className="text-xs text-muted-foreground">{item.feedback}</p>}</TableCell><TableCell>{item.dates}</TableCell><TableCell><Badge variant={item.status === "Approved" ? "default" : item.status === "Rejected" ? "destructive" : "secondary"}>{item.status}</Badge></TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
    </div>
  </div>;
};

export default StaffLeavePage;
