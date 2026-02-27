import { type ReactElement, useState } from "react";
import { appConfig } from "./config/env";
import { ConfigurationPage } from "./pages/ConfigurationPage";
import { CohortsPage } from "./pages/CohortsPage";
import { OverviewPage } from "./pages/OverviewPage";

type PageKey = "overview" | "configuration" | "cohorts";

const pageLabels: Record<PageKey, string> = {
  overview: "Overview",
  configuration: "Configuration",
  cohorts: "Cohorts"
};

export default function App(): ReactElement {
  const [page, setPage] = useState<PageKey>("overview");

  return (
    <div className="app-shell">
      <header>
        <h1>{appConfig.appTitle}</h1>
        <p>Beacon Network metadata viewer</p>
      </header>

      <nav>
        {Object.entries(pageLabels).map(([key, label]) => (
          <button
            key={key}
            className={key === page ? "active" : ""}
            onClick={() => setPage(key as PageKey)}
            type="button"
          >
            {label}
          </button>
        ))}
      </nav>

      <main>
        {page === "overview" && <OverviewPage />}
        {page === "configuration" && <ConfigurationPage />}
        {page === "cohorts" && <CohortsPage />}
      </main>
    </div>
  );
}
