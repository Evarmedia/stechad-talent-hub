import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { CheckCircle, User, Eye } from "lucide-react";

const INITIAL_ENGINEERS = [
  {
    id: 1,
    name: "Jane Doe",
    email: "jane.doe@email.com",
    experience: 5,
    skills: ["React", "Node.js", "AWS"],
    status: "Active",
    vetted: false,
    onboardedAt: "2024-06-01",
    portfolio: "https://janedoe.dev",
    github: "https://github.com/janedoe"
  },
  {
    id: 2,
    name: "Max Mustermann",
    email: "max@muster.de",
    experience: 7,
    skills: ["Java", "Spring", "Docker"],
    status: "Active",
    vetted: true,
    onboardedAt: "2024-05-15",
    portfolio: "https://maxdev.io",
    github: "https://github.com/maxmuster"
  },
  {
    id: 3,
    name: "Alice Smith",
    email: "alice@smith.es",
    experience: 3,
    skills: ["Python", "Django", "PostgreSQL"],
    status: "Pending",
    vetted: false,
    onboardedAt: "2024-06-10",
    portfolio: "https://alicesmith.com",
    github: "https://github.com/alicesmith"
  }
];

const EngineerVetting = () => {
  const [loading, setLoading] = useState(true);
  const [engineers, setEngineers] = useState(INITIAL_ENGINEERS);
  const [selectedEngineer, setSelectedEngineer] = useState<typeof INITIAL_ENGINEERS[0] | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  const handleVetEngineer = (engineerId: number) => {
    setEngineers(engineers.map(eng => 
      eng.id === engineerId ? { ...eng, vetted: true } : eng
    ));
    toast({ title: "Success", description: "Engineer has been vetted successfully!" });
    setSelectedEngineer(null);
  };

  const handleUnvetEngineer = (engineerId: number) => {
    setEngineers(engineers.map(eng => 
      eng.id === engineerId ? { ...eng, vetted: false } : eng
    ));
    toast({ title: "Success", description: "Engineer vetting status removed." });
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Engineer Vetting</h1>
        <p className="text-muted-foreground">Review and vet onboarded engineers</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Engineers Awaiting Vetting</CardTitle>
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
              : engineers.map((engineer) => (
                  <div key={engineer.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{engineer.name}</h3>
                            {engineer.vetted && (
                              <Badge variant="secondary" className="text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Vetted
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{engineer.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Experience: </span>
                        <span className="font-medium">{engineer.experience} years</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status: </span>
                        <span className={`font-medium ${engineer.status === 'Active' ? 'text-green-600' : 'text-yellow-600'}`}>
                          {engineer.status}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">Skills: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {engineer.skills.map(skill => (
                          <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setSelectedEngineer(engineer)}
                            className="flex-1"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md mx-4">
                          <DialogHeader>
                            <DialogTitle>Review Engineer</DialogTitle>
                          </DialogHeader>
                          {selectedEngineer && (
                            <div className="space-y-4">
                              <div>
                                <h3 className="font-medium">{selectedEngineer.name}</h3>
                                <p className="text-sm text-muted-foreground">{selectedEngineer.email}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Experience</label>
                                  <p className="text-sm">{selectedEngineer.experience} years</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Onboarded</label>
                                  <p className="text-sm">{selectedEngineer.onboardedAt}</p>
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Skills</label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {selectedEngineer.skills.map(skill => (
                                    <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div>
                                  <label className="text-sm font-medium">Portfolio</label>
                                  <a href={selectedEngineer.portfolio} target="_blank" rel="noopener noreferrer" 
                                     className="text-sm text-primary underline block">
                                    {selectedEngineer.portfolio}
                                  </a>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">GitHub</label>
                                  <a href={selectedEngineer.github} target="_blank" rel="noopener noreferrer" 
                                     className="text-sm text-primary underline block">
                                    {selectedEngineer.github}
                                  </a>
                                </div>
                              </div>
                            </div>
                          )}
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Close</Button>
                            </DialogClose>
                            {selectedEngineer && !selectedEngineer.vetted && (
                              <Button onClick={() => handleVetEngineer(selectedEngineer.id)}>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Vet Engineer
                              </Button>
                            )}
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      {engineer.vetted ? (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleUnvetEngineer(engineer.id)}
                          className="flex-1"
                        >
                          Remove Vetting
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => handleVetEngineer(engineer.id)}
                          className="flex-1"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Vet
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
          </div>

          {/* Desktop: Table layout */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="p-3 text-sm font-medium text-muted-foreground">Engineer</th>
                  <th className="p-3 text-sm font-medium text-muted-foreground">Experience</th>
                  <th className="p-3 text-sm font-medium text-muted-foreground">Skills</th>
                  <th className="p-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="p-3 text-sm font-medium text-muted-foreground">Vetted</th>
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
                  : engineers.map((engineer) => (
                      <tr key={engineer.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{engineer.name}</div>
                              <div className="text-sm text-muted-foreground">{engineer.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">{engineer.experience} years</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {engineer.skills.slice(0, 2).map(skill => (
                              <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                            ))}
                            {engineer.skills.length > 2 && (
                              <span className="text-xs text-muted-foreground">+{engineer.skills.length - 2} more</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`text-sm ${engineer.status === 'Active' ? 'text-green-600' : 'text-yellow-600'}`}>
                            {engineer.status}
                          </span>
                        </td>
                        <td className="p-3">
                          {engineer.vetted ? (
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
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => setSelectedEngineer(engineer)}
                                >
                                  Review
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Review Engineer</DialogTitle>
                                </DialogHeader>
                                {selectedEngineer && (
                                  <div className="space-y-4">
                                    <div>
                                      <h3 className="font-medium">{selectedEngineer.name}</h3>
                                      <p className="text-sm text-muted-foreground">{selectedEngineer.email}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-sm font-medium">Experience</label>
                                        <p className="text-sm">{selectedEngineer.experience} years</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Onboarded</label>
                                        <p className="text-sm">{selectedEngineer.onboardedAt}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Skills</label>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {selectedEngineer.skills.map(skill => (
                                          <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                                        ))}
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <div>
                                        <label className="text-sm font-medium">Portfolio</label>
                                        <a href={selectedEngineer.portfolio} target="_blank" rel="noopener noreferrer" 
                                           className="text-sm text-primary underline block">
                                          {selectedEngineer.portfolio}
                                        </a>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">GitHub</label>
                                        <a href={selectedEngineer.github} target="_blank" rel="noopener noreferrer" 
                                           className="text-sm text-primary underline block">
                                          {selectedEngineer.github}
                                        </a>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                <DialogFooter>
                                  <DialogClose asChild>
                                    <Button variant="outline">Close</Button>
                                  </DialogClose>
                                  {selectedEngineer && !selectedEngineer.vetted && (
                                    <Button onClick={() => handleVetEngineer(selectedEngineer.id)}>
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Vet Engineer
                                    </Button>
                                  )}
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            {engineer.vetted ? (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleUnvetEngineer(engineer.id)}
                              >
                                Remove Vetting
                              </Button>
                            ) : (
                              <Button 
                                size="sm" 
                                onClick={() => handleVetEngineer(engineer.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Vet
                              </Button>
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

export default EngineerVetting;
