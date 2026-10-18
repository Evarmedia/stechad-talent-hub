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
import { useEffect, useState } from "react";

const StaffApprovalsPage = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [reviewDialog, setReviewDialog] = useState<{
    item: any;
    action: string;
  } | null>(null);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const load = async () => {
    try {
      const response = await apiService.get("staff/approvals");
      setItems(response?.data || response || []);
    } catch (error: any) {
      toast({
        title: "Could not load approvals",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  useEffect(() => {
    load();
  }, []);
  const review = (item: any, action: string) => {
    setNotes("");
    setReviewDialog({ item, action });
  };
  const submitReview = async () => {
    if (!reviewDialog) return;
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
      await load();
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
  return (
    <div className='p-4 md:p-8 mx-auto space-y-6'>
      <div>
        <p className='text-xs uppercase tracking-[0.2em] text-primary/80'>
          Delegated access
        </p>
        <h1 className='text-2xl font-bold text-primary'>Approvals</h1>
      </div>
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
              {items.map((item) => {
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
                      {(item.actions || []).map((action: string) => {
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
          {!items.length && (
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
};

export default StaffApprovalsPage;
