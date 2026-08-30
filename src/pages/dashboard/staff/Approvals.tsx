import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/apiService";
import { useEffect, useState } from "react";

const StaffApprovalsPage = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const load = async () => {
    try { const response = await apiService.get("staff/approvals"); setItems(response?.data || response || []); } catch (error: any) { toast({ title: "Could not load approvals", description: error.message, variant: "destructive" }); }
  };
  useEffect(() => { load(); }, []);
  const review = async (item: any, action: string) => {
    const notes = window.prompt(action === "rejected" || action === "disputed" ? "Feedback is recommended:" : "Optional review notes:", "") || "";
    try { await apiService.put(`staff/approvals/${item.type}`, item.id, { action, notes }); toast({ title: "Approval updated" }); await load(); } catch (error: any) { toast({ title: "Could not update approval", description: error.message, variant: "destructive" }); }
  };
  const label = (action: string) => action.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  return <div className="py-8 max-w-7xl mx-auto px-4 space-y-6"><div><p className="text-xs uppercase tracking-[0.2em] text-primary/80">Delegated access</p><h1 className="text-2xl font-bold text-primary">Approvals</h1></div><Card><CardHeader><CardTitle>Assigned approval queue</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Request</TableHead><TableHead>Owner</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>{items.map((item) => <TableRow key={`${item.type}-${item.id}`}><TableCell>{item.item}</TableCell><TableCell>{item.owner}</TableCell><TableCell className="capitalize">{item.type}</TableCell><TableCell><Badge variant="secondary">{item.status}</Badge></TableCell><TableCell className="space-x-2">{item.actions.map((action: string) => <Button key={action} size="sm" variant={action === "rejected" || action === "disputed" ? "destructive" : "default"} onClick={() => review(item, action)}>{label(action)}</Button>)}</TableCell></TableRow>)}</TableBody></Table>{!items.length && <p className="py-10 text-center text-muted-foreground">No requests currently need your approval.</p>}</CardContent></Card></div>;
};

export default StaffApprovalsPage;
