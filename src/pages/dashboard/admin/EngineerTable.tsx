
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

interface Engineer {
  name: string;
  country: string;
  exp: number;
  status: string;
  email: string;
  phone: string;
  onboardedAt: string;
}

interface EngineerTableProps {
  engineers: Engineer[];
  loading: boolean;
}

const EngineerTable: React.FC<EngineerTableProps> = ({ engineers, loading }) => {
  const [selectedEngineer, setSelectedEngineer] = useState<null | Engineer>(null);

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
          ) : engineers.length === 0 ? (
            <tr>
              <td className="p-4 text-center text-muted-foreground" colSpan={6}>
                No engineers found for this filter.
              </td>
            </tr>
          ) : (
            engineers.map((eng, i) => (
              <tr key={i} className="border-b">
                <td className="p-2">{eng.name}</td>
                <td className="p-2">{eng.country}</td>
                <td className="p-2">{eng.exp} yrs</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded ${statusColor(eng.status)} text-xs`}>
                    {eng.status}
                  </span>
                </td>
                <td className="p-2">{eng.onboardedAt ? new Date(eng.onboardedAt).toLocaleDateString() : "n/a"}</td>
                <td className="p-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedEngineer(eng)}
                      >
                        View Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {selectedEngineer?.name}'s Profile
                        </DialogTitle>
                        <DialogDescription>Engineer profile details.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-2">
                        <div>
                          <strong>Name:</strong> {selectedEngineer?.name}
                        </div>
                        <div>
                          <strong>Country:</strong> {selectedEngineer?.country}
                        </div>
                        <div>
                          <strong>Email:</strong> {selectedEngineer?.email}
                        </div>
                        <div>
                          <strong>Phone:</strong> {selectedEngineer?.phone}
                        </div>
                        <div>
                          <strong>Experience:</strong> {selectedEngineer?.exp} yrs
                        </div>
                        <div>
                          <strong>Status:</strong>
                          <span className={`ml-2 px-2 py-1 rounded ${statusColor(selectedEngineer?.status!)} text-xs`}>
                            {selectedEngineer?.status}
                          </span>
                        </div>
                        <div>
                          <strong>Onboarded At:</strong> {selectedEngineer?.onboardedAt ? new Date(selectedEngineer.onboardedAt).toLocaleDateString() : "n/a"}
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

export default EngineerTable;
