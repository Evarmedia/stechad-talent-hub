
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

interface ProjectFilterProps {
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export const ProjectFilter: React.FC<ProjectFilterProps> = ({ statusFilter, onStatusFilterChange }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1 text-sm text-gray-600">
        <Filter className="w-4 h-4" />
        <span>Filter:</span>
      </div>
      
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All Status</SelectItem>
          <SelectItem value="Planning">Planning</SelectItem>
          <SelectItem value="In Progress">In Progress</SelectItem>
          <SelectItem value="Completed">Completed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
