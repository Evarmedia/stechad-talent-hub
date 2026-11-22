import ReasonDialog from "./ReasonDialog";
import MfaPanel from "./MfaPanel";
import PlatformWorkspace from "./PlatformWorkspace";
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/apiService';
import { getErrorMessage } from '@/lib/errors';
import { exchangeGoogleCode, googleSignInUrl, saveIdentity } from '@/services/identityAuth';
export type PlatformIdentity = { user: { user_id: string; email: string; first_name?: string; last_name?: string }; roles: { role_id: string; role_key: string; name: string }[]; permissions: string[]; mfa: { enrolled: boolean; verified: boolean; assurance_expires_at: string | null }; requires_mfa_enrollment: boolean };
export default function PlatformApp() {
  const [identity, setIdentity] = useState<PlatformIdentity | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [replaceOpen, setReplaceOpen] = useState(false);
  const [replacementReason, setReplacementReason] = useState('');
  const [visible, setVisible] = useState(false);
  const callbackStarted = useRef(false);
  const loadRequest = useRef(0);
  const load = useCallback(async () => {
    const request = ++loadRequest.current;
    setLoading(true); setError('');
    try {
      if (api.getToken() || api.getRefreshToken()) {
        const response = await api.get('platform/me');
        if (request === loadRequest.current && api.getToken()) setIdentity(response.data);
      }
    }
    catch (cause) { if (request === loadRequest.current) { setIdentity(null); setError(getErrorMessage(cause)); } }
    finally { if (request === loadRequest.current) setLoading(false); }
  }, []);
  useEffect(() => {
    document.title = 'Internal administration | STECHAD';
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code && !callbackStarted.current) {
      callbackStarted.current = true;
      window.history.replaceState({}, '', '/platform-admin.html');
      void exchangeGoogleCode(code).then(response => { saveIdentity(response.data); return load(); }).catch(cause => { setError(getErrorMessage(cause)); setLoading(false); });
    } else if (!callbackStarted.current) { void load(); }
  }, [load]);
  useEffect(() => {
    const reset = () => { loadRequest.current += 1; setReplacementReason(''); setReplaceOpen(false); setIdentity(null); setLoading(false); setError('Signed out. Sign in again to continue.'); };
    const storage = (event: StorageEvent) => { if (event.key === 'stechad_token' && !event.newValue) { reset(); return; } if (event.key === 'stechad_identity_revision') { setIdentity(null); void load(); } };
    window.addEventListener('stechad:signed-out', reset); window.addEventListener('storage', storage);
    return () => { window.removeEventListener('stechad:signed-out', reset); window.removeEventListener('storage', storage); };
  }, [load]);
  useEffect(() => {
    if (!identity?.mfa.verified || !identity.mfa.assurance_expires_at) return;
    const delay = Math.max(0, new Date(identity.mfa.assurance_expires_at).getTime() - Date.now());
    const timer = setTimeout(() => {
      setIdentity(current => current && ({ ...current, mfa: { ...current.mfa, verified: false } }));
      setReplacementReason(''); setError('Platform verification expired. Verify again to continue.');
    }, delay);
    return () => clearTimeout(timer);
  }, [identity]);
  const login = async (event: React.FormEvent) => {
    event.preventDefault(); if (busy) return;
    setError('');
    if (!email.trim() || !password) { setError('Enter your email and password.'); document.getElementById(!email.trim() ? 'platform-email' : 'platform-password')?.focus(); return; }
    setBusy(true);
    try { const response = await api.post('auth/login', { email: email.trim().toLowerCase(), password }); saveIdentity(response.data); setPassword(''); await load(); }
    catch (cause) { setError(getErrorMessage(cause)); }
    finally { setBusy(false); }
  };
  return <div className="min-h-screen bg-muted/40"><header className="border-b bg-white px-4 py-4 md:px-8"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3"><div><p className="font-montserrat text-lg font-bold text-primary">STECHAD</p><p className="text-xs text-muted-foreground">Internal administration</p></div>{identity && <div className="flex flex-wrap items-center gap-3"><span className="text-sm">{identity.user.email}</span><Button variant="outline" onClick={() => { void api.endSession().catch(() => {}); }}>Sign out</Button></div>}</div></header><main className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
    {loading && <p role="status">Checking platform access…</p>}
    {error && <p role="alert" className="rounded-md border border-destructive/30 bg-white p-4 text-sm text-destructive">{error}</p>}
    {!loading && !identity && <Card className="mx-auto max-w-md"><CardHeader><CardTitle>Platform sign-in</CardTitle></CardHeader><CardContent className="space-y-4"><p className="text-sm text-muted-foreground">Use your STECHAD identity. Internal access requires an explicit platform role.</p><form noValidate onSubmit={event => void login(event)} className="space-y-4"><div className="space-y-2"><Label htmlFor="platform-email">Email</Label><Input id="platform-email" type="email" autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} disabled={busy} /></div><div className="space-y-2"><Label htmlFor="platform-password">Password</Label><Input id="platform-password" type={visible ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} disabled={busy} /><Button type="button" variant="ghost" aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? 'Hide password' : 'Show password'}</Button></div><Button className="w-full" disabled={busy} aria-busy={busy}>Sign in</Button></form><Button variant="outline" className="w-full" disabled={busy} onClick={() => { setBusy(true); void googleSignInUrl('/platform-admin.html').then(url => window.location.assign(url)).catch(cause => { setError(getErrorMessage(cause)); setBusy(false); }); }}>Continue with Google</Button>{api.getToken() && <Button variant="ghost" onClick={() => void load()}>Check access again</Button>}<a className="block text-sm text-primary underline" href="/">Customer workspace</a></CardContent></Card>}
    {identity && !loading && (identity.mfa.verified && !replacementReason ? <><PlatformWorkspace identity={identity} onAuthorizationChanged={load} /><Card><CardHeader><CardTitle>Platform security</CardTitle></CardHeader><CardContent className="space-y-3"><p className="text-sm text-muted-foreground">Verified until {identity.mfa.assurance_expires_at ? new Date(identity.mfa.assurance_expires_at).toLocaleTimeString() : 'verification expires'}. Refreshing your session does not extend this time.</p><Button variant="outline" onClick={() => setReplaceOpen(true)}>Replace authenticator</Button></CardContent></Card></> : <MfaPanel key={replacementReason || 'verify'} identity={identity} replacement={!!replacementReason} reason={replacementReason} onCancel={replacementReason ? () => setReplacementReason('') : undefined} onVerified={() => { setReplacementReason(''); void load(); }} />)}
    {replaceOpen && <ReasonDialog title="Replace authenticator" description="Your current authenticator keeps working until you confirm the new one. Confirmation invalidates the previous factor, recovery codes and older platform verifications." action="Start replacement" onConfirm={async reason => { setReplacementReason(reason); }} onClose={() => setReplaceOpen(false)} />}
  </main></div>;
}
