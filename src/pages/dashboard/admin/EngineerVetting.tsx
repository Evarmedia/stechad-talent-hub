
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, User, Eye } from "lucide-react";
import { useDataContext } from "@/hooks/useDataContext";

const EngineerVetting = () => {
  const [selectedEngineer, setSelectedEngineer] = useState(null);

  const { getEngineers, updateEngineer, engineers, loading } = useDataContext();

  // Vet engineer (context-driven)

  const handleVetEngineer = async (engineerId: string) => {
    try {
      await updateEngineer({ engineer_id: engineerId, is_vetted: true });
      toast({
        title: "Success",
        description: "Engineer has been vetted successfully!",
      });
      setSelectedEngineer(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to vet engineer",
        variant: "destructive",
      });
    }
  };

  // Remove vetting
  const handleUnvetEngineer = async (engineerId: string) => {
    try {
      await updateEngineer({ engineer_id: engineerId, is_vetted: false });
      toast({
        title: "Success",
        description: "Engineer vetting removed.",
      });
    } catch (error) {
      toast({
        title: "Info",
        description: "Failed to remove vetting",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Engineer Vetting</h1>
        <p className="text-muted-foreground">Review and vet onboarded engineers</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Engineers for Vetting ({engineers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile: Card layout */}
          <div className="md:hidden space-y-4">
            {loading
              ? Array(3).fill(0).map((_, i) => (
                <div key={i} className="border rounded-lg p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              ))
              : engineers.map((engineer) => (
                <div key={engineer.engineer_id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{engineer.user.first_name} {engineer.user.last_name}</h3>
                          {engineer.is_vetted && (
                            <Badge variant="secondary" className="text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Vetted
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{engineer.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Experience: </span>
                      <span className="font-medium">{engineer.years_of_experience} years</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status: </span>
                      <span className={`font-medium ${engineer.status === 'active' ? 'bg-green-100 text-green-800' : 'text-yellow-800'}`}>
                        {engineer.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm">Skills: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {engineer.specialization.map(skill => (
                        <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
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
                              <h3 className="font-bold">{selectedEngineer.user.first_name} {selectedEngineer.user.last_name}</h3>
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
                                {selectedEngineer.specialization.map(skill => (
                                  <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                                ))}
                              </div>
                              <label className="text-sm font-bold">Languages:</label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {selectedEngineer.languages.map(lang => (
                                  <Badge key={lang} variant="outline" className="text-xs">{lang}</Badge>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div>
                                <label className="text-sm font-bold">Open to work in Nearby cities:</label>
                                <p className="text-sm">
                                  {selectedEngineer?.open_to_nearby_cities ? "Yes" : "No"}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-bold">Authorized to work:</label>
                                <p className="text-sm capitalize">
                                  {selectedEngineer?.work_authorized ? "Yes" : "No"}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-bold">Language Proficiency:</label>
                                <p className="text-sm capitalize">
                                  {selectedEngineer?.language_proficiency || 'Not provided'}
                                </p>
                              </div>
                              <label className="text-sm font-bold">Certifications:</label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {selectedEngineer?.certifications.map(cert => (
                                  <Badge key={cert} variant="outline" className="text-xs">{cert}</Badge>
                                ))}
                              </div>
                            </div>
                            {/* Add CV url preview */}
                            {selectedEngineer.cv_url && (
                              <Card>
                                <CardContent className="p-4">
                                  <div className="mb-3">
                                    <span className="text-sm font-bold">CV Preview</span>
                                  </div>
                                  <a href={engineer?.cv_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
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
                            <Button onClick={() => handleVetEngineer(selectedEngineer.engineer_id)}>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Vet Engineer
                            </Button>
                          )}
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    {engineer.is_vetted ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnvetEngineer(engineer.engineer_id)}
                        className="flex-1"
                      >
                        Remove Vetting
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleVetEngineer(engineer.engineer_id)}
                        className="flex-1"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Vet
                      </Button>
                    )}
                  </div>
                </div>
              ))}
          </div>

          {/* Desktop: Table layout */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="p-3 text-sm font-medium text-muted-foreground">Engineer</th>
                  <th className="p-3 text-sm font-medium text-muted-foreground">Experience</th>
                  <th className="p-3 text-sm font-medium text-muted-foreground">Skills</th>
                  <th className="p-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="p-3 text-sm font-medium text-muted-foreground">Vetted</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array(3).fill(0).map((_, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-3"><Skeleton className="h-5 w-32" /></td>
                      <td className="p-3"><Skeleton className="h-5 w-16" /></td>
                      <td className="p-3"><Skeleton className="h-5 w-40" /></td>
                      <td className="p-3"><Skeleton className="h-5 w-20" /></td>
                      <td className="p-3"><Skeleton className="h-5 w-16" /></td>
                      <td className="p-3"><Skeleton className="h-8 w-32" /></td>
                    </tr>
                  ))
                  : engineers.map((engineer) => (
                    <tr key={engineer.engineer_id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{`${engineer.user.first_name} ${engineer.user.last_name}`}</div>
                            <div className="text-sm text-muted-foreground">{engineer.user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">{engineer.years_of_experience} years</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {engineer.specialization.slice(0, 2).map(skill => (
                            <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                          ))}
                          {engineer.specialization.length > 2 && (
                            <span className="text-xs text-muted-foreground">+{engineer.specialization.length - 2} more</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`text-sm ${engineer.status === 'active' ? 'bg-green-100 text-green-800 font-bold rounded-lg p-2' : 'text-yellow-600'}`}>
                          {engineer.status}
                        </span>
                      </td>
                      <td className="p-3">
                        {engineer.is_vetted ? (
                          <Badge variant="secondary">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Vetted
                          </Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedEngineer(engineer)}
                              >
                                Review
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Review Engineer</DialogTitle>
                              </DialogHeader>
                              {selectedEngineer && (
                                <div className="space-y-4">
                                  <div>
                                    <h3 className="font-bold">{selectedEngineer.user.first_name} {selectedEngineer.user.last_name}</h3>
                                    <p className="text-sm text-muted-foreground">{selectedEngineer.user.email}</p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-bold">Experience:</label>
                                      <p className="text-sm">{selectedEngineer?.years_of_experience} years</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-bold">Country:</label>
                                      <p className="text-sm">{selectedEngineer?.user.country}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-bold">Skills</label>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {selectedEngineer?.specialization.map(skill => (
                                        <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                                      ))}
                                    </div>
                                    <label className="text-sm font-bold">Languages:</label>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {selectedEngineer?.languages.map(lang => (
                                        <Badge key={lang} variant="outline" className="text-xs">{lang}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <div>
                                      <label className="text-sm font-bold">Open to work in Nearby cities:</label>
                                      <p className="text-sm">
                                        {selectedEngineer?.open_to_nearby_cities ? "Yes" : "No"}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-bold">Authorized to work:</label>
                                      <p className="text-sm capitalize">
                                        {selectedEngineer?.work_authorized ? "Yes" : "No"}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-bold">Language Proficiency:</label>
                                      <p className="text-sm capitalize">
                                        {selectedEngineer?.language_proficiency || 'Not provided'}
                                      </p>
                                    </div>
                                    <label className="text-sm font-bold">Certifications:</label>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {selectedEngineer?.certifications.map(cert => (
                                        <Badge key={cert} variant="outline" className="text-xs">{cert}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                  {/* Add CV url preview */}
                                  {selectedEngineer.cv_url && (
                                    <Card>
                                      <CardContent className="p-4">
                                        <div className="mb-3">
                                          <span className="text-sm font-bold">CV Preview</span>
                                        </div>
                                        <a href={engineer?.cv_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
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
                                  <Button onClick={() => handleVetEngineer(selectedEngineer.engineer_id)}>
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Vet Engineer
                                  </Button>
                                )}
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          {engineer.is_vetted ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUnvetEngineer(engineer.engineer_id)}
                            >
                              Remove Vetting
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleVetEngineer(engineer.engineer_id)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Vet
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EngineerVetting;
