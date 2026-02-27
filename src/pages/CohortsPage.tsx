import { type ReactElement, useMemo, useState } from "react";
import { fetchCohorts } from "../api/client";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { formatLocalTimestamp } from "../utils/time";
import { useEndpointData } from "./useEndpointData";

export function CohortsPage(): ReactElement {
  const { data, error, loading, fetchedAt, refresh } = useEndpointData(fetchCohorts);
  const [search, setSearch] = useState<string>("");

  const rows = useMemo(() => {
    const base = data ?? [];
    const query = search.trim().toLowerCase();
    if (query === "") {
      return base;
    }
    return base.filter(
      (item) =>
        item.id.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query)
    );
  }, [data, search]);

  return (
    <section>
      <h2>Cohorts</h2>
      {fetchedAt ? <p>Last fetched: {formatLocalTimestamp(fetchedAt)}</p> : null}
      <label htmlFor="cohort-search">Search cohorts</label>
      <input
        id="cohort-search"
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search by id or name"
        value={search}
      />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} onRetry={() => void refresh()} /> : null}
      {!loading && !error && rows.length === 0 ? (
        <EmptyState message="No cohorts found." />
      ) : null}
      {!loading && !error && rows.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>ID</th>
              <th>Size</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((cohort) => (
              <tr key={cohort.id}>
                <td>{cohort.name}</td>
                <td>{cohort.id}</td>
                <td>{cohort.cohortSize ?? "Unknown"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </section>
  );
}
