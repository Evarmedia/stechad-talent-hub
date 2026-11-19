import { beforeEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import EmploymentEditor from "./EmploymentEditor";
const state = vi.hoisted(() => ({ user: { role: "admin" }, put: vi.fn() }));
vi.mock("@/hooks/useAuthContext", () => ({ useAuthContext: () => state }));
vi.mock("@/services/apiService", () => ({ default: { put: state.put } }));
const person = { user_id: "person", email: "person@example.test", employee_id: "EMP001", job_title: "Engineer" };
beforeEach(() => { vi.clearAllMocks(); state.user = { role: "admin" }; });
it.each(["admin", "super_admin"])("saves employment and Employee ID together for %s", async (role) => {
  state.user = { role }; state.put.mockResolvedValue({ success: true }); const saved = vi.fn();
  render(<EmploymentEditor person={person} people={[]} departments={[]} onSaved={saved} onClose={() => {}} />);
  fireEvent.change(screen.getByLabelText("Employee ID"), { target: { value: "EMP002" } });
  fireEvent.change(screen.getByLabelText("Job title"), { target: { value: "Lead engineer" } });
  fireEvent.click(screen.getByRole("button", { name: "Save employment details" }));
  await waitFor(() => expect(state.put).toHaveBeenCalledWith("workforce/management/users", "person", expect.objectContaining({ employee_id: "EMP002", job_title: "Lead engineer" })));
  expect(saved).toHaveBeenCalledOnce();
});
it("retains a conflicting edit and displays the API error", async () => {
  state.put.mockRejectedValue(new Error("Employee ID is already assigned or reserved")); const close = vi.fn();
  render(<EmploymentEditor person={person} people={[]} departments={[]} onSaved={() => {}} onClose={close} />);
  fireEvent.change(screen.getByLabelText("Employee ID"), { target: { value: "TAKEN" } });
  fireEvent.click(screen.getByRole("button", { name: "Save employment details" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("already assigned or reserved"); expect(close).not.toHaveBeenCalled();
  expect(screen.getByLabelText("Employee ID")).toHaveValue("TAKEN");
});
it("does not expose Employee ID editing to delegated staff", () => {
  state.user = { role: "staff" };
  render(<EmploymentEditor person={person} people={[]} departments={[]} onSaved={() => {}} onClose={() => {}} />);
  expect(screen.queryByLabelText("Employee ID")).not.toBeInTheDocument();
});

it("preserves a hidden existing reporting manager while editing another field", async () => {
  state.put.mockResolvedValue({ success: true });
  render(<EmploymentEditor person={{ ...person, reports_to_user_id: "hidden", reporting_manager_mode: "override", reporting_manager: { first_name: "Existing", last_name: "Manager" } }} people={[]} departments={[]} onSaved={() => {}} onClose={() => {}} />);
  expect(screen.getByText("Current manager: Existing Manager")).toBeInTheDocument();
  expect(screen.getByRole("option", { name: "Keep current manager" })).toHaveValue("hidden");
  fireEvent.change(screen.getByLabelText("Job title"), { target: { value: "New title" } });
  fireEvent.click(screen.getByRole("button", { name: "Save employment details" }));
  await waitFor(() => expect(state.put).toHaveBeenCalledWith("workforce/management/users", "person", expect.objectContaining({ reports_to_user_id: "hidden", reporting_manager_mode: "override" })));
});
