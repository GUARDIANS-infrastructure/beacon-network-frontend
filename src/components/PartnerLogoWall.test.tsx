import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { PartnerLogoWall } from "./PartnerLogoWall";

describe("PartnerLogoWall", () => {
  it("renders the partner section and all configured logos", () => {
    const html = renderToString(<PartnerLogoWall />);

    expect(html).toContain('aria-label="GUARDIANS partners"');

    const expectedSources = [
      "/logos/logo_01.png",
      "/logos/logo_02.png",
      "/logos/logo_03.png",
      "/logos/logo_04.png",
      "/logos/logo_05.png",
      "/logos/logo_06.png",
      "/logos/logo_07.jpg",
      "/logos/logo_08.png",
      "/logos/logo_09.png",
      "/logos/logo_10.jpg"
    ];

    for (const source of expectedSources) {
      expect(html).toContain(`src="${source}"`);
    }

    expect((html.match(/<img /g) ?? []).length).toBe(expectedSources.length);
  });
});
