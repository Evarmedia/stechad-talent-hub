import { useRef, useState } from "react";
import { useRemoteData } from "@/hooks/useRemoteData";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/apiService";
import { getErrorMessage } from "@/lib/errors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
export default function AdminNotifications() {
  const { toast } = useToast(); const recipients = useRemoteData<{ statistics: { totalUsers: number } }>("admin/dashboard");
  const [form, setForm] = useState({ title: "", message: "", type: "info" }); const [confirming, setConfirming] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const attempt = useRef<{ payload: string; id: string } | null>(null);
  const send = async () => {
    if (busy) return; setBusy(true); setError("");
    const payload = JSON.stringify(form);
    if (attempt.current?.payload !== payload) attempt.current = { payload, id: crypto.randomUUID() };
    try { const result = await apiService.post("admin/notifications/broadcast", { ...form, broadcast_id: attempt.current.id }); toast({ title: `Notification sent to ${result.data.recipient_count} users` }); setForm({ title: "", message: "", type: "info" }); setConfirming(false); attempt.current = null; }
    catch (cause) { setError(getErrorMessage(cause)); }
    finally { setBusy(false); }
  };
  return <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-8"><div><h1 className="text-2xl font-bold text-primary">Send notification</h1><p className="mt-1 text-sm text-muted-foreground">Send an announcement to all current accounts. Offline users will see it when they return.</p></div><Card><CardHeader><CardTitle>Custom notification</CardTitle></CardHeader><CardContent><form className="space-y-4" onSubmit={(event) => { event.preventDefault(); setError(""); setConfirming(true); }}><div><Label htmlFor="notification-title">Title</Label><Input id="notification-title" required maxLength={200} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></div><div><Label htmlFor="notification-message">Message</Label><Textarea id="notification-message" required maxLength={5000} rows={6} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} /></div><div><Label htmlFor="notification-type">Type</Label><select id="notification-type" className="block w-full p-2 text-sm" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}><option value="info">Information</option><option value="success">Success</option><option value="warning">Warning</option></select></div><Button disabled={recipients.loading || Boolean(recipients.error) || !form.title.trim() || !form.message.trim()}>Preview notification</Button>{recipients.error && <p role="alert" className="text-sm text-destructive">{recipients.error}</p>}</form></CardContent></Card>
    <Dialog open={confirming} onOpenChange={(open) => !busy && setConfirming(open)}><DialogContent><DialogHeader><DialogTitle>Send to {recipients.data?.statistics.totalUsers || 0} users?</DialogTitle><DialogDescription>Includes every role and inactive accounts. Deleted accounts are excluded.</DialogDescription></DialogHeader><div className="space-y-2 rounded-md border p-4"><p className="font-semibold">{form.title}</p><p className="whitespace-pre-wrap break-words text-sm">{form.message}</p><p className="text-xs text-muted-foreground">{form.type}</p></div>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<DialogFooter><Button variant="outline" disabled={busy} onClick={() => setConfirming(false)}>Cancel</Button><Button disabled={busy} onClick={() => void send()}>{busy ? "Sending…" : "Send to all users"}</Button></DialogFooter></DialogContent></Dialog>
  </div>;
}
