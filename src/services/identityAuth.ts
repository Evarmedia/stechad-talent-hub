import api from './apiService';
const verifierKey = 'stechad_google_pkce_verifier';
const base64url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
export async function googleSignInUrl(returnTo: '/google-auth' | '/platform-admin.html' = '/google-auth') {
  const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  sessionStorage.setItem(verifierKey, verifier);
  const params = new URLSearchParams({ code_challenge: base64url(new Uint8Array(digest)), return_to: returnTo });
  return `${api.baseURL}/auth/google?${params}`;
}
export async function exchangeGoogleCode(code: string) {
  const verifier = sessionStorage.getItem(verifierKey);
  sessionStorage.removeItem(verifierKey);
  if (!code || !verifier) throw new Error('This Google sign-in attempt has expired. Start sign-in again in this tab.');
  return api.post('auth/oauth/exchange', { code, code_verifier: verifier });
}
export function saveIdentity(data: { token: string; refreshToken: string; user: { user_id: string } }) {
  api.setToken(data.token); api.setRefreshToken(data.refreshToken);
  localStorage.setItem('stechad_user', JSON.stringify({ user_id: data.user.user_id }));
}
