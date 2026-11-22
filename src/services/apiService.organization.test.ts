import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { afterEach, expect, it } from "vitest";
import api from "./apiService";

afterEach(() => { sessionStorage.clear(); api.setOrganization(null); });
it("sends this tab's organization and rejects an older organization's response", async () => {
  api.setToken("identity-token");
  api.setOrganization("org-a");
  let finish: (value: AxiosResponse) => void;
  let sent: InternalAxiosRequestConfig;
  api.api.defaults.adapter = (config: InternalAxiosRequestConfig) => { sent = config; return new Promise((resolve) => { finish = resolve; }); };
  const request = api.get("staff/profile");
  const rejected = expect(request).rejects.toMatchObject({ code: "ORGANIZATION_CHANGED" });
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(sent.headers["X-Organization-Id"]).toBe("org-a");
  expect(sessionStorage.getItem("stechad_organization_id")).toBe("org-a");
  expect(localStorage.getItem("stechad_organization_id")).toBeNull();
  api.setOrganization("org-b");
  finish!({ config: sent, data: { name: "A payroll" }, status: 200, statusText: "OK", headers: {} });
  await rejected;
});
it.each([[403, "MEMBERSHIP_UNAVAILABLE"], [409, "ORGANIZATION_REQUIRED"]])("preserves identity after tenant %s and requests organization recovery", async (status, code) => {
  api.setToken("identity-token"); api.setOrganization("org-a");
  let recovery = 0;
  const listener = () => { recovery += 1; };
  window.addEventListener("stechad:organization-unavailable", listener);
  api.api.defaults.adapter = async (config: InternalAxiosRequestConfig) => { throw { config, response: { status, data: { code, message: "Choose an organization" } } }; };
  await expect(api.get("staff/profile")).rejects.toMatchObject({ status, code });
  expect(api.getToken()).toBe("identity-token"); expect(recovery).toBe(1);
  window.removeEventListener("stechad:organization-unavailable", listener);
});

it("does not dispatch an old form's mutation into a newly selected organization", async () => {
  api.setToken("identity-token"); api.setOrganization("org-a");
  let dispatched = false;
  api.api.defaults.adapter = async (config: InternalAxiosRequestConfig) => { dispatched = true; return { config, data: {}, status: 200, statusText: "OK", headers: {} }; };
  const request = api.post("staff/expenses", { description: "A expense" });
  api.setOrganization("org-b");
  await expect(request).rejects.toMatchObject({ code: "ORGANIZATION_CHANGED" });
  expect(dispatched).toBe(false);
});

it("clears global credentials when identity authentication is rejected", async () => {
  api.setToken("revoked-identity"); api.setOrganization("org-a");
  api.api.defaults.adapter = async (config: InternalAxiosRequestConfig) => { throw { config, response: { status: 401, data: { message: "Session revoked" } } }; };
  await expect(api.get("auth/me")).rejects.toMatchObject({ status: 401 });
  expect(api.getToken()).toBeNull(); expect(api.getOrganization()).toBeNull();
});
