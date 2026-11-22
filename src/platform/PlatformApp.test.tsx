import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, expect, it } from 'vitest';
import api from '@/services/apiService';
import PlatformApp from './PlatformApp';
beforeEach(() => window.history.replaceState({}, '', '/platform-admin.html'));
it('denies an HR administrator without requesting tenant data or creating HR sockets', async () => {
  api.setToken('hr-admin'); api.setOrganization('org-a');
  const paths: string[] = [];
  api.api.defaults.adapter = async config => {
    paths.push(config.url!);
    expect(config.headers['X-Organization-Id']).toBeUndefined();
    throw { config, response: { status: 403, data: { code: 'PLATFORM_ACCESS_DENIED', message: 'Platform access has not been granted.' } } };
  };
  render(<PlatformApp />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Platform access has not been granted');
  expect(paths).toEqual(['/platform/me']);
  expect(api.getToken()).toBe('hr-admin');
  expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
});
it('enrolls MFA and shows recovery codes once before exposing platform metadata', async () => {
  api.setToken('operator');
  let verified = false; let listRequested = false;
  api.api.defaults.adapter = async config => {
    const url = config.url!; let data: unknown;
    if (url === '/platform/me') data = { user: { user_id: 'operator', email: 'operator@example.test' }, roles: [], permissions: ['platform.organizations.read'], mfa: { enrolled: verified, verified, assurance_expires_at: verified ? new Date(Date.now() + 900000).toISOString() : null }, requires_mfa_enrollment: !verified };
    else if (url === '/platform/mfa/enroll') data = { secret: 'MANUALKEY', otpauth_url: 'otpauth://totp/test?secret=MANUALKEY', expires_at: new Date(Date.now()+600000).toISOString() };
    else if (url === '/platform/mfa/confirm') { expect(JSON.parse(config.data)).toEqual({ code: '123456' }); verified = true; data = { recovery_codes: ['recovery-one', 'recovery-two'], assurance_expires_at: new Date(Date.now()+900000).toISOString() }; }
    else if (url === '/platform/organizations') { listRequested = true; data = { organizations: [], pagination: { page: 1, total: 0, totalPages: 0 } }; }
    else throw new Error(`Unexpected transport ${url}`);
    return { config, data: { success: true, data }, status: 200, statusText: 'OK', headers: {} };
  };
  render(<PlatformApp />);
  fireEvent.click(await screen.findByRole('button', { name: 'Set up authenticator' }));
  expect(await screen.findByLabelText('Authenticator setup key')).toHaveAttribute('type', 'password');
  expect(listRequested).toBe(false);
  fireEvent.change(screen.getByLabelText('Authenticator code'), { target: { value: '123456' } });
  fireEvent.click(screen.getByRole('button', { name: 'Confirm authenticator' }));
  expect(await screen.findByRole('heading', { name: 'Save recovery codes' })).toBeInTheDocument();
  expect(listRequested).toBe(false);
  fireEvent.click(screen.getByRole('button', { name: 'I have saved my recovery codes' }));
  expect(await screen.findByRole('heading', { name: 'Organizations' })).toBeInTheDocument();
  expect(listRequested).toBe(true);
  expect(localStorage.getItem('recovery_codes')).toBeNull();
});
it('limits viewer actions and returns expired MFA to verification without ending the HR session', async () => {
  api.setToken('viewer');
  let expired = false;
  api.api.defaults.adapter = async config => {
    let data: unknown;
    if (config.url === '/platform/me') data = { user: { user_id: 'viewer', email: 'viewer@example.test' }, roles: [], permissions: ['platform.organizations.read', 'platform.users.read', 'platform.audit.read'], mfa: { enrolled: true, verified: !expired, assurance_expires_at: new Date(Date.now()+900000).toISOString() }, requires_mfa_enrollment: false };
    else if (config.url === '/platform/organizations') data = { organizations: [{ organization_id: 'org-a', name: 'Alpha', slug: 'alpha', status: 'active', active_member_count: 3, owner_count: 1 }], pagination: { page: 1, total: 1, totalPages: 1 } };
    else { expired = true; throw { config, response: { status: 403, data: { code: 'MFA_EXPIRED', message: 'Verify platform access again.' } } }; }
    return { config, data: { success: true, data }, status: 200, statusText: 'OK', headers: {} };
  };
  render(<PlatformApp />);
  expect(await screen.findByText('Alpha')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Suspend/ })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Role grants' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('link', { name: 'Users' }));
  expect(await screen.findByRole('button', { name: 'Verify authenticator' })).toBeInTheDocument();
  expect(api.getToken()).toBe('viewer');
});
it('requires an audit reason before an operator suspends an organization', async () => {
  api.setToken('operator'); let status = 'active';
  api.api.defaults.adapter = async config => {
    let data: unknown;
    if (config.url === '/platform/me') data = { user: { user_id: 'operator', email: 'operator@example.test' }, roles: [], permissions: ['platform.organizations.read','platform.organizations.manage'], mfa: { enrolled: true, verified: true, assurance_expires_at: new Date(Date.now()+900000).toISOString() }, requires_mfa_enrollment: false };
    else if (config.method === 'patch') { expect(config.url).toBe('/platform/organizations/org-a'); expect(JSON.parse(config.data)).toEqual({ status: 'suspended', reason: 'Security review' }); status='suspended'; data = { organization: { organization_id:'org-a', status } }; }
    else data = { organizations: [{ organization_id:'org-a', name:'Alpha', status }], pagination: { total:1,total_pages:1 } };
    return { config, data: { success:true,data }, status:200,statusText:'OK',headers:{} };
  };
  render(<PlatformApp />);
  fireEvent.click(await screen.findByRole('button', { name:'Suspend Alpha' }));
  const dialog = screen.getByRole('alertdialog');
  fireEvent.click(within(dialog).getByRole('button', { name:'Suspend organization' }));
  expect(await within(dialog).findByRole('alert')).toHaveTextContent('Enter a reason');
  expect(status).toBe('active');
  fireEvent.change(within(dialog).getByLabelText('Reason'), { target: { value:'Security review' } });
  fireEvent.click(within(dialog).getByRole('button', { name:'Suspend organization' }));
  expect(await screen.findByRole('button', { name:'Reactivate Alpha' })).toBeInTheDocument();
});
it('super admins grant a catalog role explicitly and can revoke it', async () => {
  api.setToken('super'); let granted = false; let revoked = false;
  api.api.defaults.adapter = async config => {
    let data: unknown;
    if (config.url === '/platform/me') data = { user: {user_id:'super',email:'super@example.test'},roles:[],permissions:['platform.grants.read','platform.grants.manage'],mfa:{enrolled:true,verified:true,assurance_expires_at:new Date(Date.now()+900000).toISOString()},requires_mfa_enrollment:false };
    else if (config.url === '/platform/roles') data = { roles:[{role_id:'viewer',role_key:'platform_viewer',name:'Platform viewer',permission_keys:['platform.users.read']}],permissions:['platform.users.read'] };
    else if (config.method === 'post') { expect(JSON.parse(config.data)).toEqual({user_id:'target-user',role_id:'viewer',reason:'Read-only audit access'});granted=true;data={grant:{grant_id:'g1'}}; }
    else if (config.method === 'delete') { expect(config.url).toBe('/platform/grants/g1');revoked=true;data={grant:{grant_id:'g1'}}; }
    else data={grants:granted?[{grant_id:'g1',user_id:'target-user',email:'target@example.test',role_key:'platform_viewer',status:revoked?'revoked':'active'}]:[],pagination:{total:granted?1:0,total_pages:1}};
    return {config,status:200,statusText:'OK',headers:{},data:{success:true,data}};
  };
  render(<PlatformApp />);
  fireEvent.click(await screen.findByRole('button',{name:'Grant platform role'}));
  const dialog=screen.getByRole('alertdialog');
  fireEvent.change(await within(dialog).findByLabelText('Identity ID'),{target:{value:'target-user'}});
  fireEvent.change(within(dialog).getByLabelText('Platform role'),{target:{value:'viewer'}});
  fireEvent.change(within(dialog).getByLabelText('Reason'),{target:{value:'Read-only audit access'}});
  fireEvent.click(within(dialog).getByRole('button',{name:'Grant platform role'}));
  fireEvent.click(await screen.findByRole('button',{name:'Revoke role'}));
  const revokeDialog=screen.getByRole('alertdialog');
  fireEvent.change(within(revokeDialog).getByLabelText('Reason'),{target:{value:'Audit complete'}});
  fireEvent.click(within(revokeDialog).getByRole('button',{name:'Revoke platform role'}));
  expect(await screen.findByText('revoked')).toBeInTheDocument();
});
it('uses recovery verification and replaces the authenticator only with an audit reason', async () => {
  api.setToken('operator'); let verified=false; let replacement=false;
  api.api.defaults.adapter = async config => {
    let data:unknown;
    if(config.url==='/platform/me') data={user:{user_id:'operator',email:'operator@example.test'},roles:[],permissions:['platform.organizations.read'],mfa:{enrolled:true,verified,assurance_expires_at:verified?new Date(Date.now()+900000).toISOString():null},requires_mfa_enrollment:false};
    else if(config.url==='/platform/mfa/verify'){expect(JSON.parse(config.data)).toEqual({recovery_code:'one-use-code'});verified=true;data={assurance_expires_at:new Date(Date.now()+900000).toISOString()};}
    else if(config.url==='/platform/mfa/enroll'){expect(JSON.parse(config.data)).toEqual({replace:true,reason:'New phone'});replacement=true;data={secret:'NEWKEY',expires_at:new Date(Date.now()+600000).toISOString()};}
    else data={organizations:[],pagination:{total:0,total_pages:1}};
    return {config,status:200,statusText:'OK',headers:{},data:{success:true,data}};
  };
  render(<PlatformApp />);
  fireEvent.click(await screen.findByRole('button',{name:'Use a recovery code instead'}));
  fireEvent.change(screen.getByLabelText('Recovery code'),{target:{value:'one-use-code'}});
  fireEvent.click(screen.getByRole('button',{name:'Use recovery code'}));
  fireEvent.click(await screen.findByRole('button',{name:'Replace authenticator'}));
  const dialog=screen.getByRole('alertdialog');
  fireEvent.change(within(dialog).getByLabelText('Reason'),{target:{value:'New phone'}});
  fireEvent.click(within(dialog).getByRole('button',{name:'Start replacement'}));
  fireEvent.click(await screen.findByRole('button',{name:'Set up authenticator'}));
  expect(await screen.findByLabelText('Authenticator setup key')).toHaveValue('NEWKEY');
  expect(replacement).toBe(true); expect(api.getToken()).toBe('operator');
});
it('removes platform metadata immediately when another tab removes its access token', async () => {
  api.setToken('operator');
  api.api.defaults.adapter=async config=>({config,status:200,statusText:'OK',headers:{},data:{success:true,data:config.url==='/platform/me'?{user:{user_id:'operator',email:'operator@example.test'},roles:[],permissions:['platform.organizations.read'],mfa:{enrolled:true,verified:true,assurance_expires_at:new Date(Date.now()+900000).toISOString()},requires_mfa_enrollment:false}:{organizations:[{organization_id:'a',name:'Private workspace'}],pagination:{total:1,total_pages:1}}}});
  render(<PlatformApp />);await screen.findByText('Private workspace');
  localStorage.removeItem('stechad_token');
  window.dispatchEvent(new StorageEvent('storage',{key:'stechad_token',newValue:null}));
  expect(await screen.findByRole('heading',{name:'Platform sign-in'})).toBeInTheDocument();
  expect(screen.queryByText('Private workspace')).not.toBeInTheDocument();
});
