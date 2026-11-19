import { beforeEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Users from "./Users";

const state = vi.hoisted(() => ({
  person: {
    user_id: "employee",
    first_name: "Amina",
    last_name: "Bello",
    email: "amina@example.test",
    employee_id: "EMP-42",
    role: "project_manager",
    is_active: true,
    deleted_at: null as string | null,
    department: { name: "Engineering" },
  },
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
  toast: vi.fn(),
}));
vi.mock("@/hooks/useAuthContext", () => ({ useAuthContext: () => ({ user: { user_id: "admin", role: "admin" } }) }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: state.toast }) }));
vi.mock("@/services/apiService", () => ({ default: { get: state.get, post: state.post, delete: state.delete } }));

beforeEach(() => {
  vi.clearAllMocks();
  state.person.deleted_at = null;
  state.get.mockImplementation(async (_path: string, params: { status: string }) => {
    const deleted = Boolean(state.person.deleted_at);
    const visible = params.status === "all" || (params.status === "deleted" ? deleted : !deleted);
    return { data: {
      users: visible ? [{ ...state.person }] : [],
      roles: [{ role_key: "project_manager", name: "Project Manager" }],
      permissions: [],
      counts: { totalUsers: Number(!deleted), deletedUsers: Number(deleted) },
      pagination: { page: 1, limit: 25, totalItems: Number(visible), totalPages: 1 },
    } };
  });
  state.delete.mockImplementation(async () => { state.person.deleted_at = "2026-11-19T12:00:00Z"; return { success: true }; });
  state.post.mockImplementation(async () => { state.person.deleted_at = null; return { success: true }; });
});

it("soft-deletes a user, lists them as deleted, and restores them to the current directory", async () => {
  render(<MemoryRouter><Users /></MemoryRouter>);
  fireEvent.click(await screen.findByRole("button", { name: "Delete", exact: true }));
  let dialog = screen.getByRole("dialog");
  expect(within(dialog).getByText(/history and existing relationships are preserved/)).toBeInTheDocument();
  expect(within(dialog).queryByText(/reassigned first/)).not.toBeInTheDocument();
  fireEvent.click(within(dialog).getByRole("button", { name: "Delete user", exact: true }));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  await screen.findByText("No users match these filters.");
  expect(state.delete).toHaveBeenCalledWith("admin/users", "employee");
  expect(state.toast).toHaveBeenCalledWith({ title: "User deleted. History preserved." });

  fireEvent.change(screen.getByLabelText("Account status"), { target: { value: "deleted" } });
  fireEvent.click(await screen.findByRole("button", { name: "Restore", exact: true }));
  dialog = screen.getByRole("dialog");
  expect(within(dialog).getByText(/Later reassignments are preserved/)).toBeInTheDocument();
  expect(within(dialog).getByText(/must log in again/)).toBeInTheDocument();
  fireEvent.click(within(dialog).getByRole("button", { name: "Restore account", exact: true }));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  await screen.findByText("No users match these filters.");
  expect(state.post).toHaveBeenCalledWith("admin/users/employee/restore", {});
  expect(state.toast).toHaveBeenCalledWith({ title: "Account restored. A new login is required." });

  fireEvent.change(screen.getByLabelText("Account status"), { target: { value: "current" } });
  await screen.findByText("Amina Bello");
  expect(screen.getByText("Active", { selector: "div" })).toBeInTheDocument();
  expect(await screen.findByRole("button", { name: "Delete", exact: true })).toBeEnabled();
});

it.each(["delete", "restore"])("keeps the confirmation open and allows retry after a %s request fails", async (action) => {
  if (action === "restore") state.person.deleted_at = "2026-11-19T12:00:00Z";
  const mutation = action === "delete" ? state.delete : state.post;
  mutation.mockRejectedValueOnce(new Error("Unable to complete this request"));
  render(<MemoryRouter><Users /></MemoryRouter>);
  if (action === "restore") fireEvent.change(screen.getByLabelText("Account status"), { target: { value: "deleted" } });
  fireEvent.click(await screen.findByRole("button", { name: action === "delete" ? "Delete" : "Restore", exact: true }));
  const dialog = screen.getByRole("dialog");
  const confirm = within(dialog).getByRole("button", { name: action === "delete" ? "Delete user" : "Restore account", exact: true });
  const directoryReads = state.get.mock.calls.length;
  fireEvent.click(confirm);
  expect(await within(dialog).findByRole("alert")).toHaveTextContent("Unable to complete this request");
  expect(confirm).toBeEnabled();
  expect(state.toast).not.toHaveBeenCalled();
  expect(state.get).toHaveBeenCalledTimes(directoryReads);
  fireEvent.click(confirm);
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(mutation).toHaveBeenCalledTimes(2);
  await waitFor(() => expect(state.get.mock.calls.length).toBeGreaterThan(directoryReads));
});
