import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  OverviewContent
} from "./OverviewPage";
import {
  getConstituentBeaconSummaries,
  getMetadataErrorRows
} from "./overviewInfo";

const infoPayload = {
  meta: {
    apiVersion: "v2.0.0",
    beaconId: "network"
  },
  response: {
    info: {
      metadata_errors: [
        {
          endpoint: "https://example.org/reported-source",
          errors: [
            {
              path: "/response",
              message: "Expected an object."
            },
            {
              message: "Missing required field."
            }
          ]
        }
      ]
    }
  },
  responses: [
    {
      meta: { beaconId: "beacon-one" },
      response: {
        name: "Beacon One",
        welcomeUrl: "https://example.org/welcome",
        alternativeUrl: "https://example.org/api"
      }
    },
    {
      meta: { beaconId: "beacon-two" },
      response: {
        alternativeUrl: "https://example.net/api"
      }
    }
  ]
};

describe("OverviewContent", () => {
  it("summarizes constituent names and published welcome URLs only", () => {
    expect(getConstituentBeaconSummaries(infoPayload)).toEqual([
      {
        key: "Beacon One:0",
        beacon: "Beacon One",
        welcomeUrl: "https://example.org/welcome"
      },
      {
        key: "beacon-two:1",
        beacon: "beacon-two",
        welcomeUrl: null
      }
    ]);

    const html = renderToStaticMarkup(<OverviewContent data={infoPayload} />);
    expect(html).toContain("Constituent beacons");
    expect(html).toContain("Welcome URL");
    expect(html).toContain("https://example.org/welcome");
    expect(html).not.toContain("https://example.org/api");
    expect(html).not.toContain("https://example.net/api");
  });

  it("renders every propagated metadata error in a collapsed table", () => {
    expect(getMetadataErrorRows(infoPayload)).toEqual([
      {
        key: "0:0",
        endpoint: "https://example.org/reported-source",
        path: "/response",
        message: "Expected an object."
      },
      {
        key: "0:1",
        endpoint: "https://example.org/reported-source",
        path: null,
        message: "Missing required field."
      }
    ]);

    const html = renderToStaticMarkup(<OverviewContent data={infoPayload} />);
    expect(html).toContain("<details");
    expect(html).toContain("Metadata errors ");
    expect(html).toContain("2 reported");
    expect(html).toContain("Reported endpoint");
    expect(html).toContain("Expected an object.");
    expect(html).toContain("Missing required field.");
  });
});
