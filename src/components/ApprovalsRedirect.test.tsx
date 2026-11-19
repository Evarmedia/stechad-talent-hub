import { expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import ApprovalsRedirect from "./ApprovalsRedirect";
import ProtectedRoute from "./ProtectedRoute";
import { workforcePermissions } from "@/lib/permissions";
const state = vi.hoisted(() => ({ user: { role: "project_manager", effective_permissions: ["approve_leave"], talent: { is_onboarded: true } } }));
vi.mock("@/hooks/useAuthContext", () => ({ useAuthContext: () => ({ ...state, loading: false }) }));
function Target() { const location = useLocation(); return <p>{location.pathname}{location.search}</p>; }
function show(path: string) { return render(<MemoryRouter initialEntries={[path]}><Routes>{["/approvals", "/dashboard/pm/approvals", "/dashboard/staff/approvals"].map((path) => <Route key={path} path={path} element={<ProtectedRoute><ApprovalsRedirect /></ProtectedRoute>} />)}<Route path="/workforce/manage" element={<ProtectedRoute anyPermissions={workforcePermissions}><Target /></ProtectedRoute>} /><Route path="/admin/workforce" element={<Target />} /></Routes></MemoryRouter>); }
it.each(["project_manager", "staff", "talent", "custom", "admin", "super_admin"])("redirects every legacy approval URL for %s", (role) => {
  state.user = { ...state.user, role, effective_permissions: ["approve_leave"] };
  for (const path of ["/approvals", "/dashboard/pm/approvals", "/dashboard/staff/approvals"]) {
    const view = show(path); expect(screen.getByText(role === "admin" || role === "super_admin" ? "/admin/workforce?tab=approvals" : "/workforce/manage?tab=approvals")).toBeInTheDocument(); view.unmount();
  }
});
it("does not let a legacy link bypass the target permission guard", () => {
  state.user = { ...state.user, role: "project_manager", effective_permissions: [] }; show("/dashboard/pm/approvals");
  expect(screen.getByRole("alert")).toHaveTextContent("Access denied");
});
