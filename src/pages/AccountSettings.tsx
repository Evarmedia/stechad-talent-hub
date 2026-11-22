import SessionControls from "@/components/SessionControls";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/hooks/useAuthContext";
import { getErrorMessage } from "@/lib/errors";
import apiService from "@/services/apiService";
import websocketService from "@/services/websocketService";
import { requestBrowserLocationPermission } from "@/utils/locationPermission";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function AccountSettings({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const { user, updateUser } = useAuthContext();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [password, setPassword] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [visiblePasswords, setVisiblePasswords] = useState({
    old_password: false,
    new_password: false,
    confirm_password: false,
  });
  const [error, setError] = useState("");
  const changePreference = async (updates: Record<string, boolean>) => {
    setBusy(true);
    setError("");
    try {
      const result = await apiService.putNoId("auth/preferences", updates);
      updateUser(result.data.user);
      toast({ title: "Preferences saved" });
    } catch (cause) {
      setError(getErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  };
  const changeLocation = async (enabled: boolean) => {
    setBusy(true);
    setError("");
    try {
      const permission = enabled
        ? await requestBrowserLocationPermission()
        : null;
      if (enabled && permission?.status !== "granted")
        throw new Error(
          "Allow location access in your browser before enabling sharing.",
        );
      const result = await apiService.putNoId("staff/location-sharing", {
        enabled,
        ...(permission
          ? { permission_status: permission.status, ...permission.location }
          : {}),
      });
      updateUser(result.data.user);
      window.dispatchEvent(new Event("stechad:location-updated"));
      toast({
        title: enabled
          ? "Location sharing enabled"
          : "Location sharing disabled and stored locations cleared",
      });
    } catch (cause) {
      setError(getErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  };
  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (password.new_password !== password.confirm_password) {
      setError("New passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const result = await apiService.post("auth/edit-password", password);
      apiService.setToken(result.data.token);
      apiService.setRefreshToken(result.data.refreshToken);
      websocketService.disconnect();
      websocketService.connect();
      setPassword({ old_password: "", new_password: "", confirm_password: "" });
      setVisiblePasswords({
        old_password: false,
        new_password: false,
        confirm_password: false,
      });
      toast({
        title: "Password changed",
        description: "Other sessions have been signed out.",
      });
    } catch (cause) {
      setError(getErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div
      className={
        embedded ? "space-y-6" : "mx-auto max-w-3xl space-y-6 p-4 md:p-8"
      }
    >
      {!embedded && (
        <div>
          <h1 className='text-2xl font-bold text-primary'>My settings</h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Manage your preferences, privacy, and account security.
          </p>
        </div>
      )}
      {error && (
        <p
          role='alert'
          className='rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive'
        >
          {error}
        </p>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* to be uncommented back on later */}
          {/* {!isAdmin(user) && (
            <div className='flex items-start justify-between gap-4'>
              <div>
                <Label htmlFor='automatic-clock-out'>Automatic clock-out</Label>
                <p className='mt-1 text-sm text-muted-foreground'>
                  {user?.auto_clock_out_enabled
                    ? "Clock out automatically at 5:00 PM in company attendance time."
                    : "Off. No automatic clock-out time is set."}
                </p>
              </div>
              <Switch
                id='automatic-clock-out'
                disabled={busy}
                checked={Boolean(user?.auto_clock_out_enabled)}
                onCheckedChange={(value) =>
                  void changePreference({ auto_clock_out_enabled: value })
                }
              />
            </div>
          )} */}
          <div className='flex items-start justify-between gap-4'>
            <div>
              <Label htmlFor='notification-sounds'>Notification sounds</Label>
              <p className='mt-1 text-sm text-muted-foreground'>
                Play sounds for chat and system notifications. Saved across your
                devices.
              </p>
            </div>
            <Switch
              id='notification-sounds'
              disabled={busy}
              checked={user?.notification_sound_enabled !== false}
              onCheckedChange={(value) =>
                void changePreference({ notification_sound_enabled: value })
              }
            />
          </div>
          <div className='flex items-start justify-between gap-4'>
            <div>
              <Label htmlFor='location-sharing'>Location sharing</Label>
              <p className='mt-1 text-sm text-muted-foreground'>
                Turning this off deletes collected locations from your profile
                and attendance history.
              </p>
            </div>
            <Switch
              id='location-sharing'
              disabled={busy}
              checked={Boolean(user?.location_sharing_enabled)}
              onCheckedChange={(value) => void changeLocation(value)}
            />
          </div>
        </CardContent>
      </Card>
      <SessionControls />
      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
        </CardHeader>
        <CardContent>
          {user?.has_password === false ? (
            <p className='text-sm'>
              This account has no password.{" "}
              <Link
                className='font-medium text-primary underline'
                to='/forgot-password'
              >
                Set a password using password reset.
              </Link>
            </p>
          ) : (
            <form
              onSubmit={(event) => void changePassword(event)}
              className='space-y-4'
            >
              {(
                [
                  ["old_password", "Current password", "current-password"],
                  ["new_password", "New password", "new-password"],
                  ["confirm_password", "Confirm new password", "new-password"],
                ] as const
              ).map(([key, label, autoComplete]) => (
                <div key={key} className='space-y-2'>
                  <Label htmlFor={key}>{label}</Label>
                  <div className='relative'>
                    <Input
                      id={key}
                      type={visiblePasswords[key] ? "text" : "password"}
                      autoComplete={autoComplete}
                      required
                      minLength={key === "old_password" ? 1 : 6}
                      value={password[key]}
                      onChange={(event) =>
                        setPassword((current) => ({
                          ...current,
                          [key]: event.target.value,
                        }))
                      }
                      disabled={busy}
                      className='pr-10'
                    />
                    <button
                      type='button'
                      onClick={() =>
                        setVisiblePasswords((current) => ({
                          ...current,
                          [key]: !current[key],
                        }))
                      }
                      disabled={busy}
                      aria-label={`${visiblePasswords[key] ? "Hide" : "Show"} ${label.toLowerCase()}`}
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                    >
                      {visiblePasswords[key] ? (
                        <EyeOff className='h-4 w-4' />
                      ) : (
                        <Eye className='h-4 w-4' />
                      )}
                    </button>
                  </div>
                </div>
              ))}
              <Button disabled={busy}>
                {busy ? "Saving…" : "Change password"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
