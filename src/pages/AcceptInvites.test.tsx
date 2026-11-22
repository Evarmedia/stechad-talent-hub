import Login from "./Login";
import { beforeEach, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/useAuthContext";
import OrganizationBoundary from "@/components/OrganizationBoundary";
import AcceptInvites from "./AcceptInvites";
import api from "@/services/apiService";
import type { InternalAxiosRequestConfig } from "axios";
const token = "single-use-invitation-token";
const identity = { user_id: "shared", email: "sam@example.test", role: null };
let acceptanceUrl: string;
let submitted: { payload: Record<string, unknown>; bearer: string };
beforeEach(() => {
  sessionStorage.clear();
  api.api.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
    let data: unknown;
    if (config.url.includes("accept-invite")) {
      acceptanceUrl = config.url;
      submitted = { payload: JSON.parse(config.data), bearer: String(config.headers.Authorization || "") };
      data = { organization_id: "b" };
    } else {
      const active = config.headers["X-Organization-Id"];
      data = { ...(config.url.endsWith("/auth/login") ? { token: "existing-identity" } : {}), user: { ...identity, role: active ? "staff" : null }, organizations: [{ organization_id: "a", name: "Stechad" }, { organization_id: "b", name: "Other company" }], active_organization_id: active || null };
    }
    return { config, data: { success: true, data }, status: 200, statusText: "OK", headers: {} };
  };
});
function show() { return render(<MemoryRouter initialEntries={[`/accept-invite?token=${token}`]}><QueryClientProvider client={new QueryClient()}><AuthProvider><OrganizationBoundary><Routes><Route path="/accept-invite" element={<AcceptInvites />} /><Route path="/login" element={<Login />} /><Route path="/dashboard/staff" element={<h1>Joined organization</h1>} /></Routes></OrganizationBoundary></AuthProvider></QueryClientProvider></MemoryRouter>); }
it("lets an authenticated existing identity accept without changing a password", async () => {
  api.setToken("existing-identity"); show();
  const accept = await screen.findByRole("button", { name: "Accept invitation" });
  expect(screen.queryByPlaceholderText("Enter new password")).not.toBeInTheDocument();
  expect(screen.getByText(/sam@example.test/)).toBeInTheDocument();
  fireEvent.click(accept);
  expect(await screen.findByRole("heading", { name: "Joined organization" })).toBeInTheDocument();
  expect(submitted).toEqual({ payload: {}, bearer: "Bearer existing-identity" });
  expect(api.getToken()).toBe("existing-identity"); expect(api.getOrganization()).toBe("b");
});
it("keeps new-account acceptance and offers sign-in with the full invitation return URL", async () => {
  show();
  expect(await screen.findByRole("button", { name: "Create account and accept invitation" })).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Enter new password")).toBeInTheDocument();
  const signin = screen.getByRole("link", { name: "Sign in to accept invitation" });
  expect(signin).toHaveAttribute("href", "/login");
  fireEvent.change(screen.getByPlaceholderText("Enter first name"), { target: { value: "New" } });
  fireEvent.change(screen.getByPlaceholderText("Enter last name"), { target: { value: "Member" } });
  fireEvent.change(screen.getByPlaceholderText("Enter new password"), { target: { value: "Newmember123!" } });
  fireEvent.change(screen.getByPlaceholderText("Confirm new password"), { target: { value: "Newmember123!" } });
  fireEvent.click(screen.getByRole("button", { name: "Create account and accept invitation" }));
  expect(await screen.findByText("Invitation accepted. Sign in to continue.")).toBeInTheDocument();
  expect(submitted.payload).toMatchObject({ new_password: "Newmember123!", confirm_password: "Newmember123!" });
  expect(submitted.bearer).toBe("");
});

it("returns from existing-account sign-in with the invitation bearer intact", async () => {
  show();
  fireEvent.click(await screen.findByRole("link", { name: "Sign in to accept invitation" }));
  fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "sam@example.test" } });
  fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "Existing123!" } });
  fireEvent.click(screen.getByRole("button", { name: "Login" }));
  fireEvent.click(await screen.findByRole("button", { name: "Accept invitation" }));
  expect(await screen.findByRole("heading", { name: "Joined organization" })).toBeInTheDocument();
  expect(acceptanceUrl).toBe(`/auth/accept-invite/${token}`);
  expect(submitted.payload).toEqual({});
});
