import type { BeaconEnvelope } from "../api/types";

export type ConstituentBeaconSummary = {
  key: string;
  beacon: string;
  welcomeUrl: string | null;
};

export type MetadataErrorRow = {
  key: string;
  endpoint: string;
  path: string | null;
  message: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const asString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;

const isHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export const getConstituentBeaconSummaries = (
  data: BeaconEnvelope
): ConstituentBeaconSummary[] => {
  if (!Array.isArray(data.responses)) {
    return [];
  }

  return data.responses.filter(isRecord).map((item, index) => {
    const response = isRecord(item.response) ? item.response : undefined;
    const meta = isRecord(item.meta) ? item.meta : undefined;
    const beacon =
      asString(response?.name) ??
      asString(response?.id) ??
      asString(meta?.beaconId) ??
      `Constituent ${index + 1}`;
    const welcomeUrl = asString(response?.welcomeUrl);

    return {
      key: `${beacon}:${index}`,
      beacon,
      welcomeUrl: welcomeUrl && isHttpUrl(welcomeUrl) ? welcomeUrl : null
    };
  });
};

export const getMetadataErrorRows = (data: BeaconEnvelope): MetadataErrorRow[] => {
  const info = data.response?.info;

  if (!isRecord(info) || !Array.isArray(info.metadata_errors)) {
    return [];
  }

  return info.metadata_errors.flatMap((metadataError, metadataErrorIndex) => {
    if (!isRecord(metadataError)) {
      return [];
    }

    const endpoint =
      asString(metadataError.endpoint) ?? `Unknown source ${metadataErrorIndex + 1}`;
    const errors = Array.isArray(metadataError.errors)
      ? metadataError.errors.filter(isRecord)
      : [];

    if (errors.length === 0) {
      return [
        {
          key: `${metadataErrorIndex}:empty`,
          endpoint,
          path: null,
          message: "The network reported a metadata error without details."
        }
      ];
    }

    return errors.map((error, errorIndex) => ({
      key: `${metadataErrorIndex}:${errorIndex}`,
      endpoint,
      path: asString(error.path) ?? null,
      message: asString(error.message) ?? "Unknown metadata error."
    }));
  });
};
