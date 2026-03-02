import type { BeaconEnvelope, CohortSummary, PhenotypeCount } from "./types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const asString = (value: unknown): string | null =>
  typeof value === "string" && value.trim() !== "" ? value.trim() : null;

const parseTopPhenotypes = (item: Record<string, unknown>): PhenotypeCount[] => {
  const events = Array.isArray(item.collectionEvents) ? item.collectionEvents : [];
  const counts = new Map<string, number>();

  events.filter(isRecord).forEach((event) => {
    const eventPhenotypes = isRecord(event.eventPhenotypes)
      ? event.eventPhenotypes
      : null;
    const distribution =
      eventPhenotypes && isRecord(eventPhenotypes.distribution)
        ? eventPhenotypes.distribution
        : null;

    if (!distribution) {
      return;
    }

    Object.entries(distribution).forEach(([term, value]) => {
      if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
        return;
      }
      counts.set(term, (counts.get(term) ?? 0) + value);
    });
  });

  return Array.from(counts.entries())
    .map(([term, count]) => ({ term, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);
};

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
      const id = asString(item.id) ?? "";
      if (id === "") {
        return null;
      }

      const inclusionCriteria = isRecord(item.inclusionCriteria)
        ? item.inclusionCriteria
        : null;
      const diseaseConditions =
        inclusionCriteria && Array.isArray(inclusionCriteria.diseaseConditions)
          ? inclusionCriteria.diseaseConditions
          : [];
      const phenotypicConditions =
        inclusionCriteria && Array.isArray(inclusionCriteria.phenotypicConditions)
          ? inclusionCriteria.phenotypicConditions
          : [];

      const dataTypes = Array.isArray(item.cohortDataTypes)
        ? item.cohortDataTypes
            .filter(isRecord)
            .map((dataType) => asString(dataType.label) ?? asString(dataType.id))
            .filter((value): value is string => value !== null)
        : [];

      return {
        id,
        name: asString(item.name) ?? id,
        cohortSize: typeof item.cohortSize === "number" ? item.cohortSize : null,
        cohortType: asString(item.cohortType),
        dataTypes,
        diseaseCodes: diseaseConditions
          .filter(isRecord)
          .map((condition) =>
            isRecord(condition.diseaseCode) ? asString(condition.diseaseCode.id) : null
          )
          .filter((value): value is string => value !== null),
        diseaseTerms: diseaseConditions
          .filter(isRecord)
          .flatMap((condition) => {
            const terms: string[] = [];
            if (isRecord(condition.diseaseCode)) {
              const label = asString(condition.diseaseCode.label);
              if (label) {
                terms.push(label);
              }
            }
            const notes = asString(condition.notes);
            if (notes) {
              terms.push(notes);
            }
            return terms;
          }),
        phenotypeCodes: phenotypicConditions
          .filter(isRecord)
          .map((condition) =>
            isRecord(condition.featureType) ? asString(condition.featureType.id) : null
          )
          .filter((value): value is string => value !== null),
        phenotypeTerms: phenotypicConditions
          .filter(isRecord)
          .flatMap((condition) => {
            const terms: string[] = [];
            if (isRecord(condition.featureType)) {
              const label = asString(condition.featureType.label);
              if (label) {
                terms.push(label);
              }
            }
            const notes = asString(condition.notes);
            if (notes) {
              terms.push(notes);
            }
            return terms;
          }),
        description:
          diseaseConditions
            .filter(isRecord)
            .map((condition) => asString(condition.notes))
            .find((note): note is string => note !== null) ?? null,
        topPhenotypes: parseTopPhenotypes(item),
        raw: item
      };
    })
    .filter((item): item is CohortSummary => item !== null);
};
