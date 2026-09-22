import type { BeaconEnvelope } from "../api/types";

export type ConstituentBeaconSummary = {
  key: string;
  name: string | null;
  id: string;
  rootUrl: string;
  status: "available" | "unavailable";
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
  const info = data.response?.info;
  if (!isRecord(info) || !Array.isArray(info.beaconNodes)) {
    return [];
  }

  const responsesById = new Map<string, Record<string, unknown>>();
  (Array.isArray(data.responses) ? data.responses : []).filter(isRecord).forEach((item) => {
    const response = isRecord(item.response) ? item.response : undefined;
    const meta = isRecord(item.meta) ? item.meta : undefined;
    const ids = [asString(response?.id), asString(meta?.beaconId)].filter(
      (id): id is string => id !== undefined
    );

    ids.forEach((id) => responsesById.set(id, response ?? {}));
  });

  return info.beaconNodes.flatMap((node, index) => {
    if (!isRecord(node)) {
      return [];
    }

    const id = asString(node.id);
    const rootUrl = asString(node.rootUrl);
    if (!id || !rootUrl || !isHttpUrl(rootUrl)) {
      return [];
    }

    const response = responsesById.get(id);

    return {
      key: `${id}:${index}`,
      name: response ? (asString(response.name) ?? null) : null,
      id,
      rootUrl,
      status: response ? "available" : "unavailable"
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
