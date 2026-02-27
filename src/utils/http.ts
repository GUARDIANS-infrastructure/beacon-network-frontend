export type FetchJsonOptions = {
  timeoutMs: number;
  retries: number;
};

const sleep = async (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export const fetchJson = async (
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  options: FetchJsonOptions
): Promise<unknown> => {
  const attemptLimit = options.retries + 1;
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= attemptLimit; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs);

    try {
      const response = await fetch(input, {
        ...init,
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          ...init?.headers
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown network error");
      if (attempt < attemptLimit) {
        await sleep(200 * attempt);
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError ?? new Error("Request failed");
};
