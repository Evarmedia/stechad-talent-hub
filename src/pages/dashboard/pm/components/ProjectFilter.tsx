
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";

interface ProjectFilterProps {
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  priorityFilter: string;
  setPriorityFilter: (value: string) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  onCreateNew: () => void;
}

export const ProjectFilter: React.FC<ProjectFilterProps> = ({
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  searchTerm,
  setSearchTerm,
  onCreateNew
}) => {
  return (
    <div className="bg-white p-4 rounded-lg border">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="All Priority" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={onCreateNew} className="w-full md:w-auto text-white">
          <Plus className="w-4 h-4 mr-2 text-white" />
          Create Project
        </Button>
      </div>
    </div>
  );
};
