
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface JobCardProps {
  job: any;
  hasApplied: boolean;
  isApplying: boolean;
  onApply: (jobId: number, jobTitle: string) => void;
  onViewDetails: (job: any) => void;
}

const JobCard: React.FC<JobCardProps> = ({
  job,
  hasApplied,
  isApplying,
  onApply,
  onViewDetails
}) => {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex justify-between">
          {job.title}
          {job.remote && (
            <span className="text-green-600 text-xs">Remote</span>
          )}
        </CardTitle>
        <div className="text-sm text-text-muted">{job.location}</div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-3">
          {job.skills.map((skill) => (
            <Badge
              key={skill}
              className="bg-primary-light text-primary rounded px-2 py-1 text-xs"
            >
              {skill}
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            onClick={() => onApply(job.id, job.title)}
            disabled={isApplying || hasApplied}
          >
            {isApplying 
              ? "Applying..." 
              : hasApplied 
                ? "Already Applied" 
                : "Apply"
            }
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onViewDetails(job)}
          >
            View JD
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobCard;
