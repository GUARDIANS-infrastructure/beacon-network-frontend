import { type ReactElement, useState } from "react";
import { appConfig } from "./config/env";
import { ConfigurationPage } from "./pages/ConfigurationPage";
import { CohortsPage } from "./pages/CohortsPage";
import { OverviewPage } from "./pages/OverviewPage";

type PageKey = "overview" | "configuration" | "cohorts";

const pageNavItems: Array<{ key: PageKey; label: string }> = [
  { key: "cohorts", label: "Cohorts" },
  { key: "overview", label: "Overview" },
  { key: "configuration", label: "Configuration" }
];

export default function App(): ReactElement {
  const [page, setPage] = useState<PageKey>("cohorts");

  return (
    <div className="app-shell">
      <header>
        <h1>{appConfig.appTitle}</h1>
        <p>Beacon Network UI</p>
      </header>

      <nav>
        {pageNavItems.map(({ key, label }) => (
          <button
            key={key}
            className={key === page ? "active" : ""}
            onClick={() => setPage(key)}
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
