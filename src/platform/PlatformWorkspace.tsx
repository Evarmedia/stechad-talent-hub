import GrantDialog from "./GrantDialog";
import ReasonDialog from "./ReasonDialog";
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/apiService';
import { getErrorMessage } from '@/lib/errors';
import type { PlatformIdentity } from './PlatformApp';
type View = 'organizations' | 'users' | 'grants' | 'roles' | 'audit-log';
type Row = Record<string, string | number | boolean | string[] | Record<string, unknown>>;
const pages: { view: View; label: string; permission: string; key: string; columns: [string, string][] }[] = [
  { view: 'organizations', label: 'Organizations', permission: 'platform.organizations.read', key: 'organizations', columns: [['name','Name'],['slug','Slug'],['status','Status'],['active_member_count','Active members'],['owner_count','Owners'],['created_at','Created']] },
  { view: 'users', label: 'Users', permission: 'platform.users.read', key: 'users', columns: [['email','Email'],['first_name','First name'],['last_name','Last name'],['user_id','Identity ID'],['is_active','Active'],['is_verified','Verified'],['created_at','Created']] },
  { view: 'grants', label: 'Role grants', permission: 'platform.grants.read', key: 'grants', columns: [['email','Email'],['user_id','Identity ID'],['role_key','Role'],['status','Status'],['granted_by','Granted by'],['created_at','Created']] },
  { view: 'roles', label: 'Role catalog', permission: 'platform.grants.read', key: 'roles', columns: [['name','Name'],['role_key','Role key'],['permission_keys','Permissions']] },
  { view: 'audit-log', label: 'Audit log', permission: 'platform.audit.read', key: 'entries', columns: [['occurred_at','Time'],['actor_name','Actor'],['action','Action'],['target_type','Target type'],['target_id','Target ID'],['outcome','Outcome'],['changes','Details']] },
];
const authCodes = ['MFA_SETUP_REQUIRED','MFA_REQUIRED','MFA_EXPIRED','SESSION_UPGRADE_REQUIRED','PLATFORM_ACCESS_DENIED','EMAIL_VERIFICATION_REQUIRED'];
export default function PlatformWorkspace({ identity, onAuthorizationChanged }: { identity: PlatformIdentity; onAuthorizationChanged: () => void }) {
  const allowed = pages.filter(page => identity.permissions.includes(page.permission));
  const initial = new URLSearchParams(window.location.search);
  const [view, setView] = useState<View>(() => (allowed.find(page => page.view === initial.get('view')) || allowed[0])?.view || 'organizations');
  const [page, setPage] = useState(Math.max(1, Number(initial.get('page')) || 1));
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [items, setItems] = useState<Row[]>([]);
  const [pagination, setPagination] = useState({ total: 0, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [action, setAction] = useState<{ row: Row; title: string; description: string; payload?: Record<string, unknown> } | null>(null);
  const [grantOpen, setGrantOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [reload, setReload] = useState(0);
  const sequence = useRef(0);
  const definition = allowed.find(item => item.view === view);
  const fail = useCallback((cause: unknown) => {
    if (authCodes.includes((cause as { code?: string })?.code)) onAuthorizationChanged();
    else setError(getErrorMessage(cause));
  }, [onAuthorizationChanged]);
  useEffect(() => {
    const request = ++sequence.current;
    setItems([]); setLoading(true); setError('');
    if (!definition) { setLoading(false); setError('This view is not available for your platform role.'); return; }
    document.title = `${definition.label} | STECHAD internal administration`;
    const params = new URLSearchParams({ view, page: String(page) });
    window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
    const filter = view === 'audit-log' ? { action: query } : view === 'grants' ? { user_id: query } : { search: query, status };
    void api.get(`platform/${view}`, { page, limit: 20, ...filter }).then(response => {
      if (request !== sequence.current) return;
      setItems(response.data[definition.key] || []);
      const next = response.data.pagination || { total: response.data[definition.key]?.length || 0, total_pages: 1 };
      setPagination(next);
      if (page > Math.max(1, next.total_pages || 1)) setPage(Math.max(1, next.total_pages || 1));
    }).catch(cause => { if (request === sequence.current) fail(cause); }).finally(() => { if (request === sequence.current) setLoading(false); });
    return () => { sequence.current += 1; };
  }, [view, page, query, status, reload, definition, fail]);
  const canManage = identity.permissions.includes(view === 'organizations' ? 'platform.organizations.manage' : view === 'users' ? 'platform.users.manage' : view === 'grants' ? 'platform.grants.manage' : '');
  const requestAction = (row: Row) => {
    if (view === 'organizations') {
      const verb = row.status === 'active' ? 'Suspend' : 'Reactivate';
      setAction({ row, title: `${verb} organization`, description: `${verb} ${row.name}? Suspension removes access to this organization's workspace. Other organizations remain available.`, payload: { status: row.status === 'active' ? 'suspended' : 'active' } });
    } else if (view === 'users') {
      const verb = row.is_active ? 'Suspend' : 'Reactivate';
      setAction({ row, title: `${verb} identity`, description: `${verb} ${row.email}? Suspension signs out all this identity's devices across every organization.`, payload: { is_active: !row.is_active } });
    } else setAction({ row, title: 'Revoke platform role', description: `Revoke ${row.role_key} from ${row.email || row.user_id}? Platform access changes immediately.` });
  };
  const mutate = async (reason: string) => {
    if (!action) return;
    const id = String(action.row.organization_id || action.row.user_id);
    try {
      await api.request(`/platform/${view}/${view === 'grants' ? action.row.grant_id : id}`, { method: view === 'grants' ? 'DELETE' : 'PATCH', data: { ...action.payload, reason } });
      setMessage(`${action.title} completed.`); setReload(count => count + 1);
    } catch (cause) { if (authCodes.includes(cause?.code)) onAuthorizationChanged(); throw cause; }
  };
  const navigate = (next: View) => { setView(next); setPage(1); setSearch(''); setQuery(''); setStatus(''); setMessage(''); };
  const value = (row: Row, key: string) => {
    const entry = row[key];
    if (entry === undefined || entry === null || entry === '') return '—';
    if (typeof entry === 'boolean') return entry ? 'Yes' : 'No';
    if (key.endsWith('_at')) return new Date(String(entry)).toLocaleString();
    if (Array.isArray(entry)) return entry.join(', ');
    if (typeof entry === 'object') return Object.entries(entry).map(([name, detail]) => `${name}: ${String(detail)}`).join('; ');
    return String(entry);
  };
  return <div className="space-y-6"><nav aria-label="Platform administration" className="flex flex-wrap gap-2 border-b pb-4">{allowed.map(item => <a key={item.view} href={`?view=${item.view}`} aria-current={view === item.view ? 'page' : undefined} className={`rounded-md px-3 py-2 text-sm hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${view === item.view ? 'bg-primary text-white hover:bg-primary/90' : 'text-foreground'}`} onClick={event => { event.preventDefault(); navigate(item.view); }}>{item.label}</a>)}</nav>
    <Card><CardHeader><h1 tabIndex={-1} className="text-2xl font-semibold">{definition?.label || 'Platform access'}</h1></CardHeader><CardContent className="space-y-4">
      {view === 'grants' && canManage && <Button onClick={() => setGrantOpen(true)}>Grant platform role</Button>}
      {view !== 'roles' && <form noValidate className="flex flex-wrap items-end gap-3" onSubmit={event => { event.preventDefault(); setQuery(search.trim()); setPage(1); }}><div className="min-w-0 flex-1 space-y-2"><Label htmlFor="platform-search">{view === 'audit-log' ? 'Filter by action' : view === 'grants' ? 'Filter by identity ID' : 'Search'}</Label><div className="flex gap-2"><Input id="platform-search" value={search} onChange={event => setSearch(event.target.value)} />{search && <Button type="button" variant="ghost" onClick={() => { setSearch(''); setQuery(''); setPage(1); document.getElementById('platform-search')?.focus(); }}>Clear search</Button>}</div></div>{(view === 'organizations' || view === 'users') && <div className="space-y-2"><Label htmlFor="platform-status">Status</Label><select id="platform-status" className="h-10 rounded-md border px-3 text-sm focus-visible:outline-primary" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="">All statuses</option><option value="active">Active</option><option value="suspended">Suspended</option></select></div>}<Button>Search</Button></form>}
      {message && <p role="status" className="text-sm">{message}</p>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {loading && <p role="status">Loading {definition?.label.toLowerCase()}…</p>}
      <div className="min-h-40 overflow-x-auto rounded-md border" tabIndex={0} role="region" aria-label={`${definition?.label || 'Platform'} table`}><table aria-label={definition?.label} className="w-full text-left text-sm"><thead className="bg-muted"><tr>{definition?.columns.map(([key, label]) => <th key={key} className="p-3 font-medium" scope="col">{label}</th>)}{canManage && <th scope="col" className="p-3">Actions</th>}</tr></thead><tbody>{items.map((row, index) => <tr key={String(row.organization_id || row.grant_id || row.user_id || row.role_id || row.audit_log_id || index)} className="border-t">{definition?.columns.map(([key]) => <td key={key} className="max-w-sm whitespace-normal break-words p-3 align-top">{value(row,key)}</td>)}{canManage && <td className="p-3 align-top">{(view !== 'grants' || row.status === 'active') && <Button variant="outline" onClick={() => requestAction(row)}>{view === 'grants' ? 'Revoke role' : `${(view === 'users' ? row.is_active : row.status === 'active') ? 'Suspend' : 'Reactivate'} ${row.name || row.email}`}</Button>}</td>}</tr>)}</tbody></table>{!loading && !error && items.length === 0 && <p className="p-6 text-sm">{query || status ? 'No matching results. Clear filters to try again.' : 'No records to display.'}</p>}</div>
      <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm">{pagination.total} {pagination.total === 1 ? 'record' : 'records'} · Page {page} of {Math.max(1,pagination.total_pages || 1)}</p><div className="flex flex-wrap gap-2"><Button variant="ghost" disabled={loading} onClick={() => setReload(count => count+1)}>Refresh</Button>{view !== 'roles' && <><Button variant="outline" disabled={loading || page <= 1} onClick={() => setPage(page-1)}>Previous page</Button><Button variant="outline" disabled={loading || page >= (pagination.total_pages || 1)} onClick={() => setPage(page+1)}>Next page</Button></>}</div></div>
    </CardContent></Card>
    {grantOpen && <GrantDialog onClose={() => setGrantOpen(false)} onGranted={() => { setReload(count => count+1); setMessage('Platform role granted.'); }} onAuthorizationChanged={onAuthorizationChanged} />}
    {action && <ReasonDialog title={action.title} description={action.description} action={action.title} onConfirm={mutate} onClose={() => setAction(null)} />}
  </div>;
}
