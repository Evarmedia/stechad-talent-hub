
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Calendar, DollarSign, Users, Clock, Building } from "lucide-react";

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  status: string;
  applications: number;
  postedDate?: string;
  posted?: string;
  salary: string;
}

interface JobDetailsDialogProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

export const JobDetailsDialog: React.FC<JobDetailsDialogProps> = ({
  job,
  isOpen,
  onClose
}) => {
  if (!job) return null;

  const getStatusColor = (status: string) => {
    if (!status) return "bg-gray-100 text-gray-800";
    return status.toLowerCase() === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800";
  };

  const displayDate = job.postedDate || job.posted || "Not specified";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl mx-4">
        <DialogHeader>
          <DialogTitle className="text-xl">{job.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Badge className={getStatusColor(job.status)}>
              {job.status}
            </Badge>
            <Badge variant="outline">{job.type}</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Company</span>
                </div>
                <p className="text-sm">{job.company}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Location</span>
                </div>
                <p className="text-sm">{job.location}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Salary</span>
                </div>
                <p className="text-sm">{job.salary}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Applications</span>
                </div>
                <p className="text-sm">{job.applications} candidates</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Posted</span>
                </div>
                <p className="text-sm">{displayDate}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Type</span>
                </div>
                <p className="text-sm">{job.type}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="mb-3">
                <span className="text-sm font-medium">Job Description</span>
              </div>
              <p className="text-sm text-muted-foreground">
                We are looking for an experienced {job.title} to join our team at {job.company}. 
                The ideal candidate will have strong technical skills and experience working in a collaborative environment.
                This is a {job.type?.toLowerCase()} position based in {job.location}.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="mb-3">
                <span className="text-sm font-medium">Requirements</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 3+ years of relevant experience</li>
                <li>• Strong problem-solving skills</li>
                <li>• Excellent communication skills</li>
                <li>• Experience with modern development tools</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
