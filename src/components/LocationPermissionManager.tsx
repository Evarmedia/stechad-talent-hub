import { useAuthContext } from "@/hooks/useAuthContext";
import apiService from "@/services/apiService";
import { requestBrowserLocationPermission } from "@/utils/locationPermission";
import { useEffect, useRef } from "react";

const LocationPermissionManager = () => {
  const { user, updateUser } = useAuthContext();
  const attemptedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!user?.user_id) return;
    const permissionStatus = user.location_permission_status || "not_asked";
    const needsInitialPermission = permissionStatus === "not_asked";
    const needsGrantedLocation = permissionStatus === "granted"
      && user.location_sharing_enabled
      && (user.browser_latitude === null || user.browser_latitude === undefined || user.browser_longitude === null || user.browser_longitude === undefined);
    if (!needsInitialPermission && !needsGrantedLocation) return;
    if (attemptedUserId.current === user.user_id) return;
    attemptedUserId.current = user.user_id;

    const captureConsent = async () => {
      const result = await requestBrowserLocationPermission();
      if (result.status === "not_asked") return;
      const enabled = result.status === "granted";
      try {
        const response = await apiService.putNoId("staff/location-sharing", {
          enabled,
          permission_status: result.status,
          ...result.location,
        });
        updateUser({
          ...user,
          location_sharing_enabled: enabled,
          location_permission_status: result.status,
          ...(response?.data?.browserLocation ? {
            browser_latitude: response.data.browserLocation.latitude,
            browser_longitude: response.data.browserLocation.longitude,
            browser_location_accuracy: response.data.browserLocation.accuracy,
            browser_location_updated_at: response.data.browserLocation.updatedAt,
          } : {}),
        });
      } catch (error) {
        console.error("Could not save browser location permission", error);
      }
    };

    void captureConsent();
  }, [updateUser, user]);

  return null;
};

export default LocationPermissionManager;
