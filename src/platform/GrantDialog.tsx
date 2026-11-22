import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/apiService';
import { getErrorMessage } from '@/lib/errors';
import ReasonDialog from './ReasonDialog';
export default function GrantDialog({ onClose, onGranted, onAuthorizationChanged }: { onClose: () => void; onGranted: () => void; onAuthorizationChanged: () => void }) {
  const [roles, setRoles] = useState<{ role_id: string; name: string }[]>([]);
  const [userId, setUserId] = useState(''); const [roleId, setRoleId] = useState(''); const [error, setError] = useState('');
  const [invalid, setInvalid] = useState('');
  useEffect(() => {
    let alive = true;
    void api.get('platform/roles').then(response => { if (alive) setRoles(response.data.roles); }).catch(cause => { if (alive) setError(getErrorMessage(cause)); });
    return () => { alive=false; };
  }, []);
  const validate = () => {
    const field = !userId.trim() ? 'grant-user' : !roleId ? 'grant-role' : '';
    setInvalid(field);
    setError(field === 'grant-user' ? 'Enter an identity ID.' : field ? 'Choose a platform role.' : '');
    if (field) document.getElementById(field)?.focus();
    return !field;
  };
  const grant = async (reason: string) => {
    try { await api.post('platform/grants', { user_id:userId.trim(),role_id:roleId,reason }); onGranted(); }
    catch(cause) { if (['MFA_REQUIRED','MFA_EXPIRED','PLATFORM_ACCESS_DENIED'].includes(cause?.code)) onAuthorizationChanged(); throw cause; }
  };
  return <ReasonDialog title="Grant platform role" action="Grant platform role" description="Grant internal administration access to an existing active, verified identity. HR roles do not change." onConfirm={grant} onClose={onClose} validate={validate}><div className="space-y-2"><Label htmlFor="grant-user">Identity ID</Label><Input id="grant-user" aria-invalid={invalid === 'grant-user'} aria-describedby={invalid === 'grant-user' ? 'grant-error' : undefined} value={userId} onChange={event => setUserId(event.target.value)} /></div><div className="space-y-2"><Label htmlFor="grant-role">Platform role</Label><select id="grant-role" aria-invalid={invalid === 'grant-role'} aria-describedby={invalid === 'grant-role' ? 'grant-error' : undefined} className="h-10 w-full rounded-md border px-3 text-sm focus-visible:outline-primary" value={roleId} onChange={event => setRoleId(event.target.value)}><option value="">Choose a role</option>{roles.map(role => <option key={role.role_id} value={role.role_id}>{role.name}</option>)}</select></div>{error && <p id="grant-error" role="alert">{error}</p>}</ReasonDialog>;
}
