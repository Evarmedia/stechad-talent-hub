import { expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminSettings from "./Settings";
const state = vi.hoisted(() => ({ user: { role: "admin", notification_sound_enabled: true, location_sharing_enabled: false, has_password: true }, get: vi.fn() }));
vi.mock("@/hooks/useAuthContext", () => ({ useAuthContext: () => ({ user: state.user, updateUser: vi.fn() }) }));
vi.mock("@/services/apiService", () => ({ default: { get: state.get } }));
it.each(["admin", "super_admin"])("combines account and system settings for %s", async (role) => {
  state.user.role = role; state.get.mockResolvedValue({ data: { EMPLOYEE_ID_PREFIX: "STE" } });
  render(<MemoryRouter initialEntries={["/admin/settings"]}><AdminSettings /></MemoryRouter>);
  expect(screen.getByRole("tab", { name: "Account" })).toHaveAttribute("data-state", "active");
  expect(screen.getByRole("switch", { name: "Notification sounds" })).toBeInTheDocument();
  expect(screen.queryByRole("switch", { name: "Automatic clock-out" })).not.toBeInTheDocument();
  fireEvent.mouseDown(screen.getByRole("tab", { name: "System" }), { button: 0, ctrlKey: false });
  expect(await screen.findByLabelText("Employee ID prefix")).toHaveValue("STE");
  expect(screen.queryByText("Update a user's Employee ID")).not.toBeInTheDocument();
  expect(screen.queryByRole("switch", { name: "Notification sounds" })).not.toBeInTheDocument();
});
