import type { BeaconEnvelope, CohortSummary } from "./types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const parseBeaconEnvelope = (payload: unknown): BeaconEnvelope => {
  if (!isRecord(payload)) {
    return {};
  }

  return {
    meta: isRecord(payload.meta) ? payload.meta : undefined,
    response: isRecord(payload.response) ? payload.response : undefined,
    responseSummary: isRecord(payload.responseSummary)
      ? payload.responseSummary
      : undefined,
    responses: Array.isArray(payload.responses) ? payload.responses : undefined,
    beaconHandovers: Array.isArray(payload.beaconHandovers)
      ? payload.beaconHandovers
      : undefined
  };
};

export const parseCohorts = (payload: unknown): CohortSummary[] => {
  const envelope = parseBeaconEnvelope(payload);
  const collections = envelope.response?.collections;

  if (!Array.isArray(collections)) {
    return [];
  }

  return collections
    .filter(isRecord)
    .map((item): CohortSummary | null => {
      const id = typeof item.id === "string" ? item.id : "";
      if (id === "") {
        return null;
      }
      const name = typeof item.name === "string" && item.name ? item.name : id;
      const cohortSize =
        typeof item.cohortSize === "number" ? item.cohortSize : null;
      return { id, name, cohortSize };
    })
    .filter((item): item is CohortSummary => item !== null);
};
