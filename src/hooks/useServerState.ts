import { useCallback, useState } from "react";
import { getErrorMessage } from "@/lib/errors";

// Keep successful data visible on background refresh; failures never masquerade as empty data.
export function useServerState() {
  const [state, setState] = useState<{ loading: boolean; error: string | null }>({ loading: true, error: null });
  const start = useCallback((force = false) => setState(current => force || current.error ? { loading: true, error: null } : current), []);
  const resolve = useCallback(() => setState({ loading: false, error: null }), []);
  const reject = useCallback((error: unknown) => setState({ loading: false, error: getErrorMessage(error) }), []);
  return { ...state, start, resolve, reject };
}
