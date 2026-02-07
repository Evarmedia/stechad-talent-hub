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

type VetRemarkDialogProps = {
  engineer: any;
  selectedEngineer: any;
  setSelectedEngineer: (eng: any) => void;
  remark: string;
  onRemarkChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onVet: (id: string) => void;
  onResetRemark: () => void;
};

const VetRemarkDialog: React.FC<VetRemarkDialogProps> = ({
  engineer,
  selectedEngineer,
  setSelectedEngineer,
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
          onClick={() => setSelectedEngineer(engineer)}
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
              Remark for {selectedEngineer?.user?.first_name || engineer?.user?.first_name}
            </Label>
            <Textarea
              name="remark"
              value={remark}
              onChange={onRemarkChange}
              placeholder="Add Remarks about Engineer"
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

          {selectedEngineer && !selectedEngineer.is_vetted && (
            <Button
              onClick={() => isRemarkProvided && onVet(selectedEngineer.engineer_id)}
              className="text-white"
              disabled={!isRemarkProvided}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Vet Engineer
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VetRemarkDialog;
