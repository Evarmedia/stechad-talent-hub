import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/apiService";
import { useEffect, useState } from "react";

const PMProjectInvoicePage = () => {
  const { toast } = useToast();
  const [projects, setProjects] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [form, setForm] = useState({ project_id: "", client_name: "", period: "", amount: "", currency: "USD", notes: "" });
  const load = async () => {
    try { const response = await apiService.get("staff/project-invoices"); const payload = response?.data || response; setProjects(payload.projects || []); setInvoices(payload.invoices || []); } catch (error: any) { toast({ title: "Could not load project billing", description: error.message, variant: "destructive" }); }
  };
  useEffect(() => { load(); }, []);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try { await apiService.post("staff/project-invoices", { ...form, amount: Number(form.amount) }); toast({ title: "Project invoice sent to accounts" }); setForm({ project_id: "", client_name: "", period: "", amount: "", currency: "USD", notes: "" }); await load(); } catch (error: any) { toast({ title: "Could not submit invoice", description: error.message, variant: "destructive" }); }
  };
  return <div className="py-8 max-w-6xl mx-auto px-4 space-y-6"><div><p className="text-sm uppercase tracking-[0.2em] text-primary/80">Project billing</p><h1 className="text-2xl font-bold text-primary">Project invoice summaries</h1></div><div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6"><Card><CardHeader><CardTitle>Submit completed project</CardTitle></CardHeader><CardContent><form onSubmit={submit} className="space-y-3"><select required value={form.project_id} onChange={(e) => setForm((p) => ({ ...p, project_id: e.target.value }))} className="w-full rounded-md border px-3 py-2 text-sm"><option value="">Select completed project</option>{projects.filter((item) => item.status === "completed").map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select><Input required placeholder="Client name" value={form.client_name} onChange={(e) => setForm((p) => ({ ...p, client_name: e.target.value }))} /><Input required placeholder="Billing period" value={form.period} onChange={(e) => setForm((p) => ({ ...p, period: e.target.value }))} /><div className="grid grid-cols-[1fr_100px] gap-2"><Input required type="number" min="0.01" step="0.01" placeholder="Amount" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} /><select value={form.currency} onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))} className="rounded-md border px-3 py-2 text-sm"><option>USD</option><option>EUR</option><option>GBP</option></select></div><Textarea className="min-h-[100px]" placeholder="Delivery summary and line items" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} /><Button className="w-full">Submit for accounts approval</Button></form></CardContent></Card><Card><CardHeader><CardTitle>Billing handoff</CardTitle></CardHeader><CardContent className="space-y-3"><div className="rounded-lg border bg-red-50 p-3"><p className="text-sm text-muted-foreground">1. Project status</p><p className="font-semibold">Must be completed</p></div><div className="rounded-lg border p-3"><p className="text-sm text-muted-foreground">2. Accounts review</p><p className="font-semibold">Approve or dispute in STECHAD Hub</p></div><div className="rounded-lg border p-3"><p className="text-sm text-muted-foreground">3. Zoho</p><p className="font-semibold">Sync after accounts approval when configured</p></div></CardContent></Card></div><Card><CardHeader><CardTitle>Recent submissions</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Project</TableHead><TableHead>Client</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{invoices.map((item) => <TableRow key={item.id}><TableCell>{item.invoiceNumber}</TableCell><TableCell>{item.project}</TableCell><TableCell>{item.client}</TableCell><TableCell>{item.currency} {item.amount.toLocaleString()}</TableCell><TableCell><Badge variant={item.status === "Disputed" ? "destructive" : ["Approved", "Accounts Approved", "Paid"].includes(item.status) ? "default" : "secondary"}>{item.status}</Badge></TableCell></TableRow>)}</TableBody></Table></CardContent></Card></div>;
};

export default PMProjectInvoicePage;
