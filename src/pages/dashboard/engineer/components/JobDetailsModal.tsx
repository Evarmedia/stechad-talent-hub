
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface JobDetailsModalProps {
  job: any;
  isOpen: boolean;
  onClose: () => void;
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  job,
  isOpen,
  onClose
}) => {
  if (!job) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{job.title} - Job Details</DialogTitle>
          <DialogDescription>
            <span className="text-xs text-muted-foreground">
              {job.location} {job.remote && "｜Remote"}
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="mb-3">
          <strong className="block text-primary mb-1">
            Description
          </strong>
          <div>{job.description}</div>
        </div>
        <div className="mb-3">
          <strong className="block text-primary mb-1">
            Responsibilities
          </strong>
          <ul className="list-disc ml-6 text-sm">
            {job.responsibilities.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <strong className="block text-primary mb-1">
            Requirements
          </strong>
          <ul className="list-disc ml-6 text-sm">
            {job.requirements.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="secondary">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JobDetailsModal;
