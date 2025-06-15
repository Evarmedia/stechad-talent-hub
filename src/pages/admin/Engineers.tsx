
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { subMonths, isWithinInterval } from "date-fns";
import EngineerFilter from "./EngineerFilter";
import EngineerTable from "./EngineerTable";
import { exportToCSV } from "./exportUtils";
import { Search } from "lucide-react";

const ENGINEERS = [
  {
    name: "Jane Doe",
    country: "France",
    exp: 5,
    status: "Active",
    email: "jane.doe@email.com",
    phone: "+33 123 456 789",
    onboardedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    name: "Max Mustermann",
    country: "Germany",
    exp: 7,
    status: "Blocked",
    email: "max@muster.de",
    phone: "+49 321 444 222",
    onboardedAt: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    name: "Alice Smith",
    country: "Spain",
    exp: 3,
    status: "Pending",
    email: "alice@smith.es",
    phone: "+34 777 555 101",
    onboardedAt: new Date(Date.now() - 190 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    name: "Bob Lee",
    country: "UK",
    exp: 8,
    status: "Active",
    email: "bob.lee@email.com",
    phone: "+44 789 987 654",
    onboardedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

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

const searchEngineers = (engineers: typeof ENGINEERS, search: string) => {
  if (!search.trim()) return engineers;
  const lowered = search.toLowerCase();
  return engineers.filter((e) =>
    [
      e.name,
      e.country,
      String(e.exp),
      e.status,
      e.email,
      e.phone,
      e.onboardedAt ? new Date(e.onboardedAt).toLocaleDateString() : "",
    ]
      .join(" ")
      .toLowerCase()
      .includes(lowered)
  );
};

const Engineers = () => {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  const filtered = filterEngineers(ENGINEERS, filter);
  const searchedAndFiltered = searchEngineers(filtered, search);

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Engineers Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
            <EngineerFilter filter={filter} setFilter={setFilter} filterOptions={filterOptions} />
            <div className="relative w-full sm:w-64">
              <Input
                type="text"
                placeholder="Search engineers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                disabled={loading}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={18} />
            </div>
          </div>
          <EngineerTable engineers={searchedAndFiltered} loading={loading} />
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => exportToCSV(searchedAndFiltered)}
            disabled={loading || searchedAndFiltered.length === 0}
          >
            Export List (CSV)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Engineers;
