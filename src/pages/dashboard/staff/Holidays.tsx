import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/apiService";
import { CalendarDays } from "lucide-react";
import { useEffect, useState } from "react";

const StaffHolidaysPage = () => {
  const { toast } = useToast();
  const [holidays, setHolidays] = useState<any[]>([]);
  const [birthdays, setBirthdays] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([apiService.get("staff/holidays"), apiService.get("staff/birthdays")])
      .then(([holidayResponse, birthdayResponse]) => {
        setHolidays(holidayResponse?.data || holidayResponse || []);
        setBirthdays(birthdayResponse?.data || birthdayResponse || []);
      })
      .catch((error) => toast({ title: "Could not load calendar", description: error.message, variant: "destructive" }));
  }, []);

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 space-y-6">
      <div><p className="text-xs uppercase tracking-[0.2em] text-primary/80">STECHAD People</p><h1 className="text-2xl font-bold text-primary">Holidays & birthdays</h1></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card><CardContent className="p-5 flex justify-between"><div><p className="text-xs uppercase text-muted-foreground">Upcoming holidays</p><p className="text-2xl font-bold text-primary mt-2">{holidays.length}</p></div><CalendarDays className="w-5 h-5 text-primary" /></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-xs uppercase text-muted-foreground">Birthdays in 60 days</p><p className="text-2xl font-bold text-primary mt-2">{birthdays.length}</p></CardContent></Card>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
        <Card><CardHeader><CardTitle>Holiday calendar</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Region</TableHead></TableRow></TableHeader><TableBody>{holidays.map((item) => <TableRow key={item.holiday_id}><TableCell>{item.name}</TableCell><TableCell>{item.date}</TableCell><TableCell><Badge variant="secondary">{item.type}</Badge></TableCell><TableCell>{item.region || "All locations"}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
        <Card><CardHeader><CardTitle>Upcoming birthdays</CardTitle></CardHeader><CardContent className="space-y-3">{birthdays.map((item) => <div key={item.id} className="flex justify-between rounded-lg border p-3"><div><p className="font-medium">{item.name}</p><p className="text-sm text-muted-foreground">{item.date}</p></div><Badge variant="outline">{item.daysAway === 0 ? "Today" : `${item.daysAway} days`}</Badge></div>)}{!birthdays.length && <p className="text-sm text-muted-foreground">No birthdays in the next 60 days.</p>}</CardContent></Card>
      </div>
    </div>
  );
};

export default StaffHolidaysPage;
