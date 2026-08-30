export type LocationPermissionStatus = "not_asked" | "granted" | "denied" | "unavailable";

export const requestBrowserLocationPermission = async (): Promise<LocationPermissionStatus> => {
  if (!navigator.geolocation) return "unavailable";

  try {
    if (navigator.permissions?.query) {
      const permission = await navigator.permissions.query({ name: "geolocation" });
      if (permission.state === "granted") return "granted";
      if (permission.state === "denied") return "denied";
    }
  } catch {
    // Some browsers expose geolocation without supporting permission queries.
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      () => resolve("granted"),
      (error) => resolve(error.code === error.PERMISSION_DENIED ? "denied" : "not_asked"),
      { enableHighAccuracy: false, timeout: 15_000, maximumAge: 60_000 },
    );
  });
};
