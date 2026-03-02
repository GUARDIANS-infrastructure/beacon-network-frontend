import type { ReactElement } from "react";
import { fetchInfo } from "../api/client";
import type { BeaconEnvelope } from "../api/types";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { JsonPanel } from "../components/JsonPanel";
import { LoadingState } from "../components/LoadingState";
import { formatLocalTimestamp } from "../utils/time";
import { useEndpointData } from "./useEndpointData";

type ConstituentStatus = {
  key: string;
  endpoint: string;
  beacon: string;
  status: "ok" | "error";
  detail: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const asString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() !== "" ? value : undefined;

const getConstituentStatuses = (data: BeaconEnvelope): ConstituentStatus[] => {
  const errorRows: ConstituentStatus[] = [];
  const responseRows: ConstituentStatus[] = [];
  const seen = new Set<string>();

  const metadataErrors = data.response?.info;
  if (isRecord(metadataErrors) && Array.isArray(metadataErrors.metadata_errors)) {
    metadataErrors.metadata_errors
      .filter(isRecord)
      .forEach((item, index) => {
        const endpoint = asString(item.endpoint) ?? `Unknown endpoint ${index + 1}`;
        const errors = Array.isArray(item.errors) ? item.errors : [];
        const firstMessage = errors.find(isRecord)?.message;
        const detail = asString(firstMessage) ?? "Constituent endpoint returned an error.";
        const key = `error:${endpoint}:${index}`;
        errorRows.push({
          key,
          endpoint,
          beacon: "Unknown",
          status: "error",
          detail
        });
        seen.add(endpoint);
      });
  }

  if (Array.isArray(data.responses)) {
    data.responses.filter(isRecord).forEach((item, index) => {
      const response = isRecord(item.response) ? item.response : undefined;
      const meta = isRecord(item.meta) ? item.meta : undefined;
      const beacon =
        asString(response?.name) ??
        asString(response?.id) ??
        asString(meta?.beaconId) ??
        `Constituent ${index + 1}`;
      const endpoint =
        asString(response?.alternativeUrl) ??
        asString(response?.welcomeUrl) ??
        asString(meta?.beaconId) ??
        `Unknown endpoint ${index + 1}`;

      if (seen.has(endpoint)) {
        return;
      }

      responseRows.push({
        key: `ok:${endpoint}:${index}`,
        endpoint,
        beacon,
        status: "ok",
        detail: "Valid response received."
      });
    });
  }

  return [...errorRows, ...responseRows];
};

export function OverviewPage(): ReactElement {
  const { data, error, loading, fetchedAt, refresh } = useEndpointData(fetchInfo);
  const constituentStatuses = data ? getConstituentStatuses(data) : [];

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
          <h3>Constituent endpoints</h3>
          {constituentStatuses.length === 0 ? (
            <p>Unknown</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Beacon</th>
                  <th>Endpoint</th>
                  <th>Status</th>
                  <th>Detail</th>
                </tr>
              </thead>
              <tbody>
                {constituentStatuses.map((item) => (
                  <tr key={item.key}>
                    <td>{item.beacon}</td>
                    <td>{item.endpoint}</td>
                    <td>
                      <span className={`status-badge ${item.status}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>{item.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <JsonPanel title="/info response" value={data} />
        </>
      ) : null}
    </section>
  );
}
