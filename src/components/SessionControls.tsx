import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from '@/components/ui/alert-dialog';
import api from '@/services/apiService';
import { getErrorMessage } from '@/lib/errors';
type Session = { session_id: string; current: boolean; user_agent?: string; auth_method: string; created_at?: string; last_seen_at?: string; expires_at?: string; revoked_at?: string };
export default function SessionControls() {
  const trigger = useRef<HTMLElement | null>(null);
  const choose = (selection: Session | 'all') => { trigger.current = document.activeElement as HTMLElement; setSelected(selection); };
  const [sessions, setSessions] = useState<Session[]>([]);
  const [legacy, setLegacy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [selected, setSelected] = useState<Session | 'all' | null>(null);
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await api.get('auth/sessions');
      setSessions(response.data.sessions || []); setLegacy(!response.data.current_session_id);
    } catch (cause) { setError(getErrorMessage(cause)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const revoke = async () => {
    if (!selected || busy) return;
    setBusy(true); setError('');
    try {
      const response = selected === 'all' ? await api.post('auth/logout-all', {}) : await api.delete('auth/sessions', selected.session_id);
      if (selected === 'all' || response.data.current_session) {
        api.clearTokens(); setSessions([]); setMessage('Signed out. Sign in again to continue.');
      } else { await load(); setMessage('Session revoked.'); }
      setSelected(null);
    } catch (cause) { setError(getErrorMessage(cause)); }
    finally { setBusy(false); }
  };
  const time = (value?: string) => value ? new Date(value).toLocaleString() : 'Unavailable';
  return <Card><CardHeader><CardTitle>Signed-in sessions</CardTitle></CardHeader><CardContent className="space-y-4">
    <p className="text-sm text-muted-foreground">Revoke a device you no longer use. Other devices stay signed in.</p>
    {legacy && <p className="text-sm">This older sign-in has no device session. Sign out and sign in again to upgrade it.</p>}
    {loading && <p role="status">Loading sessions…</p>}
    {message && <p role="status">{message}</p>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {!loading && !error && sessions.length === 0 && <p className="text-sm">No device sessions to display.</p>}
    <ul className="divide-y">{sessions.map(session => <li key={session.session_id} className="flex flex-wrap items-start justify-between gap-3 py-4">
      <div className="min-w-0 flex-1 space-y-1"><p className="break-words font-medium">{session.user_agent || 'Unidentified device'}</p><p className="text-sm">{session.current ? 'Current session · ' : ''}{session.revoked_at ? 'Revoked' : session.auth_method}</p><p className="text-xs text-muted-foreground">Signed in: {time(session.created_at)}<br />Last seen: {time(session.last_seen_at)}<br />Expires: {time(session.expires_at)}</p></div>
      {!session.revoked_at && <Button variant="outline" disabled={busy} onClick={() => choose(session)}>{session.current ? 'Sign out this device' : 'Revoke session'}</Button>}
    </li>)}</ul>
    <div className="flex flex-wrap gap-3"><Button variant="ghost" disabled={loading || busy} onClick={() => void load()}>Refresh sessions</Button><Button variant="outline" disabled={busy} onClick={() => choose('all')}>Sign out all devices</Button></div>
    <AlertDialog open={!!selected} onOpenChange={open => { if (!open && !busy) setSelected(null); }}><AlertDialogContent onCloseAutoFocus={event => { event.preventDefault(); trigger.current?.focus(); }} className="max-h-[85dvh] overflow-y-auto"><AlertDialogHeader><AlertDialogTitle>{selected === 'all' ? 'Sign out all devices?' : 'Revoke this session?'}</AlertDialogTitle><AlertDialogDescription>{selected === 'all' ? 'Every device, including this one, will need to sign in again.' : `Revoke ${selected?.user_agent || 'this device'}? It will need to sign in again.`}</AlertDialogDescription></AlertDialogHeader>{error && <p role="alert">{error}</p>}<AlertDialogFooter><AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel><Button variant="destructive" disabled={busy} aria-busy={busy} onClick={() => void revoke()}>{selected === 'all' ? 'Sign out all devices' : 'Revoke session'}</Button></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </CardContent></Card>;
}
