
import React, { useState } from "react";
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
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    status: project?.status || 'Planning',
    progress: project?.progress || 0,
    deadline: project?.deadline || '',
    priority: project?.priority || 'Medium',
    team: project?.team || [],
    tasks: project?.tasks || []
  });

  const [newTeamMember, setNewTeamMember] = useState('');
  const [newTask, setNewTask] = useState({
    title: '',
    assignee: '',
    status: 'pending'
  });

  const handleSubmit = async () => {
    await onSave(formData);
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {project ? 'Edit Project' : 'Create New Project'}
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
          onCancel={onCancel}
          isEdit={!!project}
        />
      </DialogContent>
    </Dialog>
  );
};
