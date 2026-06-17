import { describe, expect, it } from "vitest";
import { parseCohorts } from "./schemas";

describe("parseCohorts", () => {
  it("normalizes DSP phenotype distributions", () => {
    const cohorts = parseCohorts({
      response: {
        collections: [
          {
            id: "ghfm_kidgen",
            name: "The KidGen National Kidney Genomics Program",
            collectionEvents: [
              {
                eventPhenotypes: {
                  distribution: {
                    proteinuria: 38,
                    albuminuria: 29,
                    ignored: 0
                  }
                }
              }
            ]
          }
        ]
      }
    });

    expect(cohorts[0]?.distribution).toEqual([
      { term: "proteinuria", ontologyId: null, count: 38 },
      { term: "albuminuria", ontologyId: null, count: 29 }
    ]);
  });

  it("normalizes ZERO disease distributions", () => {
    const cohorts = parseCohorts({
      response: {
        collections: [
          {
            id: "CNS-cohort",
            name: "CNS Cancer Genomics Registry",
            collectionEvents: [
              {
                eventDiseases: {
                  distribution: [
                    {
                      count: 120,
                      disease: {
                        id: "NCIT:C185368",
                        label: "Diffuse Midline Glioma, H3 K27-Altered"
                      }
                    },
                    {
                      count: 12,
                      disease: {
                        id: "NCIT:C185368",
                        label: "Diffuse Midline Glioma, H3 K27-Altered"
                      }
                    },
                    {
                      count: 171,
                      disease: {
                        id: "NCIT:C4047",
                        label: "Pilocytic Astrocytoma"
                      }
                    }
                  ]
                }
              }
            ]
          }
        ]
      }
    });

    expect(cohorts[0]?.distribution).toEqual([
      { term: "Pilocytic Astrocytoma", ontologyId: "NCIT:C4047", count: 171 },
      {
        term: "Diffuse Midline Glioma, H3 K27-Altered",
        ontologyId: "NCIT:C185368",
        count: 132
      }
    ]);
  });
});
