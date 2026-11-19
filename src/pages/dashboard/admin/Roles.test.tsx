import { beforeEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Roles from "./Roles";
import Workforce from "./Workforce";
const state = vi.hoisted(() => ({ user: { role: "super_admin", effective_permissions: ["*"] }, get: vi.fn(), post: vi.fn(), put: vi.fn() }));
vi.mock("@/hooks/useAuthContext", () => ({ useAuthContext: () => state }));
vi.mock("@/services/apiService", () => ({ default: { get: state.get, post: state.post, put: state.put } }));
const custom = { role_id: "finance-role", role_key: "finance", name: "Finance Reviewer", is_system: false, permission_keys: ["approve_leave"] };
const roles = [{ role_id: "staff-role", role_key: "staff", name: "Staff", is_system: true, permission_keys: [] }, custom];
const catalog = [{ permission_key: "create_projects", name: "Create projects" }, { permission_key: "approve_leave", name: "Approve leave" }];
const person = { id: "person", name: "Employee", email: "person@example.test", roleId: "finance-role", roleKey: "finance", status: "Active", permissions: [], employment: { user_id: "person", email: "person@example.test" } };
beforeEach(() => { vi.clearAllMocks(); vi.spyOn(window, "scrollTo").mockImplementation(() => {}); state.user = { role: "super_admin", effective_permissions: ["*"] }; state.get.mockImplementation(async (path: string) => path === "admin/roles" ? { data: roles, permission_catalog: catalog } : { data: { staff: [person], roles, permissions: catalog.map((item) => ({ id: item.permission_key, key: item.permission_key, name: item.name, staff: false })), departments: [], kpiLibrary: [] } }); state.post.mockResolvedValue({ success: true }); state.put.mockResolvedValue({ success: true }); });
it("creates and edits a custom role with its own permissions", async () => {
  render(<Roles />); await screen.findByText("Finance Reviewer");
  fireEvent.change(screen.getByLabelText("Role name"), { target: { value: "Delivery Reviewer" } });
  fireEvent.click(screen.getByRole("checkbox", { name: "Create projects" }));
  fireEvent.click(screen.getByRole("button", { name: "Create role" }));
  await waitFor(() => expect(state.post).toHaveBeenCalledWith("admin/roles", expect.objectContaining({ name: "Delivery Reviewer", permission_keys: ["create_projects"] })));
  await waitFor(() => expect(screen.getByLabelText("Role name")).toHaveValue(""));
  fireEvent.click(screen.getByTitle("Edit Finance Reviewer")); expect(screen.getByRole("checkbox", { name: "Approve leave" })).toBeChecked();
  fireEvent.click(screen.getByRole("checkbox", { name: "Create projects" })); fireEvent.click(screen.getByRole("button", { name: "Save role" }));
  await waitFor(() => expect(state.put).toHaveBeenCalledWith("admin/roles", "finance-role", expect.objectContaining({ permission_keys: ["approve_leave", "create_projects"] })));
});
it("offers saved custom roles for assignment and invitations", async () => {
  render(<MemoryRouter><Workforce /></MemoryRouter>); await screen.findByRole("combobox", { name: "Role for Employee" });
  expect(screen.getByRole("combobox", { name: "Role for Employee" })).toHaveValue("finance");
  expect(within(screen.getByRole("combobox", { name: "Role for Employee" })).getByRole("option", { name: "Finance Reviewer" })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Invite member" }));
  expect(within(screen.getByLabelText("Role", { exact: true })).getByRole("option", { name: "Finance Reviewer" })).toBeInTheDocument();
});
it.each(["admin", "super_admin"])("shows custom role permissions with correct editing rights for %s", async (role) => {
  state.user.role = role; render(<MemoryRouter initialEntries={["/admin/workforce?tab=permissions"]}><Workforce /></MemoryRouter>);
  const toggle = await screen.findByRole("switch", { name: "Create projects for Finance Reviewer" });
  if (role === "admin") expect(toggle).toBeDisabled();
  else { fireEvent.click(toggle); await waitFor(() => expect(state.put).toHaveBeenCalledWith("admin/roles", "finance-role", { permission_keys: ["approve_leave", "create_projects"] })); }
});
