
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

interface ProjectFilterProps {
  onFilterChange: (filterType: string, value: string) => void;
  currentFilters: {
    status: string;
    priority: string;
    sortBy: string;
  };
}

export const ProjectFilter: React.FC<ProjectFilterProps> = ({ onFilterChange, currentFilters }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1 text-sm text-gray-600">
        <Filter className="w-4 h-4" />
        <span>Filter:</span>
      </div>
      
      <Select value={currentFilters.status} onValueChange={(value) => onFilterChange('status', value)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="Planning">Planning</SelectItem>
          <SelectItem value="In Progress">In Progress</SelectItem>
          <SelectItem value="Completed">Completed</SelectItem>
        </SelectContent>
      </Select>

      <Select value={currentFilters.priority} onValueChange={(value) => onFilterChange('priority', value)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="All Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priority</SelectItem>
          <SelectItem value="High">High</SelectItem>
          <SelectItem value="Medium">Medium</SelectItem>
          <SelectItem value="Low">Low</SelectItem>
        </SelectContent>
      </Select>

      <Select value={currentFilters.sortBy} onValueChange={(value) => onFilterChange('sortBy', value)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recent">Most Recent</SelectItem>
          <SelectItem value="deadline">Deadline</SelectItem>
          <SelectItem value="priority">Priority</SelectItem>
          <SelectItem value="progress">Progress</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
