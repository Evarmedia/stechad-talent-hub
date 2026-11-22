import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { getErrorMessage } from '@/lib/errors';
export default function ReasonDialog({ title, description, action, onConfirm, onClose, children }: { title: string; description: string; action: string; onConfirm: (reason: string) => Promise<void>; onClose: () => void; children?: React.ReactNode }) {
  const trigger = useRef(document.activeElement as HTMLElement | null);
  const [reason, setReason] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); if (busy) return;
    if (!reason.trim()) { setError('Enter a reason for the audit log.'); document.getElementById('action-reason')?.focus(); return; }
    setBusy(true); setError('');
    try { await onConfirm(reason.trim()); onClose(); }
    catch (cause) { setError(getErrorMessage(cause)); }
    finally { setBusy(false); }
  };
  return <AlertDialog open onOpenChange={open => { if (!open && !busy) onClose(); }}><AlertDialogContent onCloseAutoFocus={event => { event.preventDefault(); if (trigger.current?.isConnected) trigger.current.focus(); else document.querySelector<HTMLElement>('h1')?.focus(); }} className="max-h-[85dvh] w-[calc(100%-2rem)] overflow-y-auto"><form noValidate onSubmit={event => void submit(event)} className="space-y-4"><AlertDialogHeader><AlertDialogTitle>{title}</AlertDialogTitle><AlertDialogDescription>{description}</AlertDialogDescription></AlertDialogHeader>{children}<div className="space-y-2"><Label htmlFor="action-reason">Reason</Label><Input id="action-reason" value={reason} maxLength={1000} onChange={event => setReason(event.target.value)} disabled={busy} aria-invalid={!!error} aria-describedby={error ? 'action-error' : undefined} /></div>{error && <p id="action-error" role="alert" className="text-sm text-destructive">{error}</p>}<AlertDialogFooter><AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel><Button variant="destructive" disabled={busy} aria-busy={busy}>{action}</Button></AlertDialogFooter></form></AlertDialogContent></AlertDialog>;
}
