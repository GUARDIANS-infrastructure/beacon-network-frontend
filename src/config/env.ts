const defaultConfig = {
  apiBaseUrl:
    "http://ec2-15-135-165-56.ap-southeast-2.compute.amazonaws.com:8080/beacon-network/v2.0.0",
  requestTimeoutMs: 10000,
  retryCount: 1,
  appTitle: "Beacon Network Front-end",
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

export const appConfig: AppConfig = parseAppConfig(import.meta.env);
