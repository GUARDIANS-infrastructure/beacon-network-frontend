import { useCallback, useEffect, useState } from "react";

type EndpointState<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
  fetchedAt: Date | null;
  refresh: () => Promise<void>;
};

export const useEndpointData = <T>(
  fetcher: () => Promise<T>
): EndpointState<T> => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetcher();
      setData(response);
      setFetchedAt(new Date());
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch endpoint.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    data,
    error,
    loading,
    fetchedAt,
    refresh
  };
};
