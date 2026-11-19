import { useCallback, useEffect, useRef, useState } from "react";
import apiService from "@/services/apiService";
import { getErrorMessage } from "@/lib/errors";
export function useRemoteData<T>(endpoint: string | null, params: Record<string, unknown> = {}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const version = useRef(0);
  const key = JSON.stringify(params);
  const reload = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    const current = ++version.current;
    if (!endpoint) { setData(null); setLoading(false); return; }
    setLoading(true); setError("");
    void apiService.get(endpoint, JSON.parse(key)).then((response) => {
      if (version.current === current) setData(response.data);
    }).catch((cause: unknown) => { if (version.current === current) setError(getErrorMessage(cause)); })
      .finally(() => { if (version.current === current) setLoading(false); });
    return () => { ++version.current; };
  }, [endpoint, key, revision]);
  return { data, loading, error, reload };
}
