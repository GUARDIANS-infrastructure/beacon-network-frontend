const defaultConfig = {
  apiBaseUrl: "https://localhost/beacon-network/v2.0.0",
  requestTimeoutMs: 10000,
  retryCount: 1,
  appTitle: "Beacon Network",
  enableDebugLogs: false
} as const;

export type AppConfig = {
  apiBaseUrl: string;
  requestTimeoutMs: number;
  retryCount: number;
  appTitle: string;
  enableDebugLogs: boolean;
};

type EnvLike = Record<string, string | undefined>;

const asPositiveInt = (value: string | undefined, fallback: number): number => {
  if (value === undefined || value.trim() === "") {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }
  return parsed;
};

const asBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) {
    return fallback;
  }
  return value.toLowerCase() === "true";
};

const isValidUrl = (value: string): boolean => {
  try {
    // Validate absolute or same-origin relative (/api) style values.
    new URL(value, "http://localhost");
    return value.startsWith("/") || value.startsWith("http");
  } catch {
    return false;
  }
};

const asNonEmptyString = (
  value: unknown,
  validator?: (candidate: string) => boolean
): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  if (trimmed === "") {
    return undefined;
  }

  if (validator && !validator(trimmed)) {
    return undefined;
  }

  return trimmed;
};

const parseRuntimeConfig = (payload: unknown): Partial<AppConfig> => {
  if (typeof payload !== "object" || payload === null) {
    return {};
  }

  const record = payload as Record<string, unknown>;
  const apiBaseUrl = asNonEmptyString(record.apiBaseUrl, isValidUrl);
  const appTitle = asNonEmptyString(record.appTitle);

  const candidate: Partial<AppConfig> = {
    apiBaseUrl,
    requestTimeoutMs:
      typeof record.requestTimeoutMs === "number" &&
      Number.isFinite(record.requestTimeoutMs) &&
      record.requestTimeoutMs >= 0
        ? record.requestTimeoutMs
        : undefined,
    retryCount:
      typeof record.retryCount === "number" &&
      Number.isFinite(record.retryCount) &&
      record.retryCount >= 0
        ? record.retryCount
        : undefined,
    appTitle,
    enableDebugLogs:
      typeof record.enableDebugLogs === "boolean"
        ? record.enableDebugLogs
        : undefined
  };

  return Object.fromEntries(
    Object.entries(candidate).filter(([, value]) => value !== undefined)
  ) as Partial<AppConfig>;
};

export const parseAppConfig = (env: EnvLike): AppConfig => {
  const apiBaseUrl =
    env.VITE_API_BASE_URL?.trim() || env.VITE_API_URL?.trim() || defaultConfig.apiBaseUrl;

  return {
    apiBaseUrl: isValidUrl(apiBaseUrl) ? apiBaseUrl : defaultConfig.apiBaseUrl,
    requestTimeoutMs: asPositiveInt(
      env.VITE_REQUEST_TIMEOUT_MS,
      defaultConfig.requestTimeoutMs
    ),
    retryCount: asPositiveInt(env.VITE_RETRY_COUNT, defaultConfig.retryCount),
    appTitle: env.VITE_APP_TITLE?.trim() || defaultConfig.appTitle,
    enableDebugLogs: asBoolean(
      env.VITE_ENABLE_DEBUG_LOGS,
      defaultConfig.enableDebugLogs
    )
  };
};

export let appConfig: AppConfig = parseAppConfig(import.meta.env);

export const loadRuntimeConfig = async (): Promise<void> => {
  try {
    const response = await fetch("/config.json", {
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      return;
    }

    const overrides = parseRuntimeConfig(await response.json());
    appConfig = {
      ...appConfig,
      ...overrides
    };
  } catch {
    // Ignore runtime config failures to keep the app usable with env defaults.
  }
};
