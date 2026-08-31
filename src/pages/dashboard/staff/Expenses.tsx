import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/apiService";
import { DollarSign, ReceiptText } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const StaffExpensesPage = () => {
  const { toast } = useToast();
  const receiptInput = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ category: "Travel", amount: "", currency: "USD", description: "", expense_date: new Date().toISOString().slice(0, 10) });
  const [receipt, setReceipt] = useState<File | null>(null);
  const [claims, setClaims] = useState<any[]>([]);

  const loadExpenses = async () => {
    try {
      const response = await apiService.get("staff/expenses");
      setClaims(response?.data || response || []);
    } catch (error: any) {
      toast({ title: "Could not load expenses", description: error.message, variant: "destructive" });
    }
  };
  useEffect(() => { loadExpenses(); }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!receipt) return toast({ title: "Receipt required", description: "Attach an image or PDF receipt.", variant: "destructive" });
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, value));
    payload.append("receipt", receipt);
    try {
      await apiService.post("staff/expenses", payload, true);
      toast({ title: "Expense submitted", description: "Expense claim submitted successfully." });
      setForm({ category: "Travel", amount: "", currency: "USD", description: "", expense_date: new Date().toISOString().slice(0, 10) });
      setReceipt(null);
      if (receiptInput.current) receiptInput.current.value = "";
      await loadExpenses();
    } catch (error: any) {
      toast({ title: "Could not submit expense", description: error.message, variant: "destructive" });
    }
  };

  const total = claims.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const approved = claims.filter((item) => ["Approved", "Receipt Verified", "Paid"].includes(item.status)).reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return <div className="p-4 md:p-8 mx-auto space-y-6">
    <div><p className="text-xs uppercase tracking-[0.2em] text-primary/80">STECHAD People</p><h1 className="text-2xl font-bold text-primary">Expenses</h1></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><Card><CardContent className="p-5 flex justify-between"><div><p className="text-xs uppercase text-muted-foreground">Claim total</p><p className="text-2xl font-bold text-primary mt-2">${total.toLocaleString()}</p></div><DollarSign className="w-5 h-5 text-primary" /></CardContent></Card><Card><CardContent className="p-5 flex justify-between"><div><p className="text-xs uppercase text-muted-foreground">Approved</p><p className="text-2xl font-bold text-primary mt-2">${approved.toLocaleString()}</p></div><ReceiptText className="w-5 h-5 text-emerald-700" /></CardContent></Card><Card><CardContent className="p-5 flex justify-between"><div><p className="text-xs uppercase text-muted-foreground">Pending</p><p className="text-2xl font-bold text-primary mt-2">{claims.filter((item) => item.status === "Pending").length}</p></div><ReceiptText className="w-5 h-5 text-amber-700" /></CardContent></Card></div>
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <Card><CardHeader><CardTitle>Submit expense claim</CardTitle></CardHeader><CardContent><form onSubmit={handleSubmit} className="space-y-4"><select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="w-full rounded-md border px-3 py-2 text-sm"><option>Travel</option><option>Equipment</option><option>Internet</option><option>Meals</option><option>Other</option></select><div className="grid grid-cols-[1fr_110px] gap-3"><Input required min="0.01" step="0.01" type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} /><select value={form.currency} onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))} className="rounded-md border px-3 py-2 text-sm"><option>USD</option><option>EUR</option><option>GBP</option><option>NGN</option></select></div><Input required type="date" value={form.expense_date} onChange={(e) => setForm((p) => ({ ...p, expense_date: e.target.value }))} /><Textarea placeholder="Describe the business expense" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} /><div><label className="mb-2 block text-sm font-medium">Receipt (image or PDF, max 2 MB)</label><Input ref={receiptInput} required type="file" accept="image/*,application/pdf" onChange={(e) => setReceipt(e.target.files?.[0] || null)} /></div><Button>Submit claim</Button></form></CardContent></Card>
      <Card><CardHeader><CardTitle>Claim history</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Category</TableHead><TableHead>Amount</TableHead><TableHead>Receipt</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{claims.map((item) => <TableRow key={item.id}><TableCell><p>{item.category}</p>{item.feedback && <p className="text-xs text-muted-foreground">{item.feedback}</p>}</TableCell><TableCell>{item.currency} {Number(item.amount).toLocaleString()}</TableCell><TableCell>{item.receiptUrl ? <a href={item.receiptUrl} target="_blank" rel="noreferrer" className="text-primary underline">View</a> : item.receiptName || "—"}</TableCell><TableCell><Badge variant={item.status === "Rejected" ? "destructive" : ["Approved", "Receipt Verified", "Paid"].includes(item.status) ? "default" : "secondary"}>{item.status}</Badge></TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
    </div>
  </div>;
};

export default StaffExpensesPage;
