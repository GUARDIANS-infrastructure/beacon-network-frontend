import { type ReactElement, useState } from "react";
import { appConfig } from "./config/env";
import { ConfigurationPage } from "./pages/ConfigurationPage";
import { CohortsPage } from "./pages/CohortsPage";
import { OverviewPage } from "./pages/OverviewPage";
import { PartnerLogoWall } from "./components/PartnerLogoWall";

type PageKey = "overview" | "configuration" | "cohorts";

const pageNavItems: Array<{ key: PageKey; label: string }> = [
  { key: "cohorts", label: "Cohorts" },
  { key: "overview", label: "Overview" },
  { key: "configuration", label: "Configuration" }
];

export default function App(): ReactElement {
  const [page, setPage] = useState<PageKey>("cohorts");
  const [cohortsResetToken, setCohortsResetToken] = useState<number>(0);

  const selectPage = (key: PageKey): void => {
    if (key === "cohorts") {
      setCohortsResetToken((value) => value + 1);
    }
    setPage(key);
  };

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
            onClick={() => selectPage(key)}
            type="button"
          >
            {label}
          </button>
        ))}
      </nav>

      <main>
        {page === "overview" && <OverviewPage />}
        {page === "configuration" && <ConfigurationPage />}
        {page === "cohorts" && <CohortsPage resetToken={cohortsResetToken} />}
      </main>

      <PartnerLogoWall />
    </div>
  );
}
