import type { ReactElement } from "react";
import { fetchConfiguration } from "../api/client";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { JsonPanel } from "../components/JsonPanel";
import { LoadingState } from "../components/LoadingState";
import { formatLocalTimestamp } from "../utils/time";
import { useEndpointData } from "./useEndpointData";

export function ConfigurationPage(): ReactElement {
  const { data, error, loading, fetchedAt, refresh } = useEndpointData(
    fetchConfiguration
  );

  return (
    <section>
      <h2>Configuration</h2>
      {fetchedAt ? <p>Last fetched: {formatLocalTimestamp(fetchedAt)}</p> : null}
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} onRetry={() => void refresh()} /> : null}
      {!loading && !error && !data ? <EmptyState message="No data found." /> : null}

      {!loading && !error && data ? (
        <>
          <p>
            Entry types:{" "}
            {typeof data.response?.entryTypes === "object" &&
            data.response?.entryTypes !== null
              ? Object.keys(data.response.entryTypes).length
              : 0}
          </p>
          <JsonPanel title="/configuration response" value={data} />
        </>
      ) : null}
    </section>
  );
}
