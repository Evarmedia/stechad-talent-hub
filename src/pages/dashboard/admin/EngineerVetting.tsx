
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { useDataContext } from "@/hooks/useDataContext";
import { CheckCircle, User } from "lucide-react";
import React, { useState } from "react";
import EngineerReviewDialogDesktop from "./EngineerReviewDialogDesktop";
import EngineerReviewDialogMobile from "./EngineerReviewDialogMobile";
import VetRemarkDialog from "./VetRemarkDialog";

const EngineerVetting = () => {
  const [selectedEngineer, setSelectedEngineer] = useState(null);

  const { getEngineers, updateEngineer, engineers, loading } = useDataContext();
  const [remark, setRemark] = useState("");
  // Vet engineer (context-driven)

  const handleVetEngineer = async (engineerId: string) => {
    try {
      await updateEngineer({ engineer_id: engineerId, is_vetted: true, remark });
      toast({
        title: "Success",
        description: "Engineer has been vetted successfully!",
      });
      setSelectedEngineer(null);
      setRemark("");
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
  const handleRemarkChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRemark(e.target.value);
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
                          <h3 className="font-medium">{engineer?.user?.first_name} {engineer?.user?.last_name}</h3>
                          {engineer.is_vetted && (
                            <Badge variant="secondary" className="text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Vetted
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{engineer?.user?.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Experience: </span>
                      <span className="font-medium">{engineer?.years_of_experience || "Nil"} years</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status: </span>
                      <span className={`font-medium ${engineer?.status === 'active' ? 'bg-green-100 text-green-800' : 'text-yellow-800'}`}>
                        {engineer?.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm">Skills: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {engineer?.specialization?.map(skill => (
                        <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <EngineerReviewDialogMobile
                      engineer={engineer}
                      selectedEngineer={selectedEngineer}
                      setSelectedEngineer={setSelectedEngineer}
                      onVet={handleVetEngineer}
                    />
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
                      <VetRemarkDialog
                        engineer={engineer}
                        selectedEngineer={selectedEngineer}
                        setSelectedEngineer={setSelectedEngineer}
                        remark={remark}
                        onRemarkChange={handleRemarkChange}
                        onVet={handleVetEngineer}
                        onResetRemark={() => setRemark("")}
                      />
                    ) }
                  </div>
                </div>
              ))}
          </div>

          {/* Desktop: Table layout */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="p-3 text-sm font-bold text-muted-foreground">Engineer</th>
                  <th className="p-3 text-sm font-bold text-muted-foreground">Experience</th>
                  <th className="p-3 text-sm font-bold text-muted-foreground">City</th>
                  <th className="p-3 text-sm font-bold text-muted-foreground">Country</th>
                  <th className="p-3 text-sm font-bold text-muted-foreground">Skills</th>
                  <th className="p-3 text-sm font-bold text-muted-foreground">Status</th>
                  <th className="p-3 text-sm font-bold text-muted-foreground">Vetted</th>
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
                            <div className="font-medium">{`${engineer?.user?.first_name} ${engineer?.user?.last_name}`}</div>
                            <div className="text-sm text-muted-foreground">{engineer?.user?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">{engineer?.years_of_experience || "Nil"} years</td>
                      <td className="p-3">{engineer?.user?.browser_location_city || engineer?.user?.browser_location_state || engineer?.user?.city || "Nil"}</td>
                      <td className="p-3">{engineer?.user?.browser_location_country || engineer?.user?.country || "Nil"}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {engineer?.specialization && engineer?.specialization.length > 0 ? (
                            engineer?.specialization?.slice(0, 2).map(skill => (
                              <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                            ))
                          ) : (
                            <span className="text-sm">No skills listed</span>
                          )}
                          {engineer?.specialization?.length > 2 && (
                            <span className="text-xs text-muted-foreground">+{engineer?.specialization?.length - 2} more</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`text-sm ${engineer?.status === 'active' ? 'bg-green-100 text-green-800 font-bold rounded-lg p-2' : 'text-yellow-600'}`}>
                          {engineer?.status}
                        </span>
                      </td>
                      <td className="p-3">
                        {engineer?.is_vetted ? (
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
                          <EngineerReviewDialogDesktop
                            engineer={engineer}
                            selectedEngineer={selectedEngineer}
                            setSelectedEngineer={setSelectedEngineer}
                            onVet={handleVetEngineer}
                          />
                          {engineer.is_vetted ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUnvetEngineer(engineer.engineer_id)}
                            >
                              Remove Vetting
                            </Button>
                          ) : (
                            <VetRemarkDialog
                              engineer={engineer}
                              selectedEngineer={selectedEngineer}
                              setSelectedEngineer={setSelectedEngineer}
                              remark={remark}
                              onRemarkChange={handleRemarkChange}
                              onVet={handleVetEngineer}
                              onResetRemark={() => setRemark("")}
                            />
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
