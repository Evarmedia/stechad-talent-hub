import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { afterEach, expect, it } from 'vitest';
import api from './apiService';
const ok = (config: InternalAxiosRequestConfig, data: unknown): AxiosResponse => ({ config, data, status: 200, statusText: 'OK', headers: {} });
afterEach(() => { api.clearTokens(); sessionStorage.clear(); });
it('platform metadata ignores organization selection and survives a tenant switch', async () => {
  api.setToken('identity'); api.setOrganization('org-a');
  let finish!: (value: AxiosResponse) => void;
  let sent!: InternalAxiosRequestConfig;
  api.api.defaults.adapter = config => { sent = config; return new Promise(resolve => { finish = resolve; }); };
  const request = api.get('platform/organizations');
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(sent.headers['X-Organization-Id']).toBeUndefined();
  api.setOrganization('org-b'); finish(ok(sent, { data: { organizations: [] } }));
  await expect(request).resolves.toMatchObject({ data: { organizations: [] } });
});
it('rejects global data returned after logout even if the same token signs in again', async () => {
  api.setToken('same-token');
  let finish!: (value: AxiosResponse) => void; let sent!: InternalAxiosRequestConfig;
  api.api.defaults.adapter = config => { sent = config; return new Promise(resolve => { finish = resolve; }); };
  const request = api.get('platform/users');
  const rejected = expect(request).rejects.toMatchObject({ code: 'IDENTITY_CHANGED' });
  await new Promise(resolve => setTimeout(resolve, 0));
  api.clearTokens(); api.setToken('same-token');
  finish(ok(sent, { data: { users: [{ email: 'private@example.test' }] } }));
  await rejected;
});
it('adopts the winning tab credentials after a bounded refresh rotation conflict', async () => {
  api.setToken('expired'); api.setRefreshToken('old-refresh');
  const adapter = axios.defaults.adapter;
  axios.defaults.adapter = async config => {
    setTimeout(() => {
      localStorage.setItem('stechad_token', 'winner-access');
      localStorage.setItem('stechad_refresh_token', 'winner-refresh');
      window.dispatchEvent(new StorageEvent('storage', { key: 'stechad_refresh_token', newValue: 'winner-refresh' }));
    }, 20);
    throw { config, response: { status: 409, data: { code: 'REFRESH_ALREADY_ROTATED' } } };
  };
  try {
    await expect(api.refreshAccessToken()).resolves.toBe('winner-access');
    expect(api.getRefreshToken()).toBe('winner-refresh');
  } finally { axios.defaults.adapter = adapter; }
});
it('never installs an old refresh response after logout and a new sign-in', async () => {
  api.setToken('old-access'); api.setRefreshToken('reused-fixture-refresh');
  const adapter = axios.defaults.adapter;
  let finish!: (value: AxiosResponse) => void; let sent!: InternalAxiosRequestConfig;
  axios.defaults.adapter = config => { sent = config; return new Promise(resolve => { finish = resolve; }); };
  try {
    const request = api.refreshAccessToken();
    await new Promise(resolve => setTimeout(resolve, 0));
    api.clearTokens(); api.setToken('new-identity-access'); api.setRefreshToken('reused-fixture-refresh');
    finish(ok(sent, { data: { token: 'old-response-access', refreshToken: 'old-response-refresh' } }));
    await expect(request).resolves.toBeNull();
    expect(api.getToken()).toBe('new-identity-access');
  } finally { axios.defaults.adapter = adapter; }
});
it('keeps identity credentials on MFA expiry and refresh network failures', async () => {
  api.setToken('identity'); api.setRefreshToken('refresh');
  api.api.defaults.adapter = async config => { throw { config, response: { status: 403, data: { code: 'MFA_EXPIRED', message: 'Verify again' } } }; };
  await expect(api.get('platform/users')).rejects.toMatchObject({ code: 'MFA_EXPIRED' });
  expect(api.getToken()).toBe('identity');
  const adapter = axios.defaults.adapter;
  axios.defaults.adapter = async () => { throw new Error('Offline'); };
  try { await api.refreshAccessToken(); expect(api.getRefreshToken()).toBe('refresh'); }
  finally { axios.defaults.adapter = adapter; }
});
it('revokes all devices with an expired access token without restoring logged-out credentials', async () => {
  api.setToken('expired'); api.setRefreshToken('captured-refresh');
  const adapter=axios.defaults.adapter; let revoked=false;
  axios.defaults.adapter=async config=>{
    if(config.url?.endsWith('/auth/refresh-token')) { expect(JSON.parse(config.data)).toEqual({refresh_token:'captured-refresh'});expect(api.getToken()).toBeNull();return ok(config,{data:{token:'private-access',refreshToken:'private-refresh'}}); }
    if(config.headers.Authorization==='Bearer expired')throw {config,response:{status:401,data:{message:'Expired'}}};
    expect(config.url).toMatch(/\/auth\/logout-all$/);expect(config.headers.Authorization).toBe('Bearer private-access');revoked=true;return ok(config,{data:{revoked:true}});
  };
  try { await api.endSession(true);expect(revoked).toBe(true);expect(api.getToken()).toBeNull();expect(api.getRefreshToken()).toBeNull(); }
  finally {axios.defaults.adapter=adapter;}
});
