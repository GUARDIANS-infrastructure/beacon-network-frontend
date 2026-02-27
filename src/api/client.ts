import { appConfig } from "../config/env";
import { fetchJson } from "../utils/http";
import { parseBeaconEnvelope, parseCohorts } from "./schemas";
import type { BeaconEnvelope, CohortSummary } from "./types";

const buildUrl = (path: string): string =>
  `${appConfig.apiBaseUrl.replace(/\/$/, "")}${path}`;

const fetchEndpoint = async (path: string): Promise<unknown> =>
  fetchJson(buildUrl(path), undefined, {
    timeoutMs: appConfig.requestTimeoutMs,
    retries: appConfig.retryCount
  });

export const fetchInfo = async (): Promise<BeaconEnvelope> =>
  parseBeaconEnvelope(await fetchEndpoint("/info"));

export const fetchConfiguration = async (): Promise<BeaconEnvelope> =>
  parseBeaconEnvelope(await fetchEndpoint("/configuration"));

export const fetchCohorts = async (): Promise<CohortSummary[]> =>
  parseCohorts(await fetchEndpoint("/cohorts"));
