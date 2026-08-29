
import { PMProjectsDialog } from "@/components/PMProjectsDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { useDataContext } from "@/hooks/useDataContext";
import { Plus, User } from "lucide-react";
import { useState } from "react";

const ProjectManagers = () => {
  // const [loading, setLoading] = useState(true);
  // const [pms, setPms] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPmEmail, setNewPmEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedPM, setSelectedPM] = useState(null);
  const [isProjectsDialogOpen, setIsProjectsDialogOpen] = useState(false);

  const { getProjectManagers, getProjects, projectManagers, projects, inviteProjectManager, loading } = useDataContext();

  interface ProjectManager {
    project_managers_id: string;
    user: {
      first_name: string;
      last_name: string;
      email: string;
    };
    total_projects: number;
    is_active: boolean;
    created_at: string;
  }

  const handleAddPM = async () => {
    if (!newPmEmail || !/^\S+@\S+\.\S+$/.test(newPmEmail)) {
      toast({ title: "Error", description: "Please enter a valid email", variant: "destructive" });
      return;
    }

    const pmData = {
      first_name: firstName,
      // last_name: lastName,
      email: newPmEmail,
    };

    try {

      await inviteProjectManager(pmData);

      setIsAddDialogOpen(false);
      setFirstName("");
      setLastName("");
      setNewPmEmail("");
      toast({ title: "Success", description: "PM invitation sent successfully!" });      
    } catch (error) {
      // setFirstName("");
      // setLastName("");
      // setNewPmEmail("");
      throw new Error(error);
    }
  };

  const handleViewProjects = (pm: ProjectManager) => {
    setSelectedPM(pm);
    setIsProjectsDialogOpen(true);
  };

  // console.log("PMs", projectManagers);

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Project Managers</h1>
        {/* Invite Pm button and Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto text-white">
              <Plus className="w-4 h-4 mr-2" />
              Invite PM
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md mx-4">
            {loading ? (
              <>
                <DialogHeader>
                  <Skeleton className="h-6 w-40" />
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-44" />
                    <Skeleton className="h-10 w-full" />
                  </div>

                  <div className="space-y-2">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                </div>

                <DialogFooter>
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-36" />
                </DialogFooter>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>Add Project Manager</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">
                      Project Manager's Name:
                    </label>
                    <Input
                      value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Name (Optional)"
                    />

                    <label className="text-sm font-medium mt-4 block">
                      Email Address:
                    </label>
                    <Input
                      type="email"
                      value={newPmEmail}
                      onChange={(e) => setNewPmEmail(e.target.value)}
                      placeholder="pm@company.com"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      An invitation will be sent to this email
                    </p>
                  </div>
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button className="text-white" onClick={handleAddPM}>Send Invitation</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Managers List ({projectManagers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile: Card layout */}
          <div className="md:hidden space-y-4">
            {loading
              ? Array(2).fill(0).map((_, i) => (
                <div key={i} className="border rounded-lg p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              ))
              : projectManagers.map((pm) => (
                <div key={pm.project_managers_id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{`${pm.user?.first_name} ${pm.user?.last_name}`}</h3>
                      <p className="text-sm text-muted-foreground">{pm.user?.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Projects: </span>
                      <span className="font-medium">{pm.pm_projects?.length}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Joined: </span>
                      <span className="font-medium">{pm?.created_at?.split("T")[0]}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded text-xs ${pm?.is_active === true ? "bg-green-500 text-white" : "bg-yellow-500 text-white"
                      }`}>
                      {pm.is_active === true ? "Active" : "Inactive"}
                    </span>
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => handleViewProjects(pm)}>
                      View Projects
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
                  <th className="p-3 text-sm font-medium text-muted-foreground">PM</th>
                  <th className="p-3 text-sm font-medium text-muted-foreground">Email</th>
                  <th className="p-3 text-sm font-medium text-muted-foreground">Projects</th>
                  <th className="p-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="p-3 text-sm font-medium text-muted-foreground">Joined</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array(2).fill(0).map((_, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-3"><Skeleton className="h-5 w-32" /></td>
                      <td className="p-3"><Skeleton className="h-5 w-40" /></td>
                      <td className="p-3"><Skeleton className="h-5 w-16" /></td>
                      <td className="p-3"><Skeleton className="h-5 w-20" /></td>
                      <td className="p-3"><Skeleton className="h-5 w-24" /></td>
                      <td className="p-3"><Skeleton className="h-8 w-32" /></td>
                    </tr>
                  ))
                  : projectManagers.map((pm) => (
                    <tr key={pm.project_managers_id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-medium">{`${pm.user?.first_name} ${pm.user?.last_name}`}</span>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">{pm.user?.email}</td>
                      <td className="p-3">{pm?.pm_projects?.length}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${pm.status === "active" ? "bg-green-500 text-white" : "bg-yellow-500 text-white"
                          }`}>
                          {pm.status}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">{pm.created_at?.split("T")[0]}</td>
                      <td className="p-3">
                        <Button size="sm" variant="outline" className="text-xs" onClick={() => handleViewProjects(pm)}>
                          View Projects
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <PMProjectsDialog
        pm={selectedPM}
        isOpen={isProjectsDialogOpen}
        onClose={() => setIsProjectsDialogOpen(false)}
      />
    </div>
  );
};

export default ProjectManagers;
