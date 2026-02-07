
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { User, Mail, Calendar, MapPin, Briefcase, ShieldCheck } from "lucide-react";

interface Engineer {
  engineer_id: number;
  specialization: string[];
  years_of_experience: string;
  status: string;
  is_vetted: boolean;
  onboarded_at: string;
  user: {
    first_name: string; last_name: string; country?: string; email?: string; }
  cv_url?: string;
}

interface EngineerDetailsDialogProps {
  engineer: Engineer | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EngineerDetailsDialog: React.FC<EngineerDetailsDialogProps> = ({
  engineer,
  isOpen,
  onClose
}) => {
  if (!engineer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto mx-4">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">Engineer Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div className="border-b pb-4 flex items-start gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xl font-semibold">
                  {engineer.user.first_name} {engineer.user.last_name}
                </span>
                <Badge
                  variant={engineer.is_vetted ? "secondary" : "outline"}
                  className="text-xs flex items-center gap-1"
                >
                  <ShieldCheck className="w-3 h-3" />
                  {engineer.is_vetted ? "Vetted" : "Pending"}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground mt-1">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{engineer.user.email}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-gray-900">Experience</span>
                </div>
                <p className="text-2xl font-bold text-blue-700">
                  {engineer.years_of_experience} years
                </p>
                <p className="text-sm text-muted-foreground">
                  Status:{" "}
                  <span className="font-semibold capitalize">{engineer.status || "N/A"}</span>
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-700" />
                  <span className="text-sm font-semibold text-gray-900">Location</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {engineer.user?.country || "Not specified"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Onboarded: {engineer.onboarded_at.split("T")[0]}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-4 space-y-3">
              <div>
                <span className="text-sm font-semibold">Skills</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {engineer.specialization.map(skill => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-sm font-semibold">Status</span>
                <div className="mt-2">
                  <Badge className={engineer.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                    {engineer.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {engineer.cv_url && (
            <Card>
              <CardContent className="p-4">
                <div className="mb-3">
                  <span className="text-sm font-semibold">CV Preview</span>
                </div>
                <a
                  href={engineer.cv_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  View CV
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
