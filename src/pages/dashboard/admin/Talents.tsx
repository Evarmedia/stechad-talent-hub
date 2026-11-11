import { TalentDetailsDialog } from "@/components/TalentDetailsDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDataContext } from "@/hooks/useDataContext";
import { Download, Eye, Search, User } from "lucide-react";
import { useState } from "react";
import { exportToXLSX } from "./exportUtils";
import VetRemarkDialog from "./VetRemarkDialog";
// import TalentTable from "./TalentTable";
// import { exportToXLSX } from "./exportToXlsx";

interface Talent {
  name: string;
  country: string;
  years_of_experience: number;
  status?: string;
  onboarded_at?: string;
  user: { first_name: string; last_name: string; city?: string; country?: string; browser_location_city?: string; browser_location_state?: string; browser_location_country?: string; email?: string; phone_number?: string; };
}

const Talents = () => {
  // const [loading, setLoading] = useState(true);
  // const [talents, setTalents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [selectedTalent, setSelectedTalent] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { talents, loading } = useDataContext();

  // console.log("Talents at Talents page", talents);

  const filteredTalents = talents.filter((talent) => {
    const fullName =
      `${talent.user?.first_name || ""} ${talent.user?.last_name || ""}`.toLowerCase();

    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      talent.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      talent.user?.browser_location_country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      talent.user?.country?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      talent.status?.toLowerCase() === statusFilter.toLowerCase();

    let matchesDate = true;
    if (dateFilter === "Recent" && talent.onboarded_at) {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      matchesDate = new Date(talent.onboarded_at) >= oneMonthAgo;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const sortedTalents =
    dateFilter === "Recent"
      ? [...filteredTalents].sort(
        (a, b) =>
          new Date(b.onboarded_at || 0).getTime() -
          new Date(a.onboarded_at || 0).getTime()
      )
      : filteredTalents;

  const getStatusColor = (status: string) =>
    status === "active"
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";

  const handleViewTalent = (talent: Talent) => {
    setSelectedTalent(talent);
    setIsDetailsOpen(true);
  };

  const handleExportXlsx = () => {
    const dataToExport = sortedTalents.map(talent => ({
      Date: talent.onboarded_at?.split("T")[0],
      name: `${talent.user.first_name} ${talent.user.last_name}`,
      email: talent.user.email,
      phone: talent.user.phone_number || 'N/A',
      date_Of_Birth: talent.date_of_birth,
      skills: talent.specialization.join(", "),
      languages: talent.languages.join(", "),
      language_Proficiency: talent.language_proficiency,
      country: talent.user.browser_location_country || talent.user.country,
      experience: talent.years_of_experience,
      status: talent.status,
      open_To_Nearby_Cities: talent.open_to_nearby_cities ? 'Yes' : 'No',
      has_Drivers_Licence: talent.has_drivers_licence ? 'Yes' : 'No',
      skill_Level: talent.skill_level,
      certifications: talent.certifications.join(", "),
      project_Types: talent.project_types.join(", "),
      open_To_Training: talent.open_to_training ? 'Yes' : 'No',
      Are_You_A_Freelancer: talent.is_freelancer ? 'Yes' : 'No',
      Are_You_Following_Us_On_Linkedin: talent.follows_linkedin ? 'Yes' : 'No',
      Would_You_Like_To_Subscribe_To_Our_Newsletter: talent.newsletter ? 'Yes' : 'No',
      // cv_Url: talent.cv_url || 'N/A',
      CV: talent.cv_url
        ? { f: `HYPERLINK("${talent.cv_url}", "talent_cv")` }
        : "N/A",
    }));

    exportToXLSX(dataToExport);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Talents Management</h1>
        <Button onClick={handleExportXlsx} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export data
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search talents by name, country or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-md px-3 py-2 bg-background"
        >
          <option value="All">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="border rounded-md px-3 py-2 bg-background"
        >
          <option value="All">All Talents</option>
          <option value="Recent">Recent (Last Month)</option>
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Talents List ({sortedTalents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile: Card layout */}
          <div className="md:hidden space-y-4">
            {loading
              ? Array(3).fill(0).map((_, i) => (
                <div key={i} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </div>
                </div>
              ))
              : sortedTalents.map((talent) => (
                <div key={talent.talent_id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{talent?.user?.first_name} {talent?.user?.last_name}</h3>
                        {talent.is_vetted ? (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                            Vetted
                          </Badge>
                        ) : (<Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                          Not Vetted
                        </Badge>)}
                      </div>
                      <p className="text-sm text-muted-foreground">{talent?.user?.email}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium">Skills: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {talent.specialization.length === 0 && (
                          <Badge variant="outline" className="text-xs">
                            N/A
                          </Badge>
                        )}
                        {talent.specialization.map(skill => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Experience: </span>
                      <span className="font-medium">{talent?.years_of_experience || "N/A"}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Country: </span>
                      <span className="font-medium">{talent.user.country || talent.user.browser_location_country || "Remote"}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <Badge className={getStatusColor(talent.status)}>
                      {talent.status}
                    </Badge>
                    <Button size="sm" variant="outline" onClick={() => handleViewTalent(talent)}>
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
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
                  <th className="p-3 text-sm font-bold text-muted-foreground">Skills</th>
                  <th className="p-3 text-sm font-bold text-muted-foreground">Experience</th>
                  <th className="p-3 text-sm font-bold text-muted-foreground">City</th>
                  <th className="p-3 text-sm font-bold text-muted-foreground">Country</th>
                  <th className="p-3 text-sm font-bold text-muted-foreground">Status</th>
                  <th className="p-3 text-sm font-bold text-muted-foreground">Joined</th>
                  <th className="p-3 text-sm font-bold text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array(3).fill(0).map((_, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-3"><Skeleton className="h-5 w-40" /></td>
                      <td className="p-3"><Skeleton className="h-5 w-32" /></td>
                      <td className="p-3"><Skeleton className="h-5 w-20" /></td>
                      <td className="p-3"><Skeleton className="h-5 w-20" /></td>
                      <td className="p-3"><Skeleton className="h-5 w-16" /></td>
                      <td className="p-3"><Skeleton className="h-5 w-24" /></td>
                      <td className="p-3"><Skeleton className="h-8 w-20" /></td>
                    </tr>
                  ))
                  : sortedTalents.map((talent) => (
                    <tr key={talent.talent_id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{talent?.user?.first_name} {talent?.user?.last_name}</span>
                              {talent.is_vetted ? (
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                  Vetted
                                </Badge>
                              ) : (<Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                Not Vetted
                              </Badge>)}
                            </div>
                            <span className="text-sm text-muted-foreground">{talent?.user?.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {talent.specialization.length === 0 && (
                            <Badge variant="outline" className="text-xs">
                              N/A
                            </Badge>
                          )}
                          {talent.specialization.slice(0, 2).map(skill => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {talent.specialization.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{talent.specialization.length - 2}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-sm">{talent?.years_of_experience || "N/A"}</td>
                      <td className="p-3 text-sm">{talent?.user?.browser_location_city || talent?.user?.browser_location_state || talent?.user?.city || "Remote"}</td>
                      <td className="p-3 text-sm">{talent?.user?.country || talent?.user?.browser_location_country || "Remote"}</td>
                      <td className="p-3">
                        <Badge className={getStatusColor(talent.status)}>
                          {talent.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">{talent.onboarded_at?.split("T")[0] || 'N/A'}</td>
                      <td className="p-3">
                        <Button size="sm" variant="outline" onClick={() => handleViewTalent(talent)}>
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* <TalentTable talents={sortedTalents} loading={loading} /> */}
        </CardContent>
      </Card>

      <TalentDetailsDialog
        talent={selectedTalent}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
      
    </div>
  );
};

export default Talents;
