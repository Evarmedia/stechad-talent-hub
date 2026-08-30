import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/apiService";
import { requestBrowserLocationPermission } from "@/utils/locationPermission";
import { MapPin, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useState } from "react";

const emptyForm = { first_name: "", last_name: "", phone_number: "", country: "", city: "", current_assignment: "", work_region: "", date_of_birth: "" };

const StaffProfile = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);

  const loadProfile = async () => {
    try {
      const response = await apiService.get("staff/profile");
      const user = response?.data || response;
      setProfile(user);
      setForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone_number: user.phone_number || "",
        country: user.country || "",
        city: user.city || "",
        current_assignment: user.current_assignment || "",
        work_region: user.work_region || "",
        date_of_birth: user.date_of_birth || "",
      });
    } catch (error: any) {
      toast({ title: "Could not load profile", description: error.message, variant: "destructive" });
    }
  };
  useEffect(() => { loadProfile(); }, []);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    try { await apiService.putNoId("staff/profile", form); toast({ title: "Profile updated" }); await loadProfile(); }
    catch (error: any) { toast({ title: "Could not update profile", description: error.message, variant: "destructive" }); }
  };

  const toggleLocation = async (enabled: boolean) => {
    try {
      const permissionStatus = enabled ? await requestBrowserLocationPermission() : profile?.location_permission_status;
      const canEnable = enabled && permissionStatus === "granted";
      await apiService.putNoId("staff/location-sharing", { enabled: canEnable, ...(permissionStatus ? { permission_status: permissionStatus } : {}) });
      setProfile((current: any) => ({ ...current, location_sharing_enabled: canEnable, location_permission_status: permissionStatus }));
      if (enabled && !canEnable) toast({ title: "Location permission not granted", description: "Allow location access in your browser settings to enable this feature." });
    }
    catch (error: any) { toast({ title: "Could not update location consent", description: error.message, variant: "destructive" }); }
  };

  return (
    <form onSubmit={save} className="py-8 max-w-6xl mx-auto px-4 space-y-6">
      <div><p className="text-sm uppercase tracking-[0.2em] text-primary/80">Profile</p><h1 className="text-2xl font-bold text-primary">Staff profile</h1></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2"><CardHeader><CardTitle className="flex items-center gap-2"><UserRound className="w-5 h-5" />Personal details</CardTitle></CardHeader><CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input required placeholder="First name" value={form.first_name} onChange={(e) => setForm((p) => ({ ...p, first_name: e.target.value }))} />
          <Input required placeholder="Last name" value={form.last_name} onChange={(e) => setForm((p) => ({ ...p, last_name: e.target.value }))} />
          <Input placeholder="Phone" value={form.phone_number} onChange={(e) => setForm((p) => ({ ...p, phone_number: e.target.value }))} />
          <Input disabled value={profile?.email || ""} />
          <Input placeholder="Country" value={form.country} onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))} />
          <Input placeholder="City" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} />
          <div><label className="mb-1 block text-xs text-muted-foreground">Date of birth</label><Input type="date" value={form.date_of_birth} onChange={(e) => setForm((p) => ({ ...p, date_of_birth: e.target.value }))} /></div>
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="w-5 h-5" />Employment</CardTitle></CardHeader><CardContent className="space-y-3">
          <div className="flex justify-between rounded-lg border p-3"><span>Role</span><Badge variant="outline">{profile?.role?.replace("_", " ") || "Staff"}</Badge></div>
          <div className="rounded-lg border p-3"><p className="text-sm text-muted-foreground">Employee ID</p><p className="font-medium">{profile?.employee_id || "Pending assignment"}</p></div>
          <div className="rounded-lg border p-3"><p className="text-sm text-muted-foreground">Department</p><p className="font-medium">{profile?.department?.name || "Unassigned"}</p></div>
          <div className="rounded-lg border p-3"><p className="text-sm text-muted-foreground">Reports to</p><p className="font-medium">{profile?.reporting_manager ? `${profile.reporting_manager.first_name || ""} ${profile.reporting_manager.last_name || ""}`.trim() || profile.reporting_manager.email : "Unassigned"}</p></div>
          <div className="flex justify-between rounded-lg border p-3"><span>Location consent</span><Switch checked={Boolean(profile?.location_sharing_enabled)} onCheckedChange={toggleLocation} /></div>
        </CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5" />Assignment & work context</CardTitle></CardHeader><CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4"><Input placeholder="Current assignment" value={form.current_assignment} onChange={(e) => setForm((p) => ({ ...p, current_assignment: e.target.value }))} /><Input placeholder="Work region" value={form.work_region} onChange={(e) => setForm((p) => ({ ...p, work_region: e.target.value }))} /></CardContent></Card>
      <div className="flex justify-end"><Button>Save profile changes</Button></div>
    </form>
  );
};

export default StaffProfile;
