import AccountSettings from "@/pages/AccountSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ServerDataState from "@/components/ServerDataState";
import { useServerState } from "@/hooks/useServerState";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/errors";
import apiService from "@/services/apiService";

const SystemSettings = () => {
  const { toast } = useToast();
  const { loading, error, start, resolve, reject } = useServerState();
  const [prefix, setPrefix] = useState("");
  const [savedPrefix, setSavedPrefix] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const load = useCallback(async () => {
    start();
    try {
      const response = await apiService.get("admin/settings");
      const value = response.data.EMPLOYEE_ID_PREFIX;
      setPrefix(value);
      setSavedPrefix(value);
      resolve();
    } catch (cause) { reject(cause); }
  }, [start, resolve, reject]);
  useEffect(() => { void load(); }, [load]);
  const save = async () => {
    setSaving(true);
    try {
      await apiService.putNoId("admin/settings", { settings: { EMPLOYEE_ID_PREFIX: prefix } });
      setSavedPrefix(prefix);
      setConfirming(false);
      toast({ title: "Employee ID prefix updated" });
    } catch (cause) {
      toast({ title: "Could not save settings", description: getErrorMessage(cause), variant: "destructive" });
    } finally { setSaving(false); }
  };
  if (loading || error) return <ServerDataState title="System settings" error={error} onRetry={() => void load()} />;
  return <div>
    <Card><CardHeader><CardTitle>System settings</CardTitle></CardHeader><CardContent>
      <form onSubmit={event => { event.preventDefault(); setConfirming(true); }} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="employee-id-prefix" className="font-semibold text-primary">Employee ID prefix</label>
          <Input id="employee-id-prefix" required pattern="[A-Z][A-Z0-9]{0,9}" maxLength={10} value={prefix} onChange={event => setPrefix(event.target.value.toUpperCase())} disabled={saving} aria-describedby="prefix-help" />
          <p id="prefix-help" className="text-sm text-muted-foreground">1–10 uppercase letters or digits, starting with a letter. New IDs will look like {prefix || "STE"}0748. Existing IDs and reserved invitations keep their IDs.</p>
        </div>
        <Button disabled={saving || prefix === savedPrefix}>Save changes</Button>
      </form>
    </CardContent></Card>
    <Dialog open={confirming} onOpenChange={open => !saving && setConfirming(open)}>
      <DialogContent><DialogHeader><DialogTitle>Change employee ID prefix?</DialogTitle><DialogDescription>New employee IDs will use {prefix}. Existing employee IDs will stay the same.</DialogDescription></DialogHeader>
        <DialogFooter><Button variant="outline" disabled={saving} onClick={() => setConfirming(false)}>Cancel</Button><Button disabled={saving} onClick={() => void save()}>{saving ? "Saving…" : "Confirm change"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  </div>;
};
export default function AdminSettings() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "system" ? "system" : "account";
  return <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-8"><div><h1 className="text-2xl font-bold text-primary">Settings</h1><p className="mt-1 text-sm text-muted-foreground">Manage your account and system preferences.</p></div><Tabs value={tab} onValueChange={(value) => setParams({ tab: value }, { replace: true })}><TabsList><TabsTrigger value="account">Account</TabsTrigger><TabsTrigger value="system">System</TabsTrigger></TabsList><TabsContent value="account"><AccountSettings embedded /></TabsContent><TabsContent value="system"><SystemSettings /></TabsContent></Tabs></div>;
}
