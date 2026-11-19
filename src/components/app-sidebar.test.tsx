import { expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import type { PermissionUser } from "@/lib/permissions";
import { AppSidebar } from "./app-sidebar";
const state = vi.hoisted(() => ({ user: { role: "admin", effective_permissions: ["*"] } as PermissionUser }));
vi.mock("@/hooks/useAuthContext", () => ({ useAuthContext: () => state }));
vi.mock("@/hooks/contexts/ChatContext", () => ({ useChatContext: () => ({ chats: [] }) }));
it.each(["admin", "super_admin"])("shows one Workforce and Settings destination for %s", (role) => {
  state.user = { role, effective_permissions: ["*"] };
  render(<MemoryRouter initialEntries={["/admin"]}><SidebarProvider><AppSidebar /></SidebarProvider></MemoryRouter>);
  expect(screen.getAllByRole("link", { name: "Workforce" })).toHaveLength(1);
  expect(screen.getAllByRole("link", { name: "Settings" })).toHaveLength(1);
  for (const name of ["Manage workforce", "Attendance", "Approvals", "Expenses", "My settings"]) expect(screen.queryByRole("link", { name })).not.toBeInTheDocument();
});
it("keeps delegated workforce and personal workflows for staff", () => {
  state.user = { role: "staff", effective_permissions: ["manage_staff", "approve_leave", "submit_expenses"] };
  render(<MemoryRouter><SidebarProvider><AppSidebar /></SidebarProvider></MemoryRouter>);
  for (const name of ["Manage workforce", "Attendance", "Expenses", "Settings"]) expect(screen.getByRole("link", { name })).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Approvals" })).not.toBeInTheDocument();
});
it.each(["project_manager", "staff", "talent", "custom"])("uses Workforce for approval-only %s accounts", (role) => {
  state.user = { role, effective_permissions: ["approve_leave"] };
  render(<MemoryRouter><SidebarProvider><AppSidebar /></SidebarProvider></MemoryRouter>);
  expect(screen.getByRole("link", { name: "Manage workforce" })).toHaveAttribute("href", "/workforce/manage");
  expect(screen.queryByRole("link", { name: "Approvals" })).not.toBeInTheDocument();
});
it("does not show Workforce without management or approval permissions", () => {
  state.user = { role: "project_manager", effective_permissions: ["create_projects"] };
  render(<MemoryRouter><SidebarProvider><AppSidebar /></SidebarProvider></MemoryRouter>);
  expect(screen.queryByRole("link", { name: "Manage workforce" })).not.toBeInTheDocument();
});

it("gives custom roles the employee navigation and their saved name", () => {
  state.user = { role: "finance_reviewer", role_details: { name: "Finance Reviewer", is_system: false }, effective_permissions: ["approve_leave"] };
  render(<MemoryRouter initialEntries={["/dashboard/staff"]}><SidebarProvider><AppSidebar /></SidebarProvider></MemoryRouter>);
  for (const name of ["Dashboard", "Attendance", "Leave", "KPIs", "Holidays & Birthdays", "Profile", "Messages", "Settings", "Manage workforce"]) expect(screen.getByRole("link", { name })).toBeInTheDocument();
  expect(screen.getByText("Finance Reviewer", { exact: true })).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Workforce" })).not.toBeInTheDocument();
});
