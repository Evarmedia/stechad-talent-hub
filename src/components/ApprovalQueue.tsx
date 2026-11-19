import { can, canAny, approvalPermission, approvalPermissions } from "@/lib/permissions";
import { useAuthContext } from "@/hooks/useAuthContext";
import ServerDataState from "@/components/ServerDataState";
import { useRemoteData } from "@/hooks/useRemoteData";
/* eslint-disable @typescript-eslint/no-explicit-any */
import ReviewActionDialog from "@/components/ReviewActionDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/apiService";
import { useEffect, useRef, useState } from "react";

export default function ApprovalQueue() {
  const { toast } = useToast();
  const { user } = useAuthContext();
  const scope = approvalPermissions.filter((permission) => can(user, permission)).join(",");
  const remote = useRemoteData<any[]>(scope ? "staff/approvals" : null);
  const previousScope = useRef(scope);
  useEffect(() => { if (previousScope.current !== scope) { previousScope.current = scope; remote.reload(); } }, [scope, remote.reload]);
  const items = remote.data || [];
  const visibleItems = items.filter((item) => item.actions?.some((action: string) => can(user, approvalPermission(item.type, action))));
  const [reviewDialog, setReviewDialog] = useState<{
    item: any;
    action: string;
  } | null>(null);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (reviewDialog && !can(user, approvalPermission(reviewDialog.item.type, reviewDialog.action))) setReviewDialog(null);
  }, [scope, reviewDialog]);
  const review = (item: any, action: string) => {
    setNotes("");
    setReviewDialog({ item, action });
  };
  const submitReview = async () => {
    if (!reviewDialog || !can(user, approvalPermission(reviewDialog.item.type, reviewDialog.action))) return;
    setBusy(true);
    try {
      await apiService.put(
        `staff/approvals/${reviewDialog.item.type}`,
        reviewDialog.item.id,
        { action: reviewDialog.action, notes: notes.trim() },
      );
      toast({ title: "Approval updated" });
      setReviewDialog(null);
      setNotes("");
      remote.reload();
    } catch (error: any) {
      toast({
        title: "Could not update approval",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };
  const label = (action: string) =>
    action
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  if (!canAny(user, approvalPermissions)) return null;
  if (remote.loading || remote.error) return <ServerDataState title="Approvals" error={remote.error} onRetry={remote.reload} />;

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Assigned approval queue</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Receipt</TableHead>
                <TableHead>Info</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleItems.map((item) => {
                const receiptUrl =
                  (item as any).receipt_url ||
                  (item as any).receipt?.url ||
                  (item as any).receiptUrl ||
                  (item as any).url ||
                  null;
                const info =
                  (item as any).description ||
                  (item as any).notes ||
                  (item as any).note ||
                  (item as any).details ||
                  null;
                return (
                  <TableRow key={`${item.type}-${item.id}`}>
                    <TableCell>{item.item}</TableCell>
                    <TableCell>{item.owner}</TableCell>
                    <TableCell className='capitalize'>{item.type}</TableCell>
                    <TableCell>
                      <Badge variant='secondary'>{item.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {receiptUrl ? (
                        <a
                          href={receiptUrl}
                          target='_blank'
                          rel='noreferrer'
                          className='text-sm text-primary underline'
                        >
                          View receipt
                        </a>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      {info ? (
                        <p className='text-sm text-muted-foreground'>{info}</p>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className='space-x-2'>
                      {(item.actions || []).filter((action: string) => can(user, approvalPermission(item.type, action))).map((action: string) => {
                        let actionLabel: string;
                        if (action === "receipt_verified") actionLabel = "Verify receipt";
                        else if (action === "approved") actionLabel = "Approve";
                        else if (action === "rejected") actionLabel = "Reject";
                        else if (action === "accounts_approved") actionLabel = "Accounts approve";
                        else if (action === "accounts_rejected") actionLabel = "Accounts reject";
                        else if (action === "disputed") actionLabel = "Dispute";
                        else actionLabel = label(action);
                        return (
                          <Button
                            key={action}
                            size='sm'
                            variant={
                              action === "rejected" || action === "disputed"
                                ? "destructive"
                                : "default"
                            }
                            onClick={() => review(item, action)}
                          >
                            {actionLabel}
                          </Button>
                        );
                      })}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {!visibleItems.length && (
            <p className='py-10 text-center text-muted-foreground'>
              No requests currently need your approval.
            </p>
          )}
        </CardContent>
      </Card>
      <ReviewActionDialog
        open={Boolean(reviewDialog)}
        action={reviewDialog?.action || ""}
        requestLabel={
          reviewDialog
            ? `${reviewDialog.item.owner}: ${reviewDialog.item.item}`
            : ""
        }
        notes={notes}
        busy={busy}
        onNotesChange={setNotes}
        onOpenChange={(open) => !open && setReviewDialog(null)}
        onConfirm={submitReview}
      />
    </div>
  );
}
