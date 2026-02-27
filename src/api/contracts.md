# src/api/contracts.md — API contracts and display assumptions

This file documents the **minimum** response fields this UI relies on from Beacon v2 endpoints.

We primarily target the **Beacon Network aggregator** (`beacon-network-backend`) and treat it as the source for UI content.
However, constituent beacons can differ slightly in envelope shape and version, so our parsing is:
- strict about the *small subset we display*,
- tolerant about extra fields and alternate-but-compatible envelopes.

If payload shapes change:
1) update runtime schemas,
2) update this document,
3) ensure UI has safe fallbacks.

---

## Base URL

Primary (aggregator):
- `VITE_API_BASE_URL` (defaults can point at the deployed aggregator)

Expected endpoints:
- `${BASE_URL}/info`
- `${BASE_URL}/configuration`
- `${BASE_URL}/cohorts`

---

## General response handling

### Network behavior assumptions
- Requests may fail, time out, or return non-2xx.
- UI must show: **loading**, **error**, **empty** states.
- UI must not crash on unexpected payloads.

### Parsing and validation
- Parse JSON defensively.
- Validate *minimum displayed fields* with runtime schemas (e.g., `zod`).
- On validation failure:
  - render safe fallback UI (e.g. “Unknown”),
  - provide a “View raw JSON” toggle where possible,
  - log a debug message in dev mode only.

### Timeouts and retries
Configured via env vars (suggested defaults):
- `VITE_REQUEST_TIMEOUT_MS` (default ~10s)
- `VITE_RETRY_COUNT` (default 0–1; conservative)

---

## Envelope shapes (observed)

### Aggregator envelope (common)
Top-level fields often include:
- `meta` (object)
- `response` (object)
And sometimes also:
- `responseSummary` (object) — for query endpoints like `/cohorts`
- `responses` (array) — for aggregated per-beacon payloads on `/info`

### Constituent beacon envelope (common)
Top-level fields include:
- `meta` (object)
- `response` (object)
Sometimes also:
- `responseSummary` (object)
- `beaconHandovers` (array) — observed on constituent `/cohorts`
Sometimes also:
- `$schema` (string) — observed on constituent `/configuration`

### `meta` (common subset)
We treat all fields as optional unless stated:
- `meta.apiVersion` (string) — e.g. `"v2.0.0"` / `"v2.2.0"`
- `meta.beaconId` (string)
- `meta.isAggregated` (boolean, optional) — aggregator only
- `meta.returnedSchemas` (array, optional)
- `meta.receivedRequestSummary` (object, optional)
- `meta.returnedGranularity` (string, optional)

UI may show `meta.apiVersion` and `meta.beaconId` as small labels.

---

## Endpoint: `/info`

### Purpose in UI
Used on the **Overview** page to show:
- aggregator identity and metadata (from `response`)
- optionally, a list of constituent beacon summaries when returned by the aggregator (from top-level `responses[]`)
- any aggregator-reported metadata errors (from `response.info.metadata_errors`)

### Observed shapes

#### Constituent `/info` (b1, b2)
Top-level:
- `meta` (object)
- `response` (object)

`response` fields observed (display subset):
- `id` (string, optional)
- `name` (string, optional)
- `description` (string, optional)
- `apiVersion` (string, optional)
- `environment` (string, optional)
- `version` (string, optional)
- `welcomeUrl` (string URL, optional)
- `alternativeUrl` (string URL, optional)
- `createDateTime` (string datetime, optional)
- `updateDateTime` (string datetime, optional)
- `organization` (object, optional)
  - `id`, `name`, `description`, `address`, `welcomeUrl`, `contactUrl`, `logoUrl` (all optional)

#### Aggregator `/info`
Top-level:
- `meta` (object)
- `response` (object) — aggregator’s own `/info`
- `responses` (array, optional) — per-beacon `/info` responses

