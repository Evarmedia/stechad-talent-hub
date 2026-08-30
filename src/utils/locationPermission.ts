export type LocationPermissionStatus = "not_asked" | "granted" | "denied" | "unavailable";

export type BrowserLocation = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

export type LocationPermissionResult = {
  status: LocationPermissionStatus;
  location?: BrowserLocation;
};

export const requestBrowserLocationPermission = async (): Promise<LocationPermissionResult> => {
  if (!navigator.geolocation) return { status: "unavailable" };

  let knownPermission: PermissionState | undefined;

  try {
    if (navigator.permissions?.query) {
      const permission = await navigator.permissions.query({ name: "geolocation" });
      knownPermission = permission.state;
      if (permission.state === "denied") return { status: "denied" };
    }
  } catch {
    // Some browsers expose geolocation without supporting permission queries.
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        status: "granted",
        location: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        },
      }),
      (error) => resolve({
        status: error.code === error.PERMISSION_DENIED
          ? "denied"
          : knownPermission === "granted"
            ? "granted"
            : "not_asked",
      }),
      { enableHighAccuracy: false, timeout: 15_000, maximumAge: 60_000 },
    );
  });
};
