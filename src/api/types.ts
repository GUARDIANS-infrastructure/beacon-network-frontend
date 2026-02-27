export type BeaconEnvelope = {
  meta?: Record<string, unknown>;
  response?: Record<string, unknown>;
  responseSummary?: Record<string, unknown>;
  responses?: unknown[];
  beaconHandovers?: unknown[];
};

export type CohortSummary = {
  id: string;
  name: string;
  cohortSize: number | null;
};
