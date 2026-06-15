import type {
  BeaconEnvelope,
  CohortDistributionEntry,
  CohortSummary
} from "./types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const asString = (value: unknown): string | null =>
  typeof value === "string" && value.trim() !== "" ? value.trim() : null;

const getCollectionEvents = (item: Record<string, unknown>): Record<string, unknown>[] => {
  if (Array.isArray(item.collectionEvents)) {
    return item.collectionEvents.filter(isRecord);
  }

  if (isRecord(item.collectionEvents)) {
    return [item.collectionEvents];
  }

  return [];
};

const addDistributionEntry = (
  entries: Map<string, CohortDistributionEntry>,
  term: string | null,
  ontologyId: string | null,
  count: unknown
): void => {
  if (
    !term ||
    typeof count !== "number" ||
    !Number.isFinite(count) ||
    count <= 0
  ) {
    return;
  }

  const key = `${term}\u0000${ontologyId ?? ""}`;
  const existing = entries.get(key);
  entries.set(key, {
    term,
    ontologyId,
    count: (existing?.count ?? 0) + count
  });
};

const parseDistribution = (
  item: Record<string, unknown>
): CohortDistributionEntry[] => {
  const entries = new Map<string, CohortDistributionEntry>();

  getCollectionEvents(item).forEach((event) => {
    const eventDisease = isRecord(event.eventDisease) ? event.eventDisease : null;
    const diseaseDistribution = eventDisease?.distribution;

    if (Array.isArray(diseaseDistribution)) {
      diseaseDistribution.filter(isRecord).forEach((entry) => {
        const disease = isRecord(entry.disease) ? entry.disease : null;
        const label = disease ? asString(disease.label) : null;
        const ontologyId = disease ? asString(disease.id) : null;
        addDistributionEntry(entries, label ?? ontologyId, ontologyId, entry.count);
      });
    }

    const eventPhenotypes = isRecord(event.eventPhenotypes)
      ? event.eventPhenotypes
      : null;
    const phenotypeDistribution =
      eventPhenotypes && isRecord(eventPhenotypes.distribution)
        ? eventPhenotypes.distribution
        : null;

    if (!phenotypeDistribution) {
      return;
    }

    Object.entries(phenotypeDistribution).forEach(([term, count]) => {
      addDistributionEntry(entries, term, null, count);
    });
  });

  return Array.from(entries.values()).sort((a, b) => b.count - a.count);
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
        distribution: parseDistribution(item),
        raw: item
      };
    })
    .filter((item): item is CohortSummary => item !== null);
};
