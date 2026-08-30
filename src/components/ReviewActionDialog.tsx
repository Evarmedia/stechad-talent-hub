import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ReviewActionDialogProps {
  open: boolean;
  action: string;
  requestLabel?: string;
  notes: string;
  busy?: boolean;
  onNotesChange: (notes: string) => void;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
}

const actionLabels: Record<string, string> = {
  approved: "Approve",
  rejected: "Reject",
  disputed: "Dispute",
  receipt_verified: "Verify receipt",
  accounts_approved: "Accounts approve & sync",
};

const formatAction = (action: string) => actionLabels[action] || action
  .split("_")
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(" ");

const ReviewActionDialog = ({
  open,
  action,
  requestLabel,
  notes,
  busy = false,
  onNotesChange,
  onOpenChange,
  onConfirm,
}: ReviewActionDialogProps) => {
  const destructive = action === "rejected" || action === "disputed";
  const actionLabel = formatAction(action || "review");

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !busy && onOpenChange(nextOpen)}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-lg">
        <DialogHeader>
          <DialogTitle>{actionLabel} request</DialogTitle>
          <DialogDescription>
            {requestLabel ? `${requestLabel}. ` : ""}
            {destructive ? "Add clear feedback so the requester knows what to change." : "Add any notes the requester should see."}
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            void onConfirm();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="review-notes">{destructive ? "Feedback" : "Review notes"}</Label>
            <Textarea
              id="review-notes"
              className="min-h-[120px]"
              placeholder={destructive ? "Explain why this request cannot be approved..." : "Optional notes for the requester..."}
              value={notes}
              onChange={(event) => onNotesChange(event.target.value)}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">{destructive ? "Feedback is recommended." : "Notes are optional."}</p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" disabled={busy} onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" variant={destructive ? "destructive" : "default"} disabled={busy}>
              {busy ? "Saving..." : actionLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewActionDialog;
