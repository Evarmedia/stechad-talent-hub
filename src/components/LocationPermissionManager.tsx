import { isAdmin } from "@/lib/permissions";
import { useAuthContext } from "@/hooks/useAuthContext";
import apiService from "@/services/apiService";
import { useEffect } from "react";

// Browser permission is requested only by an explicit consent action in Settings.
export default function LocationPermissionManager() {
  const { user } = useAuthContext();
  useEffect(() => {
    if (isAdmin(user) || !user?.location_sharing_enabled || user.location_permission_status !== "granted" || !navigator.geolocation) return;
    let alive = true;
    let pending = false;
    const controller = new AbortController();
    const capture = async () => {
      if (!alive || pending) return;
      pending = true;
      try {
        const response = await apiService.get("staff/attendance");
        if (!alive || !response.data?.summary?.today?.isOpen) { pending = false; return; }
        navigator.geolocation.getCurrentPosition((position) => {
          if (!alive) { pending = false; return; }
          void apiService.request("/staff/location", {
            method: "POST", signal: controller.signal,
            data: { latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy },
          }).catch(() => {}).finally(() => { pending = false; });
        }, () => { pending = false; }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
      } catch { pending = false; }
    };
    void capture();
    const interval = window.setInterval(capture, 60000);
    return () => { alive = false; controller.abort(); window.clearInterval(interval); };
  }, [user?.user_id, user?.role, user?.location_sharing_enabled, user?.location_permission_status, user?.location_consent_version]);
  return null;
}
