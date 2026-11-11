
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

const statusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-success text-white";
    case "Blocked":
      return "bg-destructive text-white";
    case "Pending":
      return "bg-warning text-white";
    default:
      return "bg-muted";
  }
};

interface Talent {
  name: string;
  country: string;
  years_of_experience: number;
  status?: string;
  onboarded_at?: string;
  user: { first_name: string; last_name: string; country?: string; email?: string; phone_number?: string;};
}

interface TalentTableProps {
  talents: Talent[];
  loading: boolean;
}

const TalentTable: React.FC<TalentTableProps> = ({ talents, loading }) => {
  const [selectedTalent, setSelectedTalent] = useState<null | Talent>(null);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="text-left">
            <th className="p-2 text-sm text-text-muted">Name</th>
            <th className="p-2 text-sm text-text-muted">Country</th>
            <th className="p-2 text-sm text-text-muted">Experience</th>
            <th className="p-2 text-sm text-text-muted">Status</th>
            <th className="p-2 text-sm text-text-muted">Date Onboarded</th>
            <th className="p-2 text-sm"></th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array(3)
              .fill(0)
              .map((_, i) => (
                <tr key={i} className="border-b">
                  <td className="p-2">
                    <Skeleton className="h-6 w-36" />
                  </td>
                  <td className="p-2">
                    <Skeleton className="h-6 w-20" />
                  </td>
                  <td className="p-2">
                    <Skeleton className="h-6 w-16" />
                  </td>
                  <td className="p-2">
                    <Skeleton className="h-6 w-20" />
                  </td>
                  <td className="p-2">
                    <Skeleton className="h-6 w-24" />
                  </td>
                  <td className="p-2">
                    <Skeleton className="h-8 w-24" />
                  </td>
                </tr>
              ))
          ) : talents.length === 0 ? (
            <tr>
              <td className="p-4 text-center text-muted-foreground" colSpan={6}>
                No talents found for this filter.
              </td>
            </tr>
          ) : (
            talents.map((talent, i) => (
              <tr key={i} className="border-b">
                <td className="p-2">{talent.user.first_name} {talent.user.last_name}</td>
                <td className="p-2">{talent.country}</td>
                <td className="p-2">{talent.years_of_experience} yrs</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded ${statusColor(talent.status)} text-xs`}>
                    {talent.status}
                  </span>
                </td>
                <td className="p-2">{talent.onboarded_at ? new Date(talent.onboarded_at).toLocaleDateString() : "n/a"}</td>
                <td className="p-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedTalent(talent)}
                      >
                        View Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {selectedTalent?.user.first_name}'s Profile
                        </DialogTitle>
                        <DialogDescription>Talent profile details.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-2">
                        <div>
                          <strong>Name:</strong> {selectedTalent?.user.first_name} {selectedTalent?.user.last_name}
                        </div>
                        <div>
                          <strong>Country:</strong> {selectedTalent?.user.country}
                        </div>
                        <div>
                          <strong>Email:</strong> {selectedTalent?.user?.email}
                        </div>
                        <div>
                          <strong>Phone:</strong> {selectedTalent?.user?.phone_number}
                        </div>
                        <div>
                          <strong>Experience:</strong> {selectedTalent?.years_of_experience} years
                        </div>
                        <div>
                          <strong>Status:</strong>
                          <span className={`ml-2 px-2 py-1 rounded ${statusColor(selectedTalent?.status)} text-xs`}>
                            {selectedTalent?.status}
                          </span>
                        </div>
                        <div>
                          <strong>Onboarded At:</strong> {selectedTalent?.onboarded_at ? new Date(selectedTalent.onboarded_at).toLocaleDateString() : "n/a"}
                        </div>
                      </div>
                      <DialogClose asChild>
                        <Button variant="outline" className="mt-4">
                          Close
                        </Button>
                      </DialogClose>
                    </DialogContent>
                  </Dialog>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TalentTable;
