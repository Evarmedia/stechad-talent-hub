import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/apiService";
import { TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

const StaffKpisPage = () => {
  const { toast } = useToast();
  const [kpis, setKpis] = useState<any[]>([]);
  useEffect(() => {
    apiService.get("staff/kpis")
      .then((response) => setKpis(response?.data || response || []))
      .catch((error) => toast({ title: "Could not load KPIs", description: error.message, variant: "destructive" }));
  }, []);
  const average = kpis.length ? Math.round(kpis.reduce((sum, item) => sum + item.progress, 0) / kpis.length) : 0;
  return <div className="py-8 max-w-7xl mx-auto px-4 space-y-6"><div><p className="text-xs uppercase tracking-[0.2em] text-primary/80">STECHAD People</p><h1 className="text-2xl font-bold text-primary">KPIs & appraisals</h1></div><Card className="max-w-sm"><CardContent className="p-5 flex justify-between"><div><p className="text-xs uppercase text-muted-foreground">Average progress</p><p className="text-2xl font-bold text-primary mt-2">{average}%</p></div><TrendingUp className="w-5 h-5 text-primary" /></CardContent></Card><div className="grid grid-cols-1 gap-6">{kpis.map((item) => <Card key={item.id}><CardHeader><CardTitle className="flex justify-between">{item.title}<Badge variant="outline">{item.status}</Badge></CardTitle></CardHeader><CardContent className="space-y-4"><div className="flex flex-wrap justify-between gap-2 text-sm text-muted-foreground"><span>Target: {item.target}</span><span>{item.review}{item.periodStart ? ` · ${item.periodStart} – ${item.periodEnd || "open"}` : ""}</span></div><Progress value={item.progress} /><div className="flex justify-between text-sm"><span>{item.notes || "No appraisal notes yet"}</span><span className="font-semibold text-primary">{item.progress}%{item.score !== null ? ` · score ${item.score}` : ""}</span></div></CardContent></Card>)}</div>{!kpis.length && <Card><CardContent className="py-10 text-center text-muted-foreground">No KPIs have been assigned yet.</CardContent></Card>}</div>;
};

export default StaffKpisPage;
