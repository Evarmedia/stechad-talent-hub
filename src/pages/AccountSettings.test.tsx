import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AccountSettings from "./AccountSettings";
import { AuthProvider } from "@/hooks/useAuthContext";
const mocks = vi.hoisted(() => ({ get: vi.fn(), putNoId: vi.fn(), post: vi.fn(), setToken: vi.fn(), setRefreshToken: vi.fn(), permission: vi.fn() }));
vi.mock("@/services/apiService", () => ({ default: { ...mocks, getToken: () => "test-token" } }));
vi.mock("@/services/websocketService", () => ({ default: { on: () => () => {}, connect: vi.fn(), disconnect: vi.fn() } }));
vi.mock("@/utils/locationPermission", () => ({ requestBrowserLocationPermission: mocks.permission }));
const user = { user_id: "test-user", role: "staff", email: "admin@example.test", has_password: true, auto_clock_out_enabled: false, auto_clock_out_time: null, notification_sound_enabled: true, location_sharing_enabled: false, effective_permissions: [] };
const show = () => render(<MemoryRouter><AuthProvider><AccountSettings /></AuthProvider></MemoryRouter>);
beforeEach(() => { vi.clearAllMocks(); mocks.get.mockResolvedValue({ success: true, data: { user } }); });
describe("account settings", () => {
  it.each(["admin", "super_admin"])("hides automatic clock-out for %s while retaining account preferences", async (role) => {
    mocks.get.mockResolvedValue({ success: true, data: { user: { ...user, role } } }); show();
    await screen.findByRole("switch", { name: "Notification sounds" });
    expect(screen.queryByRole("switch", { name: "Automatic clock-out" })).not.toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "Location sharing" })).toBeInTheDocument();
    expect(screen.getByLabelText("Current password")).toBeInTheDocument();
  });
  it("persists a personal clock-out preference and renders the returned state", async () => {
    mocks.putNoId.mockResolvedValue({ success: true, data: { user: { ...user, auto_clock_out_enabled: true, auto_clock_out_time: "17:00:00" } } });
    show(); await waitFor(() => expect(screen.getByRole("switch", { name: "Automatic clock-out" })).not.toBeChecked());
    fireEvent.click(screen.getByRole("switch", { name: "Automatic clock-out" }));
    await waitFor(() => expect(mocks.putNoId).toHaveBeenCalledWith("auth/preferences", { auto_clock_out_enabled: true }));
    expect(await screen.findByText(/automatically at 5:00 PM/)).toBeInTheDocument();
  });
  it("reports preference failures and leaves the saved state unchanged", async () => {
    mocks.putNoId.mockRejectedValue(new Error("Finish your current session manually")); show();
    await waitFor(() => expect(mocks.get).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("switch", { name: "Automatic clock-out" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Finish your current session manually");
    expect(screen.getByRole("switch", { name: "Automatic clock-out" })).not.toBeChecked();
  });
  it("changes the common sound preference", async () => {
    mocks.putNoId.mockResolvedValue({ success: true, data: { user: { ...user, notification_sound_enabled: false } } }); show();
    await waitFor(() => expect(mocks.get).toHaveBeenCalled()); fireEvent.click(screen.getByRole("switch", { name: "Notification sounds" }));
    await waitFor(() => expect(mocks.putNoId).toHaveBeenCalledWith("auth/preferences", { notification_sound_enabled: false }));
    await waitFor(() => expect(screen.getByRole("switch", { name: "Notification sounds" })).not.toBeChecked());
  });
  it("purges location through the server without requesting a new browser location", async () => {
    mocks.get.mockResolvedValue({ success: true, data: { user: { ...user, location_sharing_enabled: true, browser_latitude: 1 } } });
    mocks.putNoId.mockResolvedValue({ success: true, data: { user: { ...user, browser_latitude: null } } }); show();
    await waitFor(() => expect(screen.getByRole("switch", { name: "Location sharing" })).toBeChecked()); fireEvent.click(screen.getByRole("switch", { name: "Location sharing" }));
    await waitFor(() => expect(mocks.putNoId).toHaveBeenCalledWith("staff/location-sharing", { enabled: false }));
    expect(mocks.permission).not.toHaveBeenCalled(); await waitFor(() => expect(screen.getByRole("switch", { name: "Location sharing" })).not.toBeChecked());
  });
  it("validates password confirmation, current-password errors and stores replacement tokens", async () => {
    show(); await screen.findByLabelText("Current password");
    fireEvent.change(screen.getByLabelText("Current password"), { target: { value: "current-password" } });
    fireEvent.change(screen.getByLabelText("New password"), { target: { value: "new-password" } });
    fireEvent.change(screen.getByLabelText("Confirm new password"), { target: { value: "different" } });
    fireEvent.click(screen.getByRole("button", { name: "Change password" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("New passwords do not match"); expect(mocks.post).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("Confirm new password"), { target: { value: "new-password" } });
    mocks.post.mockRejectedValueOnce(new Error("Old password is incorrect")); fireEvent.click(screen.getByRole("button", { name: "Change password" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Old password is incorrect");
    mocks.post.mockResolvedValueOnce({ data: { token: "replacement", refreshToken: "replacement-refresh" } }); fireEvent.click(screen.getByRole("button", { name: "Change password" }));
    await waitFor(() => expect(mocks.setToken).toHaveBeenCalledWith("replacement")); expect(mocks.setRefreshToken).toHaveBeenCalledWith("replacement-refresh");
    expect(screen.getByLabelText("Current password")).toHaveValue("");
  });
  it("toggles visibility for each change-password field", async () => {
    show();
    const fields = [
      ["Current password", "Show current password", "Hide current password"],
      ["New password", "Show new password", "Hide new password"],
      ["Confirm new password", "Show confirm new password", "Hide confirm new password"],
    ] as const;

    for (const [label, showLabel, hideLabel] of fields) {
      const input = await screen.findByLabelText(label);
      expect(input).toHaveAttribute("type", "password");
      fireEvent.click(screen.getByRole("button", { name: showLabel }));
      expect(input).toHaveAttribute("type", "text");
      fireEvent.click(screen.getByRole("button", { name: hideLabel }));
      expect(input).toHaveAttribute("type", "password");
    }
  });
  it("provides password setup guidance for a passwordless account", async () => {
    mocks.get.mockResolvedValue({ success: true, data: { user: { ...user, has_password: false } } }); show();
    expect(await screen.findByRole("link", { name: /Set a password/ })).toHaveAttribute("href", "/forgot-password");
    expect(screen.queryByLabelText("Current password")).not.toBeInTheDocument();
  });
});
