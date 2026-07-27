
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import React, { useEffect, useState } from "react";
import { ProjectForm } from "./ProjectForm";

interface ProjectFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => Promise<void>;
  initialData: any;
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
    title: initialData?.title || initialData?.name || '',
    description: initialData?.description || '',
    status: initialData?.status || 'planning',
    progress: initialData?.progress || 0,
    deadline: initialData?.deadline || '',
    priority: initialData?.priority || 'medium',
    team: initialData?.team || [],
    tasks: initialData?.tasks || []
  });

  const [newTeamMember, setNewTeamMember] = useState('');
  const [newTask, setNewTask] = useState({
    title: '',
    assignee: '',
    status: 'pending'
  });

  useEffect(() => {
    const normalizeDate = (value: string | undefined) => {
      if (!value) return '';
      return value.includes('T') ? value?.split('T')[0] : value;
    };

    const normalizedTasks = (initialData?.tasks || []).map((task: any, index: number) => ({
      id: task.id ?? task.task_id ?? index,
      title: task.title || task.name || '',
      assignee: task.assignee || '',
      status: task.status || 'pending'
    }));

    setFormData({
      title: initialData?.title || initialData?.name || '',
      description: initialData?.description || '',
      status: initialData?.status || 'planning',
      progress: Number(initialData?.progress ?? 0),
      deadline: normalizeDate(initialData?.deadline),
      priority: initialData?.priority || 'medium',
      team: initialData?.team || [],
      tasks: normalizedTasks
    });
    setNewTeamMember('');
    setNewTask({
      title: '',
      assignee: '',
      status: 'pending'
    });
  }, [initialData, mode, isOpen]);

  const handleSubmit = async () => {
    // Convert title back to name for the API
    const submitData = {
      ...formData,
      name: formData.title
    };
    try {
      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Failed to submit project form:', error);
    }
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
