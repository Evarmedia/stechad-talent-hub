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
import { Eye, CheckCircle, Mail, Briefcase, MapPin, ShieldCheck } from "lucide-react";

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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto mx-4">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">Review Engineer</DialogTitle>
        </DialogHeader>
        {selectedEngineer && (
          <div className="space-y-6 py-2">
            <div className="border-b pb-4">
              <h3 className="text-2xl font-bold">
                {selectedEngineer.user.first_name} {selectedEngineer.user.last_name}
              </h3>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{selectedEngineer.user.email}</span>
                <Badge variant={selectedEngineer.is_vetted ? "secondary" : "outline"} className="text-xs">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  {selectedEngineer.is_vetted ? "Vetted" : "Pending"}
                </Badge>
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
                    {selectedEngineer.years_of_experience} years
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Status:{" "}
                    <span className="font-semibold capitalize">{selectedEngineer.status || "N/A"}</span>
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
                    {selectedEngineer?.user?.city || "City not set"}
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedEngineer?.user?.country}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-4 space-y-3">
                <div>
                  <span className="text-sm font-semibold">Skills</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedEngineer.specialization.map((skill: string) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-semibold">Languages</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedEngineer.languages.map((lang: string) => (
                      <Badge key={lang} variant="outline" className="text-xs">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Proficiency:{" "}
                    <span className="capitalize font-semibold">
                      {selectedEngineer?.language_proficiency || "Not provided"}
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Open to nearby cities</p>
                    <p className="font-semibold">
                      {selectedEngineer?.open_to_nearby_cities ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Authorized to work</p>
                    <p className="font-semibold">
                      {selectedEngineer?.work_authorized ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Certifications</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedEngineer?.certifications.map((cert: string) => (
                        <Badge key={cert} variant="outline" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Vetted</p>
                    <p className="font-semibold">{selectedEngineer.is_vetted ? "Yes" : "No"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

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
