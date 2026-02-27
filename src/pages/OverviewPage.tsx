import type { ReactElement } from "react";
import { fetchInfo } from "../api/client";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { JsonPanel } from "../components/JsonPanel";
import { LoadingState } from "../components/LoadingState";
import { formatLocalTimestamp } from "../utils/time";
import { useEndpointData } from "./useEndpointData";

export function OverviewPage(): ReactElement {
  const { data, error, loading, fetchedAt, refresh } = useEndpointData(fetchInfo);

  return (
    <section>
      <h2>Overview</h2>
      {fetchedAt ? <p>Last fetched: {formatLocalTimestamp(fetchedAt)}</p> : null}
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} onRetry={() => void refresh()} /> : null}
      {!loading && !error && !data ? <EmptyState message="No data found." /> : null}

      {!loading && !error && data ? (
        <>
          <p>
            Beacon ID:{" "}
            {typeof data.meta?.beaconId === "string" ? data.meta.beaconId : "Unknown"}
          </p>
          <p>
            API version:{" "}
            {typeof data.meta?.apiVersion === "string"
              ? data.meta.apiVersion
              : "Unknown"}
          </p>
          <JsonPanel title="/info response" value={data} />
        </>
      ) : null}
    </section>
  );
}
