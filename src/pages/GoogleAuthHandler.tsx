import { useEffect, useRef, useState } from 'react';
import { exchangeGoogleCode, saveIdentity } from '@/services/identityAuth';
import { getErrorMessage } from '@/lib/errors';
export default function GoogleAuthHandler() {
  const started = useRef(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const code = new URLSearchParams(window.location.search).get('code');
    window.history.replaceState({}, '', '/google-auth');
    if (!code) { setError('Google sign-in did not finish. Start sign-in again.'); return; }
    void exchangeGoogleCode(code).then(response => { saveIdentity(response.data); window.location.replace('/dashboard'); }).catch(cause => setError(getErrorMessage(cause)));
  }, []);
  return <main className="mx-auto max-w-md space-y-4 p-6"><h1>Google sign-in</h1>{error ? <><p role="alert">{error}</p><a className="text-primary underline" href="/login">Return to sign in</a></> : <p role="status">Completing Google sign-in…</p>}</main>;
}
