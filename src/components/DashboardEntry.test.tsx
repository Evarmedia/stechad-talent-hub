import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/useAuthContext';
import api from '@/services/apiService';
import { saveIdentity } from '@/services/identityAuth';
import OrganizationBoundary from './OrganizationBoundary';
import ProtectedRoute from './ProtectedRoute';
function Destination() { return <h1>{useLocation().pathname}</h1>; }
function show(role: string | null, onboarded = true, multiple = false) {
  // The successful code-exchange payload is stored before the callback navigates.
  saveIdentity({token:'google-managed',refreshToken:'google-refresh',user:{user_id:'google-user'}});
  api.setOrganization(null);
  api.api.defaults.adapter = async config => {
    const selected = multiple ? config.headers['X-Organization-Id'] || null : 'a';
    return {config,status:200,statusText:'OK',headers:{},data:{success:true,data:{user:{user_id:'google-user',role:selected ? role : null,talent:{is_onboarded:onboarded}},organizations:[{organization_id:'a',name:'Alpha'},...(multiple?[{organization_id:'b',name:'Beta'}]:[])],active_organization_id:selected}}};
  };
  render(<MemoryRouter initialEntries={['/dashboard']}><QueryClientProvider client={new QueryClient()}><AuthProvider><OrganizationBoundary><Routes><Route path="/dashboard" element={<ProtectedRoute><p>Unresolved callback</p></ProtectedRoute>} /><Route path="*" element={<Destination />} /></Routes></OrganizationBoundary></AuthProvider></QueryClientProvider></MemoryRouter>);
}
it.each([['staff','/dashboard/staff'],['project_manager','/dashboard/pm'],['admin','/admin'],['super_admin','/admin'],['talent','/dashboard/talent']])('routes a completed Google callback to the %s home', async (role, destination) => {
  show(role); expect(await screen.findByRole('heading', {name:destination})).toBeInTheDocument();
});
it('keeps talent onboarding ahead of the Google callback dashboard', async () => {
  show('talent', false); expect(await screen.findByRole('heading',{name:'/onboarding'})).toBeInTheDocument();
});
it('keeps multiple-organization selection before resolving the Google dashboard', async () => {
  show('staff', true, true);
  expect(await screen.findByRole('heading',{name:'Choose an organization'})).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Beta'}));
  expect(await screen.findByRole('heading',{name:'/dashboard/staff'})).toBeInTheDocument();
  expect(api.getOrganization()).toBe('b');
});
