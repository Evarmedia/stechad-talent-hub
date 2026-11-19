import { expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Notifications from "./Notifications";
const state = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/services/apiService", () => ({ default: { get: state.get } }));
it("previews all notification recipients using platform totals rather than the restricted directory", async () => {
  state.get.mockResolvedValue({ data: { statistics: { totalUsers: 9 } } });
  render(<Notifications />);
  fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Announcement" } });
  fireEvent.change(screen.getByLabelText("Message"), { target: { value: "For every role" } });
  await waitFor(() => expect(screen.getByRole("button", { name: "Preview notification" })).toBeEnabled());
  fireEvent.click(screen.getByRole("button", { name: "Preview notification" }));
  expect(await screen.findByRole("heading", { name: "Send to 9 users?" })).toBeInTheDocument();
  expect(state.get).toHaveBeenCalledWith("admin/dashboard", {});
  expect(state.get.mock.calls.some(([path]) => path === "admin/users")).toBe(false);
});
