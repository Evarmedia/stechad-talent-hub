import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import api from '@/services/apiService';
import GrantDialog from './GrantDialog';
it('focuses invalid fields in displayed order: identity, role, then reason', async () => {
  api.setToken('operator');
  api.api.defaults.adapter = async config => ({config,status:200,statusText:'OK',headers:{},data:{data:{roles:[{role_id:'viewer',name:'Viewer'}]}}});
  render(<GrantDialog onClose={vi.fn()} onGranted={vi.fn()} onAuthorizationChanged={vi.fn()} />);
  await screen.findByRole('option', {name:'Viewer'});
  fireEvent.click(screen.getByRole('button', {name:'Grant platform role'}));
  expect(screen.getByLabelText('Identity ID')).toHaveFocus();
  expect(screen.getByLabelText('Identity ID')).toHaveAttribute('aria-invalid', 'true');
  fireEvent.change(screen.getByLabelText('Identity ID'), {target:{value:'identity-id'}});
  fireEvent.click(screen.getByRole('button', {name:'Grant platform role'}));
  expect(screen.getByLabelText('Platform role')).toHaveFocus();
  fireEvent.change(screen.getByLabelText('Platform role'), {target:{value:'viewer'}});
  fireEvent.click(screen.getByRole('button', {name:'Grant platform role'}));
  await waitFor(() => expect(screen.getByLabelText('Reason')).toHaveFocus());
});