Aggregator `response` has the same “display subset” as constituent responses, plus:
- `response.info.metadata_errors` (array, optional)
  - each item:
    - `endpoint` (string URL, optional)
    - `errors` (array, optional)
      - `location` (string URL, optional)
      - `message` (string, optional)

Per-beacon `responses[]` items:
- `responses[i].meta` (object, optional)
- `responses[i].response` (object, optional) — same subset as constituent `/info`

### UI behavior
- Always show “Last fetched at”.
- Prefer showing:
  - `response.name` (fallback to `response.id`),
  - `response.description`,
  - `response.environment`,
  - `meta.apiVersion`.
- Render `metadata_errors` as an expandable section (count + list).
- If `responses[]` is present, show a “Constituent beacons” table/list with:
  - name/id, apiVersion, environment, updateDateTime, and link to `welcomeUrl` or `alternativeUrl`.

---

## Endpoint: `/configuration`

### Purpose in UI
Used on the **Configuration** page to show what the beacon/network claims it supports.
This is primarily operator/debug value, so raw JSON rendering is acceptable.

### Observed shapes

#### Constituent `/configuration` (b1)
Top-level:
- `$schema` (string, optional)
- `meta` (object)
- `response` (object)

`response` fields observed (display subset):
- `maturityAttributes.productionStatus` (string, optional) — e.g. `"PROD"`
- `securityAttributes.defaultGranularity` (string, optional)
- `securityAttributes.securityLevels` (array of strings, optional)
- `entryTypes` (object, optional)
  - keys like `cohort`, `dataset`, `individual`, etc.
  - each entryType object may include:
    - `id`, `name`, `description`, `partOfSpecification` (strings, optional)
    - `ontologyTermForThisType.id` / `.label` (optional)
    - `nonFilteredQueriesAllowed` (boolean, optional)
    - `defaultSchema` (object, optional)
      - `id`, `name`, `referenceToSchemaDefinition`, `schemaVersion` (optional)
    - `additionallySupportedSchemas` or `additionalSupportedSchemas` (array, optional)
      - schema objects (same as `defaultSchema` but may omit `schemaVersion` in some beacons)
    - other fields may appear (e.g. `aCollectionOf`)

#### Constituent `/configuration` (b2)
Top-level:
- `meta` (object)
- `response` (object)

Notable differences:
- broader `entryTypes` set (biosample, analysis, individual, dataset, run, cohort, genomicVariant, …)
- `securityAttributes.securityLevels` may include non-public levels (REGISTERED, CONTROLLED)

#### Aggregator `/configuration`
Top-level:
- `meta` (object)
- `response` (object)

Observed content includes:
- `response.entryTypes` (object) with at least `cohort`

### UI behavior
- Provide:
  - “Copy JSON” button
  - Expand/collapse JSON viewer
- Optional summary blocks (if fields present):
  - Production status (`maturityAttributes.productionStatus`)
  - Security (`securityAttributes.defaultGranularity`, `securityAttributes.securityLevels`)
  - Entry types list:
    - show keys under `response.entryTypes`
    - for each, show `name`, `description`, `defaultSchema.id` and `defaultSchema.schemaVersion` if available
- Do not hard-depend on any nested config field existing.

---

## Endpoint: `/cohorts`

### Purpose in UI
Used on the **Cohorts** page to list public cohort-level information and provide a cohort details view.

### Observed shapes (aggregator + constituent)
Top-level:
- `meta` (object)
- `responseSummary` (object, optional)
  - `exists` (boolean, optional)
  - `numTotalResults` (number, optional)
- `beaconHandovers` (array, optional) — observed on constituent beacons
- `response` (object)

List location (observed primary):
- `response.collections` (array) — **primary list**

### `beaconHandovers` (optional, but useful)
Observed on constituent `/cohorts` (b1):
- `beaconHandovers[]` objects may include:
  - `note` (string, optional)
  - `url` (string URL/mailto, optional)
  - `handoverType` (object, optional)
    - `id` (string, optional)
    - `label` (string, optional)

