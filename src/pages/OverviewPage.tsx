import type { ReactElement } from "react";
import { fetchInfo } from "../api/client";
import type { BeaconEnvelope } from "../api/types";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { JsonPanel } from "../components/JsonPanel";
import { LoadingState } from "../components/LoadingState";
import { formatLocalTimestamp } from "../utils/time";
import { useEndpointData } from "./useEndpointData";
import {
  getConstituentBeaconSummaries,
  getMetadataErrorRows,
  type ConstituentBeaconSummary,
  type MetadataErrorRow
} from "./overviewInfo";

function ConstituentBeaconTable({
  summaries
}: {
  summaries: ConstituentBeaconSummary[];
}): ReactElement {
  if (summaries.length === 0) {
    return <p>None reported.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Beacon</th>
          <th>Welcome URL</th>
        </tr>
      </thead>
      <tbody>
        {summaries.map((summary) => (
          <tr key={summary.key}>
            <td>{summary.beacon}</td>
            <td>
              {summary.welcomeUrl ? (
                <a href={summary.welcomeUrl} rel="noreferrer" target="_blank">
                  {summary.welcomeUrl}
                </a>
              ) : (
                "Unknown"
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function MetadataErrorsTable({ rows }: { rows: MetadataErrorRow[] }): ReactElement | null {
  if (rows.length === 0) {
    return null;
  }

  return (
    <details className="metadata-errors">
      <summary>
        Metadata errors <span className="metadata-error-badge">{rows.length} reported</span>
      </summary>
      <p>These are reported by the network backend.</p>
      <table>
        <thead>
          <tr>
            <th>Reported endpoint</th>
            <th>Path</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <td>{row.endpoint}</td>
              <td>{row.path ?? "Unknown"}</td>
              <td>{row.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}

export function OverviewContent({ data }: { data: BeaconEnvelope }): ReactElement {
  const summaries = getConstituentBeaconSummaries(data);
  const metadataErrorRows = getMetadataErrorRows(data);

  return (
    <>
      <p>
        Beacon ID: {typeof data.meta?.beaconId === "string" ? data.meta.beaconId : "Unknown"}
      </p>
      <p>
        API version: {typeof data.meta?.apiVersion === "string" ? data.meta.apiVersion : "Unknown"}
      </p>
      <h3>Constituent beacons</h3>
      <p className="table-note">
        Welcome URLs are info published by the constituent responses; they are not
        necessarily constituent API root URLs.
      </p>
      <ConstituentBeaconTable summaries={summaries} />
      <MetadataErrorsTable rows={metadataErrorRows} />
      <JsonPanel title="/info response" value={data} />
    </>
  );
}

export function OverviewPage(): ReactElement {
  const { data, error, loading, fetchedAt, refresh } = useEndpointData(fetchInfo);

  return (
    <section>
      <h2>Overview</h2>
      {fetchedAt ? <p>Last fetched: {formatLocalTimestamp(fetchedAt)}</p> : null}
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} onRetry={() => void refresh()} /> : null}
      {!loading && !error && !data ? <EmptyState message="No data found." /> : null}
      {!loading && !error && data ? <OverviewContent data={data} /> : null}
    </section>
  );
}
