import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/services/apiService';
import { getErrorMessage } from '@/lib/errors';
import SecretField from './SecretField';
import type { PlatformIdentity } from './PlatformApp';
export default function MfaPanel({ identity, onVerified, replacement = false, reason = '', onCancel }: { identity: PlatformIdentity; onVerified: () => void; replacement?: boolean; reason?: string; onCancel?: () => void }) {
  const [pending, setPending] = useState<{ secret: string; expires_at: string } | null>(null);
  const [expired, setExpired] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [code, setCode] = useState('');
  const [recovery, setRecovery] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!pending) return;
    const timer = setTimeout(() => { setPending(null); setExpired(true); }, Math.max(0, new Date(pending.expires_at).getTime() - Date.now()));
    return () => clearTimeout(timer);
  }, [pending]);
  const enroll = async () => {
    if (busy) return;
    setBusy(true); setError('');
    try { setPending((await api.post('platform/mfa/enroll', replacement ? { replace: true, reason } : {})).data); setExpired(false); }
    catch (cause) { setError(getErrorMessage(cause)); }
    finally { setBusy(false); }
  };
  const verify = async (event: React.FormEvent) => {
    event.preventDefault(); if (busy) return;
    setError('');
    if (!code.trim()) { setError('Enter your authenticator code or recovery code.'); document.getElementById('mfa-code')?.focus(); return; }
    setBusy(true);
    try {
      const response = await api.post(`platform/mfa/${pending ? 'confirm' : 'verify'}`, pending || !recovery ? { code: code.trim() } : { recovery_code: code.trim() });
      setCode(''); setPending(null);
      if (response.data.recovery_codes) setRecoveryCodes(response.data.recovery_codes);
      else onVerified();
    } catch (cause) { setError(getErrorMessage(cause)); }
    finally { setBusy(false); }
  };
  const setup = replacement || !identity.mfa.enrolled;
  return <Card className="mx-auto max-w-xl"><CardHeader><CardTitle>{recoveryCodes.length ? 'Save recovery codes' : setup ? 'Set up platform MFA' : 'Verify platform access'}</CardTitle></CardHeader><CardContent className="space-y-4">
    <p className="text-sm text-muted-foreground">{recoveryCodes.length ? 'Keep these one-use codes somewhere safe. They are shown only now. Losing your authenticator and these codes can lock you out.' : 'Use an authenticator app to protect internal administration. Verification lasts 15 minutes for this signed-in session.'}</p>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {expired && <p role="alert">Setup expired. Start a new setup.</p>}
    {recoveryCodes.length > 0 ? <><SecretField id="recovery-codes" label="Recovery codes" value={recoveryCodes.join('  ')} readOnly /><Button onClick={() => { setRecoveryCodes([]); onVerified(); }}>I have saved my recovery codes</Button></> : <>
      {setup && !pending && <><p className="text-sm">Add a new account in your authenticator using the setup key, then enter its six-digit code. First setup requires a sign-in within the last 10 minutes.</p><Button disabled={busy} onClick={() => void enroll()}>Set up authenticator</Button></>}
      {pending && <><SecretField id="mfa-secret" label="Authenticator setup key" value={pending.secret} readOnly /><p className="text-sm">Setup expires at {new Date(pending.expires_at).toLocaleTimeString()}. Do not share this key.</p></>}
      {(pending || !setup) && <form noValidate onSubmit={event => void verify(event)} className="space-y-4"><SecretField id="mfa-code" label={recovery && !pending ? 'Recovery code' : 'Authenticator code'} value={code} onChange={setCode} autoComplete="one-time-code" disabled={busy} /><Button disabled={busy} aria-busy={busy}>{pending ? 'Confirm authenticator' : recovery ? 'Use recovery code' : 'Verify authenticator'}</Button>{!pending && <Button type="button" variant="ghost" disabled={busy} onClick={() => { setRecovery(!recovery); setCode(''); setError(''); }}>{recovery ? 'Use authenticator instead' : 'Use a recovery code instead'}</Button>}</form>}
      {onCancel && <Button variant="ghost" disabled={busy} onClick={onCancel}>Cancel replacement</Button>}
    </>}
  </CardContent></Card>;
}
