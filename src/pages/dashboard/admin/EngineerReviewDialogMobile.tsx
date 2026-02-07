import React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, CheckCircle } from "lucide-react";

type EngineerReviewDialogMobileProps = {
  engineer: any;
  selectedEngineer: any;
  setSelectedEngineer: (eng: any) => void;
  onVet: (id: string) => void;
};

const EngineerReviewDialogMobile: React.FC<EngineerReviewDialogMobileProps> = ({
  engineer,
  selectedEngineer,
  setSelectedEngineer,
  onVet,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setSelectedEngineer(engineer)}
          className="flex-1"
        >
          <Eye className="w-4 h-4 mr-1" />
          Review
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md mx-4">
        <DialogHeader>
          <DialogTitle>Review Engineer</DialogTitle>
        </DialogHeader>
        {selectedEngineer && (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold">
                {selectedEngineer.user.first_name} {selectedEngineer.user.last_name}
              </h3>
              <p className="text-sm text-muted-foreground">{selectedEngineer.user.email}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold">Experience:</label>
                <p className="text-sm">{selectedEngineer.years_of_experience} years</p>
              </div>
              <div>
                <label className="text-sm font-bold">Country:</label>
                <p className="text-sm">{selectedEngineer.country}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-bold">Skills</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedEngineer.specialization.map((skill: string) => (
                  <Badge key={skill} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
              <label className="text-sm font-bold">Languages:</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedEngineer.languages.map((lang: string) => (
                  <Badge key={lang} variant="outline" className="text-xs">
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <label className="text-sm font-bold">Open to work in Nearby cities:</label>
                <p className="text-sm">{selectedEngineer?.open_to_nearby_cities ? "Yes" : "No"}</p>
              </div>
              <div>
                <label className="text-sm font-bold">Authorized to work:</label>
                <p className="text-sm capitalize">{selectedEngineer?.work_authorized ? "Yes" : "No"}</p>
              </div>
              <div>
                <label className="text-sm font-bold">Language Proficiency:</label>
                <p className="text-sm capitalize">
                  {selectedEngineer?.language_proficiency || "Not provided"}
                </p>
              </div>
              <label className="text-sm font-bold">Certifications:</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedEngineer?.certifications.map((cert: string) => (
                  <Badge key={cert} variant="outline" className="text-xs">
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
            {selectedEngineer.cv_url && (
              <Card>
                <CardContent className="p-4">
                  <div className="mb-3">
                    <span className="text-sm font-bold">CV Preview</span>
                  </div>
                  <a
                    href={engineer?.cv_url}
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
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
          {selectedEngineer && !selectedEngineer.is_vetted && (
            <Button onClick={() => onVet(selectedEngineer.engineer_id)} className="text-white">
              <CheckCircle className="w-4 h-4 mr-1" />
              Vet Engineer
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EngineerReviewDialogMobile;
