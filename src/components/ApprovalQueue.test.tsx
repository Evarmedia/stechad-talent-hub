import { beforeEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import ApprovalQueue from "./ApprovalQueue";
const state = vi.hoisted(() => ({ user: { effective_permissions: ["approve_leave", "verify_receipts"] }, get: vi.fn(), put: vi.fn(), toast: vi.fn() }));
vi.mock("@/hooks/useAuthContext", () => ({ useAuthContext: () => state }));
vi.mock("@/services/apiService", () => ({ default: { get: state.get, put: state.put } }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: state.toast }) }));
const leave = { id: "leave-1", type: "leave", item: "Annual leave", owner: "Employee", status: "Pending", actions: ["approved", "rejected"] };
const expense = { id: "expense-1", type: "expense", item: "Travel claim", owner: "Employee", status: "Approved", actions: ["receipt_verified"], receipt_url: "https://example.test/receipt", description: "Train fare" };
beforeEach(() => { vi.clearAllMocks(); state.user = { effective_permissions: ["approve_leave", "verify_receipts"] }; state.get.mockResolvedValue({ data: [leave, expense] }); state.put.mockResolvedValue({ success: true }); });
it("keeps receipt links and submits review notes through the existing approval API", async () => {
  render(<ApprovalQueue />); await screen.findByText("Annual leave");
  expect(screen.getByRole("link", { name: "View receipt" })).toHaveAttribute("href", "https://example.test/receipt");
  expect(screen.getByText("Train fare")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Approve" }));
  fireEvent.change(screen.getByLabelText("Review notes"), { target: { value: "  Approved for the planned dates  " } });
  fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Approve" }));
  await waitFor(() => expect(state.put).toHaveBeenCalledWith("staff/approvals/leave", "leave-1", { action: "approved", notes: "Approved for the planned dates" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
});
it("renders only rows and actions matching current permissions", async () => {
  state.user = { effective_permissions: ["verify_receipts"] }; render(<ApprovalQueue />);
  await screen.findByRole("button", { name: "Verify receipt" });
  expect(screen.queryByText("Annual leave")).not.toBeInTheDocument(); expect(screen.queryByRole("button", { name: "Approve" })).not.toBeInTheDocument();
});
it("closes an open review when its permission is revoked and reloads the remaining queue", async () => {
  const view = render(<ApprovalQueue />); await screen.findByText("Annual leave");
  fireEvent.click(screen.getByRole("button", { name: "Approve" })); expect(screen.getByRole("dialog")).toBeInTheDocument();
  state.user = { effective_permissions: ["verify_receipts"] }; view.rerender(<ApprovalQueue />);
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(screen.queryByText("Annual leave")).not.toBeInTheDocument(); expect(state.put).not.toHaveBeenCalled();
  await waitFor(() => expect(state.get.mock.calls.length).toBeGreaterThan(1));
});
it("shows a retryable load error instead of an empty queue", async () => {
  state.get.mockRejectedValueOnce(new Error("Approval service unavailable")); render(<ApprovalQueue />);
  expect(await screen.findByRole("alert")).toHaveTextContent("Approval service unavailable");
  expect(screen.queryByText("No requests currently need your approval.")).not.toBeInTheDocument();
  state.get.mockResolvedValueOnce({ data: [] }); fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(await screen.findByText("No requests currently need your approval.")).toBeInTheDocument();
});
it("keeps the confirmation open and reports a rejected action", async () => {
  state.put.mockRejectedValueOnce(new Error("Approval permission revoked")); render(<ApprovalQueue />); await screen.findByText("Annual leave");
  fireEvent.click(screen.getByRole("button", { name: "Reject" })); fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Reject" }));
  await waitFor(() => expect(state.toast).toHaveBeenCalledWith(expect.objectContaining({ title: "Could not update approval", description: "Approval permission revoked" })));
  expect(screen.getByRole("dialog")).toBeInTheDocument();
});
