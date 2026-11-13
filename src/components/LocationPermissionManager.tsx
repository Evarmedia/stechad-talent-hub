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
      && (user.browser_latitude === null || user.browser_latitude === undefined || user.browser_longitude === null || user.browser_longitude === undefined || !user.browser_location_country);
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
          ...(result.location ? {
            browser_latitude: result.location.latitude,
            browser_longitude: result.location.longitude,
            browser_location_accuracy: result.location.accuracy,
          } : {}),
          ...(response?.data?.browserLocation ? {
            browser_location_updated_at: response.data.browserLocation.updatedAt,
            browser_location_address: response.data.browserLocation.formattedAddress,
            browser_location_city: response.data.browserLocation.city,
            browser_location_state: response.data.browserLocation.state,
            browser_location_country: response.data.browserLocation.country,
            browser_location_country_code: response.data.browserLocation.countryCode,
          } : {}),
        });
        window.dispatchEvent(new Event("stechad:location-updated"));
      } catch (error) {
        console.error("Could not save browser location permission", error);
      }
    };

    void captureConsent();
  }, [updateUser, user]);

  return null;
};

export default LocationPermissionManager;
