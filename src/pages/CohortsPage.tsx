import { type ReactElement, useMemo, useState } from "react";
import { fetchCohorts } from "../api/client";
import type { CohortSummary } from "../api/types";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { JsonPanel } from "../components/JsonPanel";
import { LoadingState } from "../components/LoadingState";
import { formatLocalTimestamp } from "../utils/time";
import { useEndpointData } from "./useEndpointData";

const joinList = (items: string[]): string =>
  items.length > 0 ? items.join(", ") : "Unknown";

function CohortDetailPage({
  cohort,
  onBack
}: {
  cohort: CohortSummary;
  onBack: () => void;
}): ReactElement {
  return (
    <div>
      <button onClick={onBack} type="button">
        Back to cohorts
      </button>
      <h3>{cohort.name}</h3>
      <p>
        <strong>ID:</strong> {cohort.id}
      </p>
      <p>
        <strong>Size:</strong> {cohort.cohortSize ?? "Unknown"}
      </p>
      <p>
        <strong>Type:</strong> {cohort.cohortType ?? "Unknown"}
      </p>
      <p>
        <strong>Data types:</strong> {joinList(cohort.dataTypes)}
      </p>
      <p>
        <strong>Disease codes:</strong> {joinList(cohort.diseaseCodes)}
      </p>
      <p>
        <strong>Phenotype categories:</strong> {joinList(cohort.phenotypeCodes)}
      </p>
      <p>
        <strong>Description:</strong> {cohort.description ?? "Unknown"}
      </p>

      <h4>Top phenotype terms</h4>
      {cohort.topPhenotypes.length === 0 ? (
        <p>Unknown</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Phenotype term</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            {cohort.topPhenotypes.map((item) => (
              <tr key={item.term}>
                <td>{item.term}</td>
                <td>{item.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <JsonPanel title="Cohort JSON" value={cohort.raw} />
    </div>
  );
}

export function CohortsPage(): ReactElement {
  const { data, error, loading, fetchedAt, refresh } = useEndpointData(fetchCohorts);
  const [search, setSearch] = useState<string>("");
  const [selectedCohortId, setSelectedCohortId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const base = data ?? [];
    const query = search.trim().toLowerCase();
    if (query === "") {
      return base;
    }

    return base.filter(
      (item) =>
        item.id.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query) ||
        item.diseaseCodes.some((code) => code.toLowerCase().includes(query)) ||
        item.diseaseTerms.some((term) => term.toLowerCase().includes(query)) ||
        item.phenotypeCodes.some((code) => code.toLowerCase().includes(query)) ||
        item.phenotypeTerms.some((term) => term.toLowerCase().includes(query)) ||
        item.topPhenotypes.some((phenotype) =>
          phenotype.term.toLowerCase().includes(query)
        ) ||
        (item.description ?? "").toLowerCase().includes(query)
    );
  }, [data, search]);

  const selectedCohort = useMemo(() => {
    if (!selectedCohortId) {
      return null;
    }
    return (data ?? []).find((cohort) => cohort.id === selectedCohortId) ?? null;
  }, [data, selectedCohortId]);

  return (
    <section>
      <h2>Cohorts</h2>
      {fetchedAt ? <p>Last fetched: {formatLocalTimestamp(fetchedAt)}</p> : null}
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} onRetry={() => void refresh()} /> : null}

      {!loading && !error && selectedCohort ? (
        <CohortDetailPage
          cohort={selectedCohort}
          onBack={() => setSelectedCohortId(null)}
        />
      ) : null}

      {!loading && !error && !selectedCohort ? (
        <>
          <div className="cohort-search">
            <label htmlFor="cohort-search">
              Search cohorts, disease, and phenotype (codes or terms)
            </label>
            <input
              id="cohort-search"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="e.g. MONDO:0003847, HP:0000119, kidney, thrombocytopenia"
              value={search}
            />
          </div>

          {rows.length === 0 ? <EmptyState message="No cohorts found." /> : null}

          {rows.length > 0 ? (
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
                    <td>
                      <button
                        className="link-button"
                        onClick={() => setSelectedCohortId(cohort.id)}
                        type="button"
                      >
                        {cohort.name}
                      </button>
                    </td>
                    <td>{cohort.id}</td>
                    <td>{cohort.cohortSize ?? "Unknown"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
