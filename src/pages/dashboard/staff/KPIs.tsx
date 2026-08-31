import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/apiService";
import { BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";

const StaffKpisPage = () => {
  const { toast } = useToast();
  const [kpis, setKpis] = useState<any[]>([]);
  useEffect(() => {
    apiService.get("staff/kpis")
      .then((response) => setKpis(response?.data || response || []))
      .catch((error) => toast({ title: "Could not load KPIs", description: error.message, variant: "destructive" }));
  }, []);
  const scores = kpis.map((item) => item.latestScore).filter((score) => score !== null && score !== undefined).map(Number);
  const average = scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : null;
  return <div className="p-4 md:p-8 mx-auto space-y-6"><div><p className="text-xs uppercase tracking-[0.2em] text-primary/80">STECHAD People</p><h1 className="text-2xl font-bold text-primary">KPIs & appraisals</h1></div><Card className="max-w-sm"><CardContent className="p-5 flex justify-between"><div><p className="text-xs uppercase text-muted-foreground">Average KPI score</p><p className="text-2xl font-bold text-primary mt-2">{average === null ? "Not scored" : `${average}%`}</p></div><BarChart3 className="w-5 h-5 text-primary" /></CardContent></Card><div className="grid grid-cols-1 gap-6">{kpis.map((item) => <Card key={item.id}><CardHeader><CardTitle className="flex flex-wrap justify-between gap-2"><span>{item.title}</span><div className="flex gap-2"><Badge variant="outline">{item.review}</Badge><Badge variant={item.currentAppraisal ? "white" : "secondary"}>{item.currentPeriod.label}: {item.currentAppraisal ? `${item.currentAppraisal.overallScore}%` : "Awaiting score"}</Badge></div></CardTitle></CardHeader><CardContent className="space-y-4">{item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}<div className="space-y-2">{item.criteria.map((criterion: any, index: number) => { const score = item.currentAppraisal?.criteriaScores?.find((entry: any) => entry.criterionId === criterion.id)?.score; return <div key={criterion.id} className="flex justify-between gap-3 rounded-lg border p-3 text-sm"><span>{index + 1}. {criterion.title}</span><strong className="text-primary">{score === undefined ? "—" : `${score}%`}</strong></div>; })}</div>{item.currentAppraisal?.notes && <div className="rounded-lg bg-muted/50 p-3 text-sm"><p className="font-medium">Appraisal note</p><p className="mt-1 text-muted-foreground">{item.currentAppraisal.notes}</p></div>}{item.appraisals.length > 0 && <details><summary className="cursor-pointer text-sm font-medium text-primary">Score history</summary><div className="mt-2 space-y-2">{item.appraisals.map((record: any) => <div key={record.id} className="flex justify-between rounded-md border px-3 py-2 text-sm"><span>{record.periodLabel}</span><strong>{record.overallScore}%</strong></div>)}</div></details>}</CardContent></Card>)}</div>{!kpis.length && <Card><CardContent className="py-10 text-center text-muted-foreground">No KPIs have been assigned yet.</CardContent></Card>}</div>;
};

export default StaffKpisPage;
