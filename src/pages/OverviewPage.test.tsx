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
      beaconNodes: [
        {
          id: "beacon-one",
          rootUrl: "https://example.org/api"
        },
        {
          id: "beacon-two",
          rootUrl: "https://example.net/api"
        },
        {
          id: "beacon-three",
          rootUrl: "https://unavailable.example/api"
        }
      ],
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
  it("joins configured nodes to constituent responses and reports availability", () => {
    expect(getConstituentBeaconSummaries(infoPayload)).toEqual([
      {
        key: "beacon-one:0",
        name: "Beacon One",
        id: "beacon-one",
        rootUrl: "https://example.org/api",
        status: "available"
      },
      {
        key: "beacon-two:1",
        name: null,
        id: "beacon-two",
        rootUrl: "https://example.net/api",
        status: "available"
      },
      {
        key: "beacon-three:2",
        name: null,
        id: "beacon-three",
        rootUrl: "https://unavailable.example/api",
        status: "unavailable"
      }
    ]);

    const html = renderToStaticMarkup(<OverviewContent data={infoPayload} />);
    expect(html).toContain("Constituent beacons");
    expect(html).toContain("Beacon name");
    expect(html).toContain("Beacon ID");
    expect(html).toContain("Beacon root URL");
    expect(html).toContain("Beacon health status");
    expect(html).toContain("https://example.org/api");
    expect(html).toContain("https://unavailable.example/api");
    expect(html).toContain("Available");
    expect(html).toContain("Unavailable");
    expect(html).not.toContain("https://example.org/welcome");
  });

  it("omits malformed configured nodes", () => {
    expect(
      getConstituentBeaconSummaries({
        response: {
          info: {
            beaconNodes: [
              { id: "valid", rootUrl: "https://valid.example/api" },
              { id: "missing-url" },
              { id: "invalid-url", rootUrl: "not a URL" },
              null
            ]
          }
        }
      })
    ).toEqual([
      {
        key: "valid:0",
        name: null,
        id: "valid",
        rootUrl: "https://valid.example/api",
        status: "unavailable"
      }
    ]);
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
