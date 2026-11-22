import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { AuthProvider, useAuthContext } from "@/hooks/useAuthContext";
import api from "@/services/apiService";
import OrganizationBoundary from "./OrganizationBoundary";
import OrganizationSwitcher from "./OrganizationSwitcher";
import { useState } from "react";
const organizations = [{ organization_id: "a", name: "Stechad" }, { organization_id: "b", name: "Other company" }];
const identity = { user_id: "shared", first_name: "Sam", email: "sam@example.test" };
let revoked = false;
beforeEach(() => {
  sessionStorage.clear(); api.setToken("identity-token"); revoked = false;
  api.api.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
    const org = config.headers["X-Organization-Id"];
    const active = revoked ? null : org || null;
    return { config, status: 200, statusText: "OK", headers: {}, data: { success: true, data: { user: { ...identity, role: active === "a" ? "admin" : active === "b" ? "staff" : null, effective_permissions: active === "a" ? ["*"] : [] }, organizations: revoked ? [organizations[1]] : organizations, active_organization_id: active } } };
  };
});
function Workspace() {
  const { user } = useAuthContext();
  const [draft, setDraft] = useState("");
  const cache = useQueryClient();
  return <><OrganizationSwitcher /><h1>{user.role} workspace</h1><input aria-label="Tenant draft" value={draft} onChange={(event) => { setDraft(event.target.value); cache.setQueryData(["payroll"], event.target.value); }} /><p>{String(cache.getQueryData(["payroll"]) || "No saved payroll")}</p></>;
}
function show() { const client = new QueryClient(); return render(<MemoryRouter><QueryClientProvider client={client}><AuthProvider><OrganizationBoundary><Workspace /></OrganizationBoundary></AuthProvider></QueryClientProvider></MemoryRouter>); }
it("requires a choice for multiple memberships then switches role and clears mounted tenant state and cache", async () => {
  show();
  expect(await screen.findByRole("heading", { name: "Choose an organization" })).toBeInTheDocument();
  expect(screen.queryByText("admin workspace")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Stechad" }));
  expect(await screen.findByRole("heading", { name: "admin workspace" })).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("Tenant draft"), { target: { value: "A payroll" } });
  fireEvent.change(screen.getByLabelText("Organization"), { target: { value: "b" } });
  expect(await screen.findByRole("heading", { name: "staff workspace" })).toBeInTheDocument();
  expect(screen.getByLabelText("Tenant draft")).toHaveValue(""); expect(screen.getByText("No saved payroll")).toBeInTheDocument();
  expect(api.getOrganization()).toBe("b"); expect(api.getToken()).toBe("identity-token");
});
it("drops revoked HR authority while preserving the global login and another organization choice", async () => {
  api.setOrganization("a"); show();
  await screen.findByRole("heading", { name: "admin workspace" });
  revoked = true;
  window.dispatchEvent(new CustomEvent("stechad:organization-unavailable"));
  expect(await screen.findByRole("heading", { name: "Choose an organization" })).toBeInTheDocument();
  await waitFor(() => expect(screen.queryByRole("button", { name: "Stechad" })).not.toBeInTheDocument());
  expect(screen.getByRole("button", { name: "Other company" })).toBeInTheDocument(); expect(api.getToken()).toBe("identity-token");
});

it("keeps an active membership without an HR profile at organization selection", async () => {
  api.api.defaults.adapter = async (config: InternalAxiosRequestConfig) => ({ config, status: 200, statusText: "OK", headers: {}, data: { success: true, data: { user: { ...identity, role: null, effective_permissions: [] }, organizations, active_organization_id: "a" } } });
  show();
  expect(await screen.findByRole("heading", { name: "Choose an organization" })).toBeInTheDocument();
  expect(screen.getByText(/HR access is unavailable/)).toBeInTheDocument();
  expect(screen.queryByLabelText("Tenant draft")).not.toBeInTheDocument();
  expect(api.getToken()).toBe("identity-token");
});

it("opens the migrated single-organization workspace with an explicit selection", async () => {
  api.api.defaults.adapter = async (config: InternalAxiosRequestConfig) => ({ config, status: 200, statusText: "OK", headers: {}, data: { success: true, data: { user: { ...identity, role: "staff", effective_permissions: [] }, organizations: [organizations[0]], active_organization_id: "a" } } });
  show();
  expect(await screen.findByRole("heading", { name: "staff workspace" })).toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "Choose an organization" })).not.toBeInTheDocument();
  expect(api.getOrganization()).toBe("a");
});
