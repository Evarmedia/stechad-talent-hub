
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { useDataContext } from "@/hooks/useDataContext";
import { CheckCircle, User } from "lucide-react";
import React, { useState } from "react";
import TalentReviewDialogDesktop from "./TalentReviewDialogDesktop";
import TalentReviewDialogMobile from "./TalentReviewDialogMobile";
import VetRemarkDialog from "./VetRemarkDialog";

const TalentVetting = () => {
  const [selectedTalent, setSelectedTalent] = useState(null);

  const { getTalents, updateTalent, talents, loading } = useDataContext();
  const [remark, setRemark] = useState("");
  // Vet talent (context-driven)

  const handleVetTalent = async (talentId: string) => {
    try {
      await updateTalent({ talent_id: talentId, is_vetted: true, remark });
      toast({
        title: "Success",
        description: "Talent has been vetted successfully!",
      });
      setSelectedTalent(null);
      setRemark("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to vet talent",
        variant: "destructive",
      });
    }
  };

  // Remove vetting
  const handleUnvetTalent = async (talentId: string) => {
    try {
      await updateTalent({ talent_id: talentId, is_vetted: false });
      toast({
        title: "Success",
        description: "Talent vetting removed.",
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
        <h1 className="text-2xl font-bold">Talent Vetting</h1>
        <p className="text-muted-foreground">Review and vet onboarded talents</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Talents for Vetting ({talents.length})</CardTitle>
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
              : talents.map((talent) => (
                <div key={talent.talent_id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{talent?.user?.first_name} {talent?.user?.last_name}</h3>
                          {talent.is_vetted && (
                            <Badge variant="secondary" className="text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Vetted
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{talent?.user?.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Experience: </span>
                      <span className="font-medium">{talent?.years_of_experience || "Nil"} years</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status: </span>
                      <span className={`font-medium ${talent?.status === 'active' ? 'bg-green-100 text-green-800' : 'text-yellow-800'}`}>
                        {talent?.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm">Skills: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {talent?.specialization?.map(skill => (
                        <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <TalentReviewDialogMobile
                      talent={talent}
                      selectedTalent={selectedTalent}
                      setSelectedTalent={setSelectedTalent}
                      onVet={handleVetTalent}
                    />
                    {talent.is_vetted ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnvetTalent(talent.talent_id)}
                        className="flex-1"
                      >
                        Remove Vetting
                      </Button>
                    ) : (
                      <VetRemarkDialog
                        talent={talent}
                        selectedTalent={selectedTalent}
                        setSelectedTalent={setSelectedTalent}
                        remark={remark}
                        onRemarkChange={handleRemarkChange}
                        onVet={handleVetTalent}
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
                  <th className="p-3 text-sm font-bold text-muted-foreground">Talent</th>
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
                  : talents.map((talent) => (
                    <tr key={talent.talent_id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{`${talent?.user?.first_name} ${talent?.user?.last_name}`}</div>
                            <div className="text-sm text-muted-foreground">{talent?.user?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">{talent?.years_of_experience || "Nil"} years</td>
                      <td className="p-3">{talent?.user?.browser_location_city || talent?.user?.browser_location_state || talent?.user?.city || "Nil"}</td>
                      <td className="p-3">{talent?.user?.browser_location_country || talent?.user?.country || "Nil"}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {talent?.specialization && talent?.specialization.length > 0 ? (
                            talent?.specialization?.slice(0, 2).map(skill => (
                              <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                            ))
                          ) : (
                            <span className="text-sm">No skills listed</span>
                          )}
                          {talent?.specialization?.length > 2 && (
                            <span className="text-xs text-muted-foreground">+{talent?.specialization?.length - 2} more</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`text-sm ${talent?.status === 'active' ? 'bg-green-100 text-green-800 font-bold rounded-lg p-2' : 'text-yellow-600'}`}>
                          {talent?.status}
                        </span>
                      </td>
                      <td className="p-3">
                        {talent?.is_vetted ? (
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
                          <TalentReviewDialogDesktop
                            talent={talent}
                            selectedTalent={selectedTalent}
                            setSelectedTalent={setSelectedTalent}
                            onVet={handleVetTalent}
                          />
                          {talent.is_vetted ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUnvetTalent(talent.talent_id)}
                            >
                              Remove Vetting
                            </Button>
                          ) : (
                            <VetRemarkDialog
                              talent={talent}
                              selectedTalent={selectedTalent}
                              setSelectedTalent={setSelectedTalent}
                              remark={remark}
                              onRemarkChange={handleRemarkChange}
                              onVet={handleVetTalent}
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

export default TalentVetting;
