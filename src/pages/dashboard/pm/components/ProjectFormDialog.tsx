
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProjectForm } from "./ProjectForm";

interface ProjectFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => Promise<void>;
  initialData?: any;
  mode: 'create' | 'edit';
}

export const ProjectFormDialog: React.FC<ProjectFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode
}) => {
  const [formData, setFormData] = useState({
    title: initialData?.name || initialData?.title || '',
    description: initialData?.description || '',
    status: initialData?.status || 'Planning',
    progress: initialData?.progress || 0,
    deadline: initialData?.deadline || '',
    priority: initialData?.priority || 'Medium',
    team: initialData?.team || [],
    tasks: initialData?.tasks || []
  });

  const [newTeamMember, setNewTeamMember] = useState('');
  const [newTask, setNewTask] = useState({
    title: '',
    assignee: '',
    status: 'pending'
  });

  const handleSubmit = async () => {
    // Convert title back to name for the API
    const submitData = {
      ...formData,
      name: formData.title
    };
    await onSubmit(submitData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Edit Project' : 'Create New Project'}
          </DialogTitle>
        </DialogHeader>
        <ProjectForm
          formData={formData}
          setFormData={setFormData}
          newTeamMember={newTeamMember}
          setNewTeamMember={setNewTeamMember}
          newTask={newTask}
          setNewTask={setNewTask}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isEdit={mode === 'edit'}
        />
      </DialogContent>
    </Dialog>
  );
};
