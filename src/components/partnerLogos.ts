export type Logo = {
  src: string;
  alt: string;
  href?: string;
};

export const DEFAULT_LOGOS: Logo[] = [];

const asNonEmptyString = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

export const parsePartnerLogos = (payload: unknown): Logo[] => {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .map((entry): Logo | undefined => {
      if (typeof entry !== "object" || entry === null) {
        return undefined;
      }

      const record = entry as Record<string, unknown>;
      const src = asNonEmptyString(record.src);
      const alt = asNonEmptyString(record.alt);
      const href = asNonEmptyString(record.href);

      if (!src || !alt) {
        return undefined;
      }

      return href ? { src, alt, href } : { src, alt };
    })
    .filter((entry): entry is Logo => entry !== undefined);
};
