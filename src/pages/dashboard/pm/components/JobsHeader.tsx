
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

export const JobsHeader = () => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <h1 className="text-2xl font-bold">Manage Jobs</h1>
      <Button className='text-white' asChild>
        <Link to="/dashboard/pm/post-job">
          <Plus className="w-4 h-4 mr-2 text-white" />
          Post New Job
        </Link>
      </Button>
    </div>
  );
};
