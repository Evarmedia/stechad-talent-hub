import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/apiService";
import { useEffect, useState } from "react";

const EngineerInvoicesPage = () => {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any>({});
  const [form, setForm] = useState({ period: "", amount: "", currency: "USD", notes: "" });
  const load = async () => {
    try {
      const [invoiceResponse, referralResponse] = await Promise.all([apiService.get("staff/invoices"), apiService.get("referrals/dashboard")]);
      setInvoices(invoiceResponse?.data || invoiceResponse || []);
      setReferrals(referralResponse?.data || referralResponse || {});
    } catch (error: any) { toast({ title: "Could not load payment data", description: error.message, variant: "destructive" }); }
  };
  useEffect(() => { load(); }, []);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try { await apiService.post("staff/invoices", { ...form, amount: Number(form.amount) }); toast({ title: "Invoice submitted for review" }); setForm({ period: "", amount: "", currency: "USD", notes: "" }); await load(); } catch (error: any) { toast({ title: "Could not submit invoice", description: error.message, variant: "destructive" }); }
  };
  return <div className="p-4 md:p-8 mx-auto space-y-6"><div><p className="text-sm uppercase tracking-[0.2em] text-primary/80">Payments</p><h1 className="text-2xl font-bold text-primary">Engineer invoicing</h1></div><div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6"><Card><CardHeader><CardTitle>Raise invoice</CardTitle></CardHeader><CardContent><form onSubmit={submit} className="space-y-3"><Input required placeholder="Billing period" value={form.period} onChange={(e) => setForm((p) => ({ ...p, period: e.target.value }))} /><div className="grid grid-cols-[1fr_100px] gap-2"><Input required type="number" min="0.01" step="0.01" placeholder="Amount" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} /><select value={form.currency} onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))} className="rounded-md border px-3 py-2 text-sm"><option>USD</option><option>EUR</option><option>GBP</option></select></div><Textarea className="min-h-[100px]" placeholder="Line items and activity summary" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} /><Button className="w-full">Submit for review</Button></form></CardContent></Card><Card><CardHeader><CardTitle>Referral earnings</CardTitle></CardHeader><CardContent className="space-y-3"><div className="rounded-lg border bg-red-50 p-3"><p className="text-sm text-muted-foreground">Referral code</p><p className="text-xl font-bold text-primary">{referrals.referral_code || "—"}</p></div><div className="grid grid-cols-2 gap-3"><div className="rounded-lg border p-3"><p className="text-sm text-muted-foreground">Earned</p><p className="font-bold">${Number(referrals.total_rewards || 0).toLocaleString()}</p></div><div className="rounded-lg border p-3"><p className="text-sm text-muted-foreground">Pending</p><p className="font-bold">${Number(referrals.pending_rewards || 0).toLocaleString()}</p></div></div><p className="text-sm text-muted-foreground">{referrals.completed_referrals || 0} of {referrals.referrals_made || 0} referrals completed.</p></CardContent></Card></div><Card><CardHeader><CardTitle>Invoice activity</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Period</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{invoices.map((item) => <TableRow key={item.id}><TableCell><p>{item.invoiceNumber}</p>{item.feedback && <p className="text-xs text-muted-foreground">{item.feedback}</p>}</TableCell><TableCell>{item.period}</TableCell><TableCell>{item.currency} {item.amount.toLocaleString()}</TableCell><TableCell><Badge variant={item.status === "Disputed" ? "destructive" : ["Approved", "Accounts Approved", "Paid"].includes(item.status) ? "default" : "secondary"}>{item.status}</Badge></TableCell></TableRow>)}</TableBody></Table></CardContent></Card></div>;
};

export default EngineerInvoicesPage;
