
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, CheckCircle, AlertCircle, Circle, Edit, OctagonPause, CircleOff } from "lucide-react";

interface Task {
  id: number;
  title: string;
  status: string;
  assignee: string;
}

interface ProjectFormData {
  title: string;
  description: string;
  status: string;
  progress: number;
  deadline: string;
  start_date?: string;
  priority: string;
  team: string[];
  tasks: Task[];
}

interface ProjectFormProps {
  formData: ProjectFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProjectFormData>>;
  newTeamMember: string;
  setNewTeamMember: React.Dispatch<React.SetStateAction<string>>;
  newTask: { title: string; assignee: string; status: string };
  setNewTask: React.Dispatch<React.SetStateAction<{ title: string; assignee: string; status: string }>>;
  onSubmit: () => void;
  onCancel: () => void;
  isEdit?: boolean;
}

const getTaskIcon = (status: string) => {
  switch (status) {
    case "completed": return <CheckCircle className="w-4 h-4 text-green-600" />;
    case "in_progresss": return <AlertCircle className="w-4 h-4 text-blue-600" />;
    case "pending": return <Circle className="w-4 h-4 text-gray-400" />;
    case "on_hold": return <OctagonPause className="w-4 h-4 text-gray-400" />;
    case "cancelled": return <CircleOff className="w-4 h-4 text-gray-400" />;
    default: return <Circle className="w-4 h-4 text-gray-400" />;
  }
};

export const ProjectForm: React.FC<ProjectFormProps> = ({
  formData,
  setFormData,
  newTeamMember,
  setNewTeamMember,
  newTask,
  setNewTask,
  onSubmit,
  onCancel,
  isEdit = false
}) => {
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);

  const addTeamMember = () => {
    if (newTeamMember.trim() && !formData.team.includes(newTeamMember.trim())) {
      setFormData(prev => ({
        ...prev,
        team: [...prev.team, newTeamMember.trim()]
      }));
      setNewTeamMember("");
    }
  };

  const removeTeamMember = (member: string) => {
    setFormData(prev => ({
      ...prev,
      team: prev.team.filter(m => m !== member)
    }));
  };

  const addTask = () => {
    if (newTask.title.trim() && newTask.assignee.trim()) {
      setFormData(prev => ({
        ...prev,
        tasks: [...prev.tasks, { ...newTask, id: Date.now() }]
      }));
      setNewTask({ title: "", assignee: "", status: "pending" });
    }
  };

  const removeTask = (taskId: number) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => task.id !== taskId)
    }));
  };

  const startEditingTask = (task: Task) => {
    setEditingTask(task);
  };

  const saveTaskEdit = () => {
    if (editingTask) {
      setFormData(prev => ({
        ...prev,
        tasks: prev.tasks.map(task => 
          task.id === editingTask.id ? editingTask : task
        )
      }));
      setEditingTask(null);
    }
  };

  const cancelTaskEdit = () => {
    setEditingTask(null);
  };

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Project Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter project title"
          />
        </div>
        <div>
          <Label htmlFor="deadline">Deadline *</Label>
          <Input
            id="deadline"
            type="date"
            value={formData.deadline}
            onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter project description"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="progress">Progress (%)</Label>
          <Input
            id="progress"
            type="number"
            min="0"
            max="100"
            value={formData.progress}
            onChange={(e) => setFormData(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
          />
        </div>
      </div>

      <div>
        <Label>Team Members</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={newTeamMember}
            onChange={(e) => setNewTeamMember(e.target.value)}
            placeholder="Add team member"
            onKeyPress={(e) => e.key === 'Enter' && addTeamMember()}
          />
          <Button type="button" onClick={addTeamMember}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.team.map((member, index) => (
            <Badge key={index} variant="outline" className="flex items-center gap-1">
              {member}
              <button onClick={() => removeTeamMember(member)} className="ml-1">
                <Trash2 className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <Label>Tasks</Label>
        <div className="space-y-2 mb-2">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <Input
              value={newTask.title}
              onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Task title"
            />
            <Input
              value={newTask.assignee}
              onChange={(e) => setNewTask(prev => ({ ...prev, assignee: e.target.value }))}
              placeholder="Assignee"
            />
            <Select value={newTask.status} onValueChange={(value) => setNewTask(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="in_progress">In Progres</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button type="button" onClick={addTask} className="w-full md:w-auto">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {formData.tasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between p-2 border rounded">
              {editingTask && editingTask.id === task.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={editingTask.title}
                    onChange={(e) => setEditingTask(prev => prev ? { ...prev, title: e.target.value } : null)}
                    className="flex-1"
                  />
                  <Input
                    value={editingTask.assignee}
                    onChange={(e) => setEditingTask(prev => prev ? { ...prev, assignee: e.target.value } : null)}
                    className="w-24"
                  />
                  <Select 
                    value={editingTask.status} 
                    onValueChange={(value) => setEditingTask(prev => prev ? { ...prev, status: value } : null)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="planning">Planninggggg</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={saveTaskEdit}>Save</Button>
                  <Button size="sm" variant="outline" onClick={cancelTaskEdit}>Cancel</Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    {getTaskIcon(task.status)}
                    <span className="text-sm">{task.title}</span>
                    <Badge variant="outline" className="text-xs">{task.assignee}</Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => startEditingTask(task)}>
                      <Edit className="w-4 h-4 text-blue-500" />
                    </button>
                    <button onClick={() => removeTask(task.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel} className="w-full md:w-auto">
          Cancel
        </Button>
        <Button onClick={onSubmit} className="w-full md:w-auto">
          {isEdit ? "Update Project" : "Create Project"}
        </Button>
      </div>
    </div>
  );
};
