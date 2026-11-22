import { fireEvent, render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import api from '@/services/apiService';
import SessionControls from './SessionControls';
it('lists devices and revokes a selected device only after confirmation', async () => {
  api.setToken('identity'); api.setOrganization('org-a');
  let removed = false;
  api.api.defaults.adapter = async config => {
    expect(config.headers['X-Organization-Id']).toBeUndefined();
    if (config.method === 'delete') { removed = true; return { config, status: 200, statusText: 'OK', headers: {}, data: { success: true, data: { revoked: true, current_session: false } } }; }
    return { config, status: 200, statusText: 'OK', headers: {}, data: { success: true, data: { current_session_id: 'here', sessions: [{ session_id: 'here', current: true, user_agent: 'This browser', auth_method: 'password' }, ...(!removed ? [{ session_id: 'other', current: false, user_agent: 'Other browser', auth_method: 'google' }] : [])] } } };
  };
  render(<SessionControls />);
  const device = await screen.findByText('Other browser');
  fireEvent.click(within(device.closest('li')!).getByRole('button', { name: 'Revoke session' }));
  expect(removed).toBe(false);
  fireEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Revoke session' }));
  expect(await screen.findByRole('status')).toHaveTextContent('Session revoked');
  expect(screen.queryByText('Other browser')).not.toBeInTheDocument();
  expect(api.getToken()).toBe('identity');
});
