
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { User, Plus, Eye } from "lucide-react";
import { PMProjectsDialog } from "@/components/PMProjectsDialog";

const INITIAL_PMS = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@company.com",
    projectsCount: 3,
    status: "Active",
    joinedAt: "2024-01-15"
  },
  {
    id: 2,
    name: "Alice Smith",
    email: "alice.smith@company.com",
    projectsCount: 2,
    status: "Active",
    joinedAt: "2024-03-20"
  }
];

const ProjectManagers = () => {
  const [loading, setLoading] = useState(true);
  const [pms, setPms] = useState(INITIAL_PMS);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPmEmail, setNewPmEmail] = useState("");
  const [selectedPM, setSelectedPM] = useState(null);
  const [isProjectsDialogOpen, setIsProjectsDialogOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  const handleAddPM = () => {
    if (!newPmEmail || !/^\S+@\S+\.\S+$/.test(newPmEmail)) {
      toast({ title: "Error", description: "Please enter a valid email", variant: "destructive" });
      return;
    }

    const newPM = {
      id: Math.max(...pms.map(p => p.id)) + 1,
      name: newPmEmail.split('@')[0].replace('.', ' '),
      email: newPmEmail,
      projectsCount: 0,
      status: "Pending",
      joinedAt: new Date().toISOString().split('T')[0]
    };

    setPms([...pms, newPM]);
    setNewPmEmail("");
    setIsAddDialogOpen(false);
    toast({ title: "Success", description: "PM invitation sent successfully!" });
  };

  const handleViewProjects = (pm: any) => {
    setSelectedPM(pm);
    setIsProjectsDialogOpen(true);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Project Managers</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add PM
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md mx-4">
            <DialogHeader>
              <DialogTitle>Add Project Manager</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email Address</label>
                <Input
                  type="email"
                  placeholder="pm@company.com"
                  value={newPmEmail}
                  onChange={(e) => setNewPmEmail(e.target.value)}
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
              <Button onClick={handleAddPM}>Send Invitation</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Managers List</CardTitle>
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
              : pms.map((pm) => (
                  <div key={pm.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{pm.name}</h3>
                        <p className="text-sm text-muted-foreground">{pm.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Projects: </span>
                        <span className="font-medium">{pm.projectsCount}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Joined: </span>
                        <span className="font-medium">{pm.joinedAt}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-1 rounded text-xs ${
                        pm.status === "Active" ? "bg-green-500 text-white" : "bg-yellow-500 text-white"
                      }`}>
                        {pm.status}
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
                  : pms.map((pm) => (
                      <tr key={pm.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <span className="font-medium">{pm.name}</span>
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground">{pm.email}</td>
                        <td className="p-3">{pm.projectsCount}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            pm.status === "Active" ? "bg-green-500 text-white" : "bg-yellow-500 text-white"
                          }`}>
                            {pm.status}
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground">{pm.joinedAt}</td>
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
