
import React from "react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

type FilterOption = { value: string, label: string };
interface EngineerFilterProps {
  filter: string;
  setFilter: (val: string) => void;
  filterOptions: FilterOption[];
}

const EngineerFilter: React.FC<EngineerFilterProps> = ({ filter, setFilter, filterOptions }) => (
  <div className="w-full sm:w-64">
    <Select
      value={filter}
      onValueChange={setFilter}
      defaultValue="all"
    >
      <SelectTrigger className="w-full bg-white z-[40]">
        <SelectValue placeholder="Filter engineers..." />
      </SelectTrigger>
      <SelectContent className="bg-white">
        {filterOptions.map((opt) => (
          <SelectItem
            key={opt.value}
            value={opt.value}
            className="hover:bg-primary-light"
          >
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export default EngineerFilter;
