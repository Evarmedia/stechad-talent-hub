import React, { useState, useEffect } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { subMonths, isAfter, isWithinInterval } from "date-fns";

// Add "onboardedAt" fields for demo filtering purposes
const ENGINEERS = [
  {
    name: "Jane Doe",
    country: "France",
    exp: 5,
    status: "Active",
    email: "jane.doe@email.com",
    phone: "+33 123 456 789",
    onboardedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), // 1 month+ ago
  },
  {
    name: "Max Mustermann",
    country: "Germany",
    exp: 7,
    status: "Blocked",
    email: "max@muster.de",
    phone: "+49 321 444 222",
    onboardedAt: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString(), // 3 months+ ago
  },
  {
    name: "Alice Smith",
    country: "Spain",
    exp: 3,
    status: "Pending",
    email: "alice@smith.es",
    phone: "+34 777 555 101",
    onboardedAt: new Date(Date.now() - 190 * 24 * 60 * 60 * 1000).toISOString(), // 6 months+ ago
  },
  {
    name: "Bob Lee",
    country: "UK",
    exp: 8,
    status: "Active",
    email: "bob.lee@email.com",
    phone: "+44 789 987 654",
    onboardedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
  },
];

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

const filterOptions = [
  { value: "all", label: "All engineers" },
  { value: "active", label: "Active" },
  { value: "onboarded_1m", label: "Onboarded 1 month ago" },
  { value: "onboarded_3m", label: "Onboarded 3 months ago" },
  { value: "onboarded_6m", label: "Onboarded 6 months ago" },
];

const filterEngineers = (engineers: typeof ENGINEERS, filter: string) => {
  const now = new Date();
  switch (filter) {
    case "active":
      return engineers.filter((e) => e.status === "Active");
    case "onboarded_1m":
      // Onboarded between 1-2 months ago
      return engineers.filter((e) => {
        const od = new Date(e.onboardedAt);
        return (
          isWithinInterval(od, {
            start: subMonths(now, 2),
            end: subMonths(now, 1),
          })
        );
      });
    case "onboarded_3m":
      // Onboarded between 3-4 months ago
      return engineers.filter((e) => {
        const od = new Date(e.onboardedAt);
        return (
          isWithinInterval(od, {
            start: subMonths(now, 4),
            end: subMonths(now, 3),
          })
        );
      });
    case "onboarded_6m":
      // Onboarded between 6-7 months ago
      return engineers.filter((e) => {
        const od = new Date(e.onboardedAt);
        return (
          isWithinInterval(od, {
            start: subMonths(now, 7),
            end: subMonths(now, 6),
          })
        );
      });
    default:
      return engineers;
  }
};

const exportToCSV = (data: typeof ENGINEERS, filename = "engineers.csv") => {
  if (!data.length) return;

  // Prepare CSV rows
  const headerRow = ["Name", "Country", "Experience (yrs)", "Status", "Email", "Phone", "Onboarded At"];
  const rows = data.map(eng => [
    eng.name,
    eng.country,
    eng.exp,
    eng.status,
    eng.email,
    eng.phone,
    eng.onboardedAt ? new Date(eng.onboardedAt).toLocaleDateString() : ""
  ]);
  const csvString = [headerRow, ...rows]
    .map(row =>
      row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(",")
    )
    .join("\r\n");

  // Download
  const blob = new Blob([csvString], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 0);
};

const Engineers = () => {
  const [selectedEngineer, setSelectedEngineer] =
    useState<null | typeof ENGINEERS[0]>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  const filteredEngineers = filterEngineers(ENGINEERS, filter);

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Engineers Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
            <div className="w-full sm:w-64">
              <Select
                value={filter}
                onValueChange={(v) => setFilter(v)}
                defaultValue="all"
              >
                <SelectTrigger className="w-full bg-white z-[40]">
                  <SelectValue placeholder="Filter engineers..." />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {filterOptions.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="hover:bg-primary-light"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
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
                ) : filteredEngineers.length === 0 ? (
                  <tr>
                    <td className="p-4 text-center text-muted-foreground" colSpan={6}>
                      No engineers found for this filter.
                    </td>
                  </tr>
                ) : (
                  filteredEngineers.map((eng, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2">{eng.name}</td>
                      <td className="p-2">{eng.country}</td>
                      <td className="p-2">{eng.exp} yrs</td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded ${statusColor(
                            eng.status
                          )} text-xs`}
                        >
                          {eng.status}
                        </span>
                      </td>
                      <td className="p-2">
                        {eng.onboardedAt
                          ? new Date(eng.onboardedAt).toLocaleDateString()
                          : "n/a"}
                      </td>
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
                                <span
                                  className={`ml-2 px-2 py-1 rounded ${statusColor(
                                    selectedEngineer?.status!
                                  )} text-xs`}
                                >
                                  {selectedEngineer?.status}
                                </span>
                              </div>
                              <div>
                                <strong>Onboarded At:</strong>{" "}
                                {selectedEngineer?.onboardedAt
                                  ? new Date(selectedEngineer.onboardedAt).toLocaleDateString()
                                  : "n/a"}
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
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => exportToCSV(filteredEngineers)}
            disabled={loading || filteredEngineers.length === 0}
          >
            Export List (CSV)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Engineers;
