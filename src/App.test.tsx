import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import App from "./App";
import { appConfig } from "./config/env";

describe("App", () => {
  it("renders app title", () => {
    const html = renderToString(<App />);
    expect(html).toContain(`<h1>${appConfig.appTitle}</h1>`);
  });
});