UI recommendation:
- If present, render a “Data access / handover” callout on the Cohorts page (or details view),
  showing `handoverType.label` + link to `url`.

### Cohort record shape (`response.collections[]`)
Each item is treated as a “cohort” for UI purposes.

Core fields (display subset):
- `id` (string) — **preferred stable key**
- `name` (string, optional)
- `cohortSize` (number, optional)
- `cohortType` (string, optional) — e.g. `"study-defined"`

Common optional enrichments:
- `cohortDataTypes` (array, optional)
  - items:
    - `id` (string, optional)
    - `label` (string, optional)
- `cohortDesign` (object, optional) — observed on b2
  - `id` (string, optional)
  - `label` (string, optional)
- `inclusionCriteria` (object, optional)
  - `diseaseConditions` (array, optional)
    - items:
      - `diseaseCode.id` (string, optional)
      - `diseaseCode.label` (string, optional) — observed on b2
      - `notes` (string, optional) — observed on b1
  - `phenotypicConditions` (array, optional)
    - items:
      - `featureType.id` (string, optional)
      - `notes` (string, optional)

Potentially large nested content (guardrails required):
- `collectionEvents` (array, optional)
  - items:
    - `eventDataTypes.availability` (boolean, optional)
    - `eventDataTypes.availabilityCount` (number, optional)
    - `eventPhenotypes.availability` (boolean, optional)
    - `eventPhenotypes.availabilityCount` (number, optional)
    - `eventPhenotypes.distribution` (object map<string, number>, optional)

### UI behavior

#### List view
Display (best-effort):
- Name (fallback to `id`)
- `id`
- `cohortSize`
- Cohort data types (prefer `label`, fallback to `id`; join multiple with comma)
- Optional: cohort design label (if present)

Search:
- substring match over `name` and `id` (default)
- optional toggle later: include disease label/notes in search (off by default)

Sorting:
- default: by `name` then `id`

#### Details view
Show:
- key fields + raw JSON
- inclusion criteria sections
  - disease conditions: show `diseaseCode.label` if present else `diseaseCode.id`
  - notes (if present) in collapsible block
- if `collectionEvents[].eventPhenotypes.distribution` is present:
  - show top N (e.g. 20) by count with “show more”
  - do not render full map unbounded by default
- show `beaconHandovers` callout if present

Performance:
- large text fields (notes) should be collapsed by default.
- large lists/maps should be virtualised or truncated with “show more”.

---

## Notes on version differences (v2.0.0 vs v2.2.0)
- `meta.apiVersion` may differ across beacons (`v2.0.0`, `v2.2.0`).
- Some sub-objects include `label` fields (e.g. `diseaseCode.label`) in newer beacons; treat as optional.
- Configuration entry types can be significantly broader in newer beacons; UI should not assume only `cohort`.

---

## Contract maintenance workflow

When adding UI fields:
1. capture a real JSON example from aggregator + at least one constituent (if relevant),
2. decide what to display and what is optional,
3. update runtime schema(s) for the displayed subset,
4. update this document with concrete paths + fallback behavior,
5. add/adjust unit tests for parsing/validation.

---

## Example endpoints (current)
Aggregator:
- `http://ec2-15-135-165-56.ap-southeast-2.compute.amazonaws.com:8080/beacon-network/v2.0.0/info`
- `http://ec2-15-135-165-56.ap-southeast-2.compute.amazonaws.com:8080/beacon-network/v2.0.0/configuration`
- `http://ec2-15-135-165-56.ap-southeast-2.compute.amazonaws.com:8080/beacon-network/v2.0.0/cohorts`

Constituent examples:
- `https://beacon.dsp.garvan.org.au/api/info`
- `https://beacon.dsp.garvan.org.au/api/configuration`
- `https://beacon.dsp.garvan.org.au/api/cohorts`
