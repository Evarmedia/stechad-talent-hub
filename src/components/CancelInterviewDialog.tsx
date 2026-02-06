"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CancelInterviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const CancelInterviewDialog: React.FC<CancelInterviewDialogProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Cancel Interview?</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this interview? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            No, go back
          </Button>

          <Button 
            variant="destructive"
            onClick={onConfirm}
            className="text-white"
          >
            Yes, cancel interview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelInterviewDialog;
