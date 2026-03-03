import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { PartnerLogoWall } from "./PartnerLogoWall";
import { parsePartnerLogos } from "./partnerLogos";

describe("PartnerLogoWall", () => {
  it("renders nothing when there are no default or configured logos", () => {
    const html = renderToString(<PartnerLogoWall />);

    expect(html).toBe("");
  });

  it("parses only valid partner logo entries", () => {
    const parsed = parsePartnerLogos([
      { src: "/logos/logo_a.png", alt: "Logo A" },
      { src: "/logos/logo_b.png", alt: "Logo B", href: "https://example.org" },
      { src: "", alt: "Missing src" },
      { src: "/logos/logo_c.png", alt: "" },
      { src: "/logos/logo_d.png" },
      "not-an-object"
    ]);

    expect(parsed).toEqual([
      { src: "/logos/logo_a.png", alt: "Logo A" },
      { src: "/logos/logo_b.png", alt: "Logo B", href: "https://example.org" }
    ]);
  });
});
