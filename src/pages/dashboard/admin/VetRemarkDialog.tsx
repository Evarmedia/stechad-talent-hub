import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle } from "lucide-react";
import React from "react";
import type { ReviewTalent } from "@/types/dashboard";

type VetRemarkDialogProps = {
  talent: ReviewTalent;
  selectedTalent: ReviewTalent | null;
  setSelectedTalent: (talent: ReviewTalent) => void;
  remark: string;
  onRemarkChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onVet: (id: string) => void;
  onResetRemark: () => void;
};

const VetRemarkDialog: React.FC<VetRemarkDialogProps> = ({
  talent,
  selectedTalent,
  setSelectedTalent,
  remark,
  onRemarkChange,
  onVet,
  onResetRemark,
}) => {
  const isRemarkProvided = remark.trim().length > 0;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="text-white"
          onClick={() => setSelectedTalent(talent)}
        >
          <CheckCircle className="w-4 h-4 mr-1" />
          Vet
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Remark</DialogTitle>
          <div>
            <Label className="block font-semibold text-blue-400 mb-2">
              Remark for {selectedTalent?.user?.first_name || talent?.user?.first_name}
            </Label>
            <Textarea
              name="remark"
              value={remark}
              onChange={onRemarkChange}
              placeholder="Add Remarks about Talent"
              required
              rows={4}
            />
          </div>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline" onClick={onResetRemark}>
              Close
            </Button>
          </DialogClose>

          {selectedTalent && !selectedTalent.is_vetted && (
            <Button
              onClick={() => isRemarkProvided && onVet(selectedTalent.talent_id)}
              className="text-white"
              disabled={!isRemarkProvided}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Vet Talent
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VetRemarkDialog;
