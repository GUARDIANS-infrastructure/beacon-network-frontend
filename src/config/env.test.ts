import { describe, expect, it, vi } from "vitest";
import { loadRuntimeConfig, parseAppConfig } from "./env";

describe("parseAppConfig", () => {
  it("uses defaults when env vars are missing", () => {
    const cfg = parseAppConfig({});

    expect(cfg.apiBaseUrl).toContain("beacon-network/v2.0.0");
    expect(cfg.requestTimeoutMs).toBe(10000);
    expect(cfg.retryCount).toBe(1);
    expect(cfg.appTitle).toBe("Beacon Network Front-end");
    expect(cfg.enableDebugLogs).toBe(false);
  });

  it("parses explicit values", () => {
    const cfg = parseAppConfig({
      VITE_API_BASE_URL: "/api",
      VITE_REQUEST_TIMEOUT_MS: "2500",
      VITE_RETRY_COUNT: "2",
      VITE_APP_TITLE: "Local Beacon",
      VITE_ENABLE_DEBUG_LOGS: "true"
    });

    expect(cfg.apiBaseUrl).toBe("/api");
    expect(cfg.requestTimeoutMs).toBe(2500);
    expect(cfg.retryCount).toBe(2);
    expect(cfg.appTitle).toBe("Local Beacon");
    expect(cfg.enableDebugLogs).toBe(true);
  });
});

describe("loadRuntimeConfig", () => {
  it("does not throw when runtime config is unavailable", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false });
    vi.stubGlobal("fetch", fetchMock);

    await expect(loadRuntimeConfig()).resolves.toBeUndefined();

    vi.unstubAllGlobals();
  });
});
