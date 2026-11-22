import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/apiService';
import { getErrorMessage } from '@/lib/errors';
import ReasonDialog from './ReasonDialog';
export default function GrantDialog({ onClose, onGranted, onAuthorizationChanged }: { onClose: () => void; onGranted: () => void; onAuthorizationChanged: () => void }) {
  const [roles, setRoles] = useState<{ role_id: string; name: string }[]>([]);
  const [userId, setUserId] = useState(''); const [roleId, setRoleId] = useState(''); const [error, setError] = useState('');
  useEffect(() => {
    let alive = true;
    void api.get('platform/roles').then(response => { if (alive) setRoles(response.data.roles); }).catch(cause => { if (alive) setError(getErrorMessage(cause)); });
    return () => { alive=false; };
  }, []);
  const grant = async (reason: string) => {
    if (!userId.trim() || !roleId) { document.getElementById(!userId.trim() ? 'grant-user' : 'grant-role')?.focus(); throw new Error('Enter an identity ID and choose a platform role.'); }
    try { await api.post('platform/grants', { user_id:userId.trim(),role_id:roleId,reason }); onGranted(); }
    catch(cause) { if (['MFA_REQUIRED','MFA_EXPIRED','PLATFORM_ACCESS_DENIED'].includes(cause?.code)) onAuthorizationChanged(); throw cause; }
  };
  return <ReasonDialog title="Grant platform role" action="Grant platform role" description="Grant internal administration access to an existing active, verified identity. HR roles do not change." onConfirm={grant} onClose={onClose}><div className="space-y-2"><Label htmlFor="grant-user">Identity ID</Label><Input id="grant-user" value={userId} onChange={event => setUserId(event.target.value)} /></div><div className="space-y-2"><Label htmlFor="grant-role">Platform role</Label><select id="grant-role" className="h-10 w-full rounded-md border px-3 text-sm focus-visible:outline-primary" value={roleId} onChange={event => setRoleId(event.target.value)}><option value="">Choose a role</option>{roles.map(role => <option key={role.role_id} value={role.role_id}>{role.name}</option>)}</select></div>{error && <p role="alert">{error}</p>}</ReasonDialog>;
}
