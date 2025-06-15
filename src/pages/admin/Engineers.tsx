
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

const ENGINEERS = [
  { name: "Jane Doe", country: "France", exp: 5, status: "Active", email: "jane.doe@email.com", phone: "+33 123 456 789" },
  { name: "Max Mustermann", country: "Germany", exp: 7, status: "Blocked", email: "max@muster.de", phone: "+49 321 444 222" },
  { name: "Alice Smith", country: "Spain", exp: 3, status: "Pending", email: "alice@smith.es", phone: "+34 777 555 101" },
];

const statusColor = (status: string) => {
  switch (status) {
    case "Active": return "bg-success text-white";
    case "Blocked": return "bg-destructive text-white";
    case "Pending": return "bg-warning text-white";
    default: return "bg-muted";
  }
};

const Engineers = () => {
  const [selectedEngineer, setSelectedEngineer] = useState<null | typeof ENGINEERS[0]>(null);

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Engineers Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="text-left">
                  <th className="p-2 text-sm text-text-muted">Name</th>
                  <th className="p-2 text-sm text-text-muted">Country</th>
                  <th className="p-2 text-sm text-text-muted">Experience</th>
                  <th className="p-2 text-sm text-text-muted">Status</th>
                  <th className="p-2 text-sm"></th>
                </tr>
              </thead>
              <tbody>
                {ENGINEERS.map((eng, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2">{eng.name}</td>
                    <td className="p-2">{eng.country}</td>
                    <td className="p-2">{eng.exp} yrs</td>
                    <td className="p-2"><span className={`px-2 py-1 rounded ${statusColor(eng.status)} text-xs`}>{eng.status}</span></td>
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
                            <DialogDescription>
                              Engineer profile details.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-2">
                            <div><strong>Name:</strong> {selectedEngineer?.name}</div>
                            <div><strong>Country:</strong> {selectedEngineer?.country}</div>
                            <div><strong>Email:</strong> {selectedEngineer?.email}</div>
                            <div><strong>Phone:</strong> {selectedEngineer?.phone}</div>
                            <div><strong>Experience:</strong> {selectedEngineer?.exp} yrs</div>
                            <div>
                              <strong>Status:</strong>
                              <span className={`ml-2 px-2 py-1 rounded ${statusColor(selectedEngineer?.status!)} text-xs`}>
                                {selectedEngineer?.status}
                              </span>
                            </div>
                          </div>
                          <DialogClose asChild>
                            <Button variant="outline" className="mt-4">Close</Button>
                          </DialogClose>
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button className="mt-4" variant="outline">Export List (CSV)</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Engineers;
