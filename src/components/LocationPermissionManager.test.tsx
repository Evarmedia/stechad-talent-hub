import { beforeEach, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";
import LocationPermissionManager from "./LocationPermissionManager";
const state = vi.hoisted(() => ({ user: { user_id: "user", role: "staff", location_sharing_enabled: false, location_permission_status: "not_asked", location_consent_version: 0 }, get: vi.fn(), request: vi.fn(), capture: vi.fn() }));
vi.mock("@/hooks/useAuthContext", () => ({ useAuthContext: () => ({ user: state.user }) }));
vi.mock("@/services/apiService", () => ({ default: { get: state.get, request: state.request } }));
beforeEach(() => { vi.clearAllMocks(); state.user = { user_id: "user", role: "staff", location_sharing_enabled: false, location_permission_status: "not_asked", location_consent_version: 0 }; Object.defineProperty(navigator, "geolocation", { configurable: true, value: { getCurrentPosition: state.capture } }); });
it("never prompts or collects while location sharing is disabled", () => {
  render(<LocationPermissionManager />); expect(state.capture).not.toHaveBeenCalled(); expect(state.get).not.toHaveBeenCalled();
});
it("ignores a pending browser callback after consent is disabled", async () => {
  state.user = { ...state.user, location_sharing_enabled: true, location_permission_status: "granted" };
  state.get.mockResolvedValue({ data: { summary: { today: { isOpen: true } } } });
  let callback: PositionCallback;
  state.capture.mockImplementation((success) => { callback = success; });
  const view = render(<LocationPermissionManager />);
  await act(async () => {}); expect(state.capture).toHaveBeenCalledOnce();
  state.user = { ...state.user, location_sharing_enabled: false, location_consent_version: 1 }; view.rerender(<LocationPermissionManager />);
  callback!({ coords: { latitude: 1, longitude: 2, accuracy: 3 } } as GeolocationPosition);
  expect(state.request).not.toHaveBeenCalled();
});

it.each(["admin", "super_admin"])("does not poll personal attendance for %s", async (role) => {
  state.user = { ...state.user, role, location_sharing_enabled: true, location_permission_status: "granted" };
  render(<LocationPermissionManager />); await act(async () => {});
  expect(state.get).not.toHaveBeenCalled(); expect(state.capture).not.toHaveBeenCalled();
});
