import { type ReactElement, useEffect, useMemo, useState } from "react";
import { fetchCohorts } from "../api/client";
import type { CohortSummary } from "../api/types";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { JsonPanel } from "../components/JsonPanel";
import { LoadingState } from "../components/LoadingState";
import { formatLocalTimestamp } from "../utils/time";
import { useEndpointData } from "./useEndpointData";

const joinList = (items: string[]): string => items.join(", ");

function CohortDetailPage({
  cohort
}: {
  cohort: CohortSummary;
}): ReactElement {
  return (
    <div>
      <h3>{cohort.name}</h3>
      <p>
        <strong>ID:</strong> {cohort.id}
      </p>
      <p>
        <strong>Size:</strong> {cohort.cohortSize ?? ""}
      </p>
      <p>
        <strong>Type:</strong> {cohort.cohortType ?? ""}
      </p>
      <p>
        <strong>Data types:</strong> {joinList(cohort.dataTypes)}
      </p>
      <p>
        <strong>Disease codes:</strong> {joinList(cohort.diseaseCodes)}
      </p>
      <p>
        <strong>Phenotypic conditions:</strong> {joinList(cohort.phenotypeCodes)}
      </p>
      <p>
        <strong>Description:</strong> {cohort.description ?? ""}
      </p>

      <h4>Distribution</h4>
      {cohort.distribution.length === 0 ? (
        <p />
      ) : (
        <table>
          <thead>
            <tr>
              <th>Term</th>
              <th>Ontology ID</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            {cohort.distribution.map((item) => (
              <tr key={`${item.term}-${item.ontologyId ?? ""}`}>
                <td>{item.term}</td>
                <td>{item.ontologyId ?? ""}</td>
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

export function CohortsPage({ resetToken }: { resetToken: number }): ReactElement {
  const { data, error, loading, fetchedAt, refresh } = useEndpointData(fetchCohorts);
  const [search, setSearch] = useState<string>("");
  const [selectedCohortId, setSelectedCohortId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedCohortId(null);
  }, [resetToken]);

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
        item.distribution.some(
          (entry) =>
            entry.term.toLowerCase().includes(query) ||
            (entry.ontologyId ?? "").toLowerCase().includes(query)
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
      {!selectedCohort ? <h2>Cohorts</h2> : null}
      {fetchedAt ? <p>Last fetched: {formatLocalTimestamp(fetchedAt)}</p> : null}
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} onRetry={() => void refresh()} /> : null}

      {!loading && !error && selectedCohort ? (
        <CohortDetailPage cohort={selectedCohort} />
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
