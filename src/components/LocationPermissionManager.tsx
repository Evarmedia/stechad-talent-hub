import { useAuthContext } from "@/hooks/useAuthContext";
import apiService from "@/services/apiService";
import { requestBrowserLocationPermission } from "@/utils/locationPermission";
import { useEffect, useRef } from "react";

const LocationPermissionManager = () => {
  const { user, updateUser } = useAuthContext();
  const attemptedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!user?.user_id || (user.location_permission_status || "not_asked") !== "not_asked") return;
    if (attemptedUserId.current === user.user_id) return;
    attemptedUserId.current = user.user_id;

    const captureConsent = async () => {
      const permissionStatus = await requestBrowserLocationPermission();
      if (permissionStatus === "not_asked") return;
      const enabled = permissionStatus === "granted";
      try {
        await apiService.putNoId("staff/location-sharing", { enabled, permission_status: permissionStatus });
        updateUser({ ...user, location_sharing_enabled: enabled, location_permission_status: permissionStatus });
      } catch (error) {
        console.error("Could not save browser location permission", error);
      }
    };

    void captureConsent();
  }, [updateUser, user]);

  return null;
};

export default LocationPermissionManager;
