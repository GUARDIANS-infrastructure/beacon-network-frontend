export type BeaconEnvelope = {
  meta?: Record<string, unknown>;
  response?: Record<string, unknown>;
  responseSummary?: Record<string, unknown>;
  responses?: unknown[];
  beaconHandovers?: unknown[];
};

export type CohortDistributionEntry = {
  term: string;
  ontologyId: string | null;
  count: number;
};

export type CohortSummary = {
  id: string;
  name: string;
  cohortSize: number | null;
  cohortType: string | null;
  dataTypes: string[];
  diseaseCodes: string[];
  diseaseTerms: string[];
  phenotypeCodes: string[];
  phenotypeTerms: string[];
  description: string | null;
  distribution: CohortDistributionEntry[];
  raw: Record<string, unknown>;
};
