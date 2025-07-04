
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface JobsHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
}

const JobsHeader: React.FC<JobsHeaderProps> = ({
  search,
  onSearchChange
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-2">
      <div className="flex items-center gap-3">
        <Input
          placeholder="Search jobs"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Button variant="outline" disabled>
        Filter by Skills (coming soon)
      </Button>
    </div>
  );
};

export default JobsHeader;
