import type { ReactElement } from "react";
import { fetchConfiguration } from "../api/client";
import type { BeaconEnvelope } from "../api/types";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { JsonPanel } from "../components/JsonPanel";
import { LoadingState } from "../components/LoadingState";
import { formatLocalTimestamp } from "../utils/time";
import { useEndpointData } from "./useEndpointData";

type EntryTypeRow = {
  key: string;
  entryType: string;
  name: string;
  description: string;
  defaultSchema: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const asText = (value: unknown, fallback = "Unknown"): string =>
  typeof value === "string" && value.trim() !== "" ? value : fallback;

const getEntryTypes = (data: BeaconEnvelope): EntryTypeRow[] => {
  const entryTypes = data.response?.entryTypes;
  if (!isRecord(entryTypes)) {
    return [];
  }

  return Object.entries(entryTypes).map(([entryType, value]) => {
    const item = isRecord(value) ? value : {};
    const defaultSchema = isRecord(item.defaultSchema) ? item.defaultSchema : null;

    return {
      key: entryType,
      entryType,
      name: asText(item.name),
      description: asText(item.description),
      defaultSchema: asText(defaultSchema?.id)
    };
  });
};

export function ConfigurationPage(): ReactElement {
  const { data, error, loading, fetchedAt, refresh } = useEndpointData(
    fetchConfiguration
  );
  const entryTypes = data ? getEntryTypes(data) : [];

  return (
    <section>
      <h2>Configuration</h2>
      {fetchedAt ? <p>Last fetched: {formatLocalTimestamp(fetchedAt)}</p> : null}
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} onRetry={() => void refresh()} /> : null}
      {!loading && !error && !data ? <EmptyState message="No data found." /> : null}

      {!loading && !error && data ? (
        <>
          <h3>Response entry types</h3>
          {entryTypes.length === 0 ? (
            <p>Unknown</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Entry type</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Default schema</th>
                </tr>
              </thead>
              <tbody>
                {entryTypes.map((item) => (
                  <tr key={item.key}>
                    <td>{item.entryType}</td>
                    <td>{item.name}</td>
                    <td>{item.description}</td>
                    <td>{item.defaultSchema}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <JsonPanel title="/configuration response" value={data} />
        </>
      ) : null}
    </section>
  );
}
