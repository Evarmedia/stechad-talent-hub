
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ENGINEERS = [
  { name: "Jane Doe", country: "France", exp: 5, status: "Active" },
  { name: "Max Mustermann", country: "Germany", exp: 7, status: "Blocked" },
  { name: "Alice Smith", country: "Spain", exp: 3, status: "Pending" },
];

const statusColor = (status: string) => {
  switch (status) {
    case "Active": return "bg-success text-white";
    case "Blocked": return "bg-destructive text-white";
    case "Pending": return "bg-warning text-white";
    default: return "bg-muted";
  }
};

const Engineers = () => (
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
                    <Button size="sm" variant="outline">View Profile</Button>
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

export default Engineers;
