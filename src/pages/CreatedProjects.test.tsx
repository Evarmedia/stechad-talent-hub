import { beforeEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import CreatedProjects from "./CreatedProjects";
const state = vi.hoisted(() => ({ user: { user_id: "creator", role: "staff", effective_permissions: ["create_project"] }, get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() }));
vi.mock("@/hooks/useAuthContext", () => ({ useAuthContext: () => state }));
vi.mock("@/services/apiService", () => ({ default: { get: state.get, post: state.post, put: state.put, delete: state.delete } }));
const project = { projects_id: "own", created_by_user_id: "creator", title: "Owned project", description: "Original description", priority: "high", deadline: "2026-12-01T00:00:00Z", status: "planning" };
beforeEach(() => { vi.clearAllMocks(); state.user.effective_permissions = ["create_project"]; state.get.mockResolvedValue({ data: { projects: [project] } }); state.put.mockResolvedValue({ success: true }); state.post.mockResolvedValue({ success: true }); state.delete.mockResolvedValue({ success: true }); Element.prototype.scrollIntoView = vi.fn(); });
it("loads only own creations and edits using the existing fields", async () => {
  render(<CreatedProjects />); await screen.findByText("Owned project");
  expect(state.get).toHaveBeenCalledWith("projects", { created_by_me: true });
  fireEvent.click(screen.getByRole("button", { name: "Edit" }));
  expect(screen.getByLabelText("Deadline")).toHaveValue("2026-12-01");
  fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Updated project" } });
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
  await waitFor(() => expect(state.put).toHaveBeenCalledWith("projects", "own", { title: "Updated project", description: "Original description", priority: "high", deadline: "2026-12-01" }));
  await waitFor(() => expect(screen.queryByRole("button", { name: "Cancel editing" })).not.toBeInTheDocument());
});
it("requires confirmation, preserves delete errors, and refreshes after successful deletion", async () => {
  state.delete.mockRejectedValueOnce(new Error("Project has started")); render(<CreatedProjects />); await screen.findByText("Owned project");
  fireEvent.click(screen.getByRole("button", { name: "Delete" })); expect(state.delete).not.toHaveBeenCalled();
  const dialog = screen.getByRole("alertdialog"); fireEvent.click(within(dialog).getByRole("button", { name: "Delete project" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Project has started");
  state.get.mockResolvedValueOnce({ data: { projects: [] } });
  fireEvent.click(within(dialog).getByRole("button", { name: "Delete project" }));
  expect(await screen.findByText("You have not created any projects yet.")).toBeInTheDocument();
});
it.each(["in_progress", "completed"])("explains the delete restriction for %s projects", async (status) => {
  state.get.mockResolvedValue({ data: { projects: [{ ...project, status }] } }); render(<CreatedProjects />); await screen.findByText("Owned project");
  expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled(); expect(screen.getByText(/Deletion is available only/)).toBeInTheDocument();
});
it("hides actions when creator access is revoked and preserves update errors", async () => {
  state.put.mockRejectedValueOnce(new Error("Permission revoked")); const view = render(<CreatedProjects />); await screen.findByText("Owned project");
  fireEvent.click(screen.getByRole("button", { name: "Edit" })); fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Permission revoked");
  state.user.effective_permissions = []; view.rerender(<CreatedProjects />);
  expect(screen.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument(); expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled();
});
