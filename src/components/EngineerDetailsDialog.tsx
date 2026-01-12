
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { User, Mail, Calendar, MapPin } from "lucide-react";

interface Engineer {
  engineer_id: number;
  specialization: string[];
  years_of_experience: string;
  status: string;
  is_vetted: boolean;
  onboarded_at: string;
  user: any;
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
      <DialogContent className="max-w-2xl mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span>{engineer.user.first_name} {engineer.user.last_name}</span>
                {engineer.is_vetted && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    Vetted
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground font-normal">{engineer.user.email}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Contact</span>
                </div>
                <p className="text-sm">{engineer.user.email}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Joined</span>
                </div>
                <p className="text-sm">{engineer.onboarded_at.split("T")[0]}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="mb-3">
                <span className="text-sm font-medium">Experience</span>
              </div>
              <p className="text-sm text-muted-foreground">{engineer.years_of_experience}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="mb-3">
                <span className="text-sm font-medium">Skills</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {engineer.specialization.map(skill => (
                  <Badge key={skill} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="mb-3">
                <span className="text-sm font-medium">Status</span>
              </div>
              <Badge className={engineer.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                {engineer.status}
              </Badge>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
