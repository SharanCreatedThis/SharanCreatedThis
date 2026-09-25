# Charm system readiness

_Generated on 2026-09-25._

## Coverage

| Measure | Value |
| --- | --- |
| Registry coverage — charms with an entry | **100%** (75/75) |
| Artwork coverage — entries with both renderings | **100%** |
| Name coverage | **73%** (55/75) |
| Category coverage | **73%** |
| Description coverage | **0%** (0/75) |
| Meaning coverage | **0%** (0/75) |
| Source coverage | **0%** (0/75) |
| Page readiness | **0%** (0/75) |

## Build validation

`npm run charms:validate`, wired into `prebuild`. Fails the build on:

| Check | Status |
| --- | --- |
| Duplicate ids | passing |
| Artwork without a registry entry | passing |
| Registry entry without artwork | passing |
| Collection disagreement with `Collections.tsx` | passing |
| Display name disagreement | passing |

All four failure modes were verified by deliberately introducing each fault and confirming the build stops.

## Blockers preventing `/charms` launch

| # | Blocker | Severity | Effort | Owner |
| --- | --- | --- | --- | --- |
| 1 | 20 charms have no display name | **Blocking** | ~half a day | Sharan — authoring |
| 2 | Which of the 20 the app actually surfaces is unknown | **Blocking** | minutes to answer | Sharan — product knowledge |
| 3 | 20 charms have no category | High | included in 1 | Sharan — authoring |
| 4 | 0 of 75 charms have a meaning or source | High for charm pages, not for the index | days, per charm | Research |
| 5 | The `/charms` page itself is not built | Expected | 1-2 days | Engineering |
| 6 | Artwork licence undecided | Blocks the archive, not the index | a decision | Sharan |

**The index can launch on blockers 1, 2 and 5 alone.** Meanings and sources are needed for individual charm pages, not for a page that lists what ships.

## What is ready

- Registry with all 75 charms and full artwork paths
- Build validation on four integrity failures, each proved to fire
- Filtering, grouping, search indexing, schema and route derivation, all reading the registry
- Server-rendered grid and card components; a client filter that narrows a list already in the HTML
- Route generation that refuses to emit a path for a licensed or unauthored charm
