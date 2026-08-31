import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/apiService";
import { DollarSign, ReceiptText } from "lucide-react";
import { useEffect, useState } from "react";

const StaffInvoicesPage = () => {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [form, setForm] = useState({ period: "", amount: "", currency: "USD", notes: "" });

  const loadInvoices = async () => {
    try {
      const response = await apiService.get("staff/invoices");
      setInvoices(response?.data || response || []);
    } catch (error: any) {
      toast({ title: "Could not load invoices", description: error.message, variant: "destructive" });
    }
  };
  useEffect(() => { loadInvoices(); }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await apiService.post("staff/invoices", { ...form, amount: Number(form.amount) });
      toast({ title: "Invoice submitted for review" });
      setForm({ period: "", amount: "", currency: "USD", notes: "" });
      await loadInvoices();
    } catch (error: any) {
      toast({ title: "Could not submit invoice", description: error.message, variant: "destructive" });
    }
  };

  const total = invoices.reduce((sum, row) => sum + row.amount, 0);
  return <div className="p-4 md:p-8 mx-auto space-y-6">
    <div><p className="text-xs uppercase tracking-[0.2em] text-primary/80">STECHAD People</p><h1 className="text-2xl font-bold text-primary">Invoices</h1></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><Card><CardContent className="p-5 flex justify-between"><div><p className="text-xs uppercase text-muted-foreground">Total billed</p><p className="text-2xl font-bold text-primary mt-2">${total.toLocaleString()}</p></div><DollarSign className="w-5 h-5 text-primary" /></CardContent></Card><Card><CardContent className="p-5 flex justify-between"><div><p className="text-xs uppercase text-muted-foreground">Approved</p><p className="text-2xl font-bold text-primary mt-2">{invoices.filter((item) => ["Approved", "Accounts Approved", "Paid"].includes(item.status)).length}</p></div><ReceiptText className="w-5 h-5 text-emerald-700" /></CardContent></Card><Card><CardContent className="p-5 flex justify-between"><div><p className="text-xs uppercase text-muted-foreground">Pending</p><p className="text-2xl font-bold text-primary mt-2">{invoices.filter((item) => item.status === "Pending").length}</p></div><ReceiptText className="w-5 h-5 text-amber-700" /></CardContent></Card></div>
    <div className="grid grid-cols-1 xl:grid-cols-[0.8fr_1.2fr] gap-6"><Card><CardHeader><CardTitle>Submit invoice</CardTitle></CardHeader><CardContent><form onSubmit={submit} className="space-y-3"><Input required placeholder="Billing period (for example August 2026)" value={form.period} onChange={(e) => setForm((p) => ({ ...p, period: e.target.value }))} /><div className="grid grid-cols-[1fr_100px] gap-2"><Input required type="number" min="0.01" step="0.01" placeholder="Amount" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} /><select value={form.currency} onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))} className="rounded-md border px-3 py-2 text-sm"><option>USD</option><option>EUR</option><option>GBP</option><option>NGN</option></select></div><Textarea placeholder="Line items and supporting details" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} /><Button className="w-full">Submit for review</Button></form></CardContent></Card>
      <Card><CardHeader><CardTitle>Invoice activity</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Period</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{invoices.map((item) => <TableRow key={item.id}><TableCell><p>{item.invoiceNumber}</p>{item.feedback && <p className="text-xs text-muted-foreground">{item.feedback}</p>}</TableCell><TableCell>{item.period}</TableCell><TableCell>{item.currency} {item.amount.toLocaleString()}</TableCell><TableCell><Badge variant={item.status === "Disputed" ? "destructive" : ["Approved", "Accounts Approved", "Paid"].includes(item.status) ? "default" : "secondary"}>{item.status}</Badge></TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
    </div>
  </div>;
};

export default StaffInvoicesPage;
