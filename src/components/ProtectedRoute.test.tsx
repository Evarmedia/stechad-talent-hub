import { it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
const state = vi.hoisted(() => ({ user: { role: "staff", effective_permissions: [] as string[], talent: undefined as undefined | { is_onboarded: boolean } } }));
vi.mock("@/hooks/useAuthContext", () => ({ useAuthContext: () => ({ user: state.user, loading: false }) }));
it("denies direct feature routes without grants", () => {
  state.user = { role: "staff", effective_permissions: [], talent: undefined };
  render(<MemoryRouter><ProtectedRoute requiredPermission="create_projects"><button>Create project</button></ProtectedRoute></MemoryRouter>);
  expect(screen.getByRole("alert")).toHaveTextContent("Access denied"); expect(screen.queryByRole("button")).not.toBeInTheDocument();
});
it("opens a granted feature for a regular user", () => {
  state.user = { role: "staff", effective_permissions: ["create_project"], talent: undefined };
  render(<MemoryRouter><ProtectedRoute requiredPermission="create_projects"><button>Create project</button></ProtectedRoute></MemoryRouter>);
  expect(screen.getByRole("button", { name: "Create project" })).toBeInTheDocument();
});
it("allows personal settings before talent onboarding", () => {
  state.user = { role: "talent", effective_permissions: [], talent: { is_onboarded: false } };
  render(<MemoryRouter initialEntries={["/settings"]}><ProtectedRoute><h1>My settings</h1></ProtectedRoute></MemoryRouter>);
  expect(screen.getByRole("heading", { name: "My settings" })).toBeInTheDocument();
});
function Destination() { const location = useLocation(); return <p>{location.pathname}{location.search}</p>; }
it.each(["admin", "super_admin"])("redirects obsolete personal and duplicate routes for %s", (role) => {
  state.user = { role, effective_permissions: [], talent: undefined };
  const paths = [["/settings", "/admin/settings"], ["/workforce/manage", "/admin/workforce"], ["/approvals", "/admin/workforce?tab=approvals"], ["/attendance", "/admin"], ["/expenses", "/admin"]];
  for (const [path, destination] of paths) {
    const view = render(<MemoryRouter initialEntries={[path]}><Routes><Route path={path} element={<ProtectedRoute requiredPermission="not_granted"><p>Obsolete form</p></ProtectedRoute>} /><Route path="*" element={<Destination />} /></Routes></MemoryRouter>);
    expect(screen.getByText(destination)).toBeInTheDocument(); expect(screen.queryByText("Obsolete form")).not.toBeInTheDocument(); view.unmount();
  }
});

it("admits a known custom employee to staff pages without opening admin routes", () => {
  const custom = { role: "finance_reviewer", role_details: { name: "Finance Reviewer", is_system: false }, effective_permissions: [], talent: undefined };
  Object.assign(state.user, custom);
  const view = render(<MemoryRouter><ProtectedRoute requiredRole="staff" allowCustomEmployee><h1>Employee profile</h1></ProtectedRoute></MemoryRouter>);
  expect(screen.getByRole("heading", { name: "Employee profile" })).toBeInTheDocument(); view.unmount();
  render(<MemoryRouter><Routes><Route path="/" element={<ProtectedRoute requiredRole="admin"><h1>Admin</h1></ProtectedRoute>} /><Route path="/login" element={<h1>Login</h1>} /></Routes></MemoryRouter>);
  expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
});
