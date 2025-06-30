
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProjectForm } from "./ProjectForm";

interface ProjectFormDialogProps {
  project?: any;
  onSave: (formData: any) => Promise<void>;
  onCancel: () => void;
}

export const ProjectFormDialog: React.FC<ProjectFormDialogProps> = ({
  project,
  onSave,
  onCancel
}) => {
  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {project ? 'Edit Project' : 'Create New Project'}
          </DialogTitle>
        </DialogHeader>
        <ProjectForm
          project={project}
          onSave={onSave}
          onCancel={onCancel}
        />
      </DialogContent>
    </Dialog>
  );
};
