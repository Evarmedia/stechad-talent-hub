import { beforeEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import Management from "./Management";
import ProtectedRoute from "@/components/ProtectedRoute";
import { approvalPermissions, workforcePermissions } from "@/lib/permissions";
const state = vi.hoisted(() => ({ user: { role: "project_manager", effective_permissions: [] as string[] }, get: vi.fn() }));
vi.mock("@/hooks/useAuthContext", () => ({ useAuthContext: () => ({ ...state, loading: false }) }));
vi.mock("@/services/apiService", () => ({ default: { get: state.get } }));
function Content() { const location = useLocation(); return <><output aria-label="Location">{location.pathname}{location.search}</output><ProtectedRoute anyPermissions={workforcePermissions}><Management /></ProtectedRoute></>; }
const show = (path = "/workforce/manage?tab=approvals") => render(<MemoryRouter initialEntries={[path]}><Content /></MemoryRouter>);
beforeEach(() => { vi.clearAllMocks(); state.user = { role: "project_manager", effective_permissions: [] }; state.get.mockResolvedValue({ data: [] }); });
it.each(approvalPermissions)("opens an approval-only workspace for %s without workforce lookups", async (permission) => {
  state.user.effective_permissions = [permission]; show();
  expect(await screen.findByText("No requests currently need your approval.")).toBeInTheDocument();
  expect(screen.getAllByRole("tab")).toHaveLength(1); expect(screen.getByRole("tab", { name: "Approvals" })).toHaveAttribute("data-state", "active");
  expect(state.get).toHaveBeenCalledWith("staff/approvals", {});
  expect(state.get.mock.calls.every(([path]) => path === "staff/approvals")).toBe(true);
});
it("does not fetch approvals until its tab is selected", async () => {
  state.user.effective_permissions = ["manage_staff", "approve_leave"]; show("/workforce/manage");
  await waitFor(() => expect(state.get).toHaveBeenCalledWith("workforce/management/users", {}));
  expect(state.get.mock.calls.some(([path]) => path === "staff/approvals")).toBe(false);
  fireEvent.mouseDown(screen.getByRole("tab", { name: "Approvals" }), { button: 0, ctrlKey: false });
  expect(await screen.findByText("No requests currently need your approval.")).toBeInTheDocument();
  expect(screen.getByLabelText("Location")).toHaveTextContent("?tab=approvals");
});
it("falls back to a permitted tab when approval access is revoked", async () => {
  state.user.effective_permissions = ["manage_staff", "approve_leave"]; const view = show();
  await screen.findByText("No requests currently need your approval.");
  const calls = state.get.mock.calls.filter(([path]) => path === "staff/approvals").length;
  state.user = { ...state.user, effective_permissions: ["manage_staff"] }; view.rerender(<MemoryRouter><Content /></MemoryRouter>);
  await waitFor(() => expect(screen.getByLabelText("Location")).toHaveTextContent("?tab=people"));
  expect(screen.queryByRole("tab", { name: "Approvals" })).not.toBeInTheDocument();
  expect(state.get.mock.calls.filter(([path]) => path === "staff/approvals")).toHaveLength(calls);
});
it("denies the workspace when its last permission is removed", async () => {
  state.user.effective_permissions = ["approve_leave"]; const view = show();
  await screen.findByText("No requests currently need your approval.");
  state.user = { ...state.user, effective_permissions: [] }; view.rerender(<MemoryRouter><Content /></MemoryRouter>);
  expect(screen.getByRole("alert")).toHaveTextContent("Access denied"); expect(screen.queryByRole("tab")).not.toBeInTheDocument();
});
it("hides an ungranted tab and corrects a bookmarked selection", async () => {
  state.user.effective_permissions = ["manage_departments"]; show();
  await waitFor(() => expect(screen.getByLabelText("Location")).toHaveTextContent("?tab=departments"));
  expect(screen.queryByRole("tab", { name: "Approvals" })).not.toBeInTheDocument();
  expect(state.get.mock.calls.some(([path]) => path === "staff/approvals")).toBe(false);
});
