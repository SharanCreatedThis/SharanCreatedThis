# Product alignment execution plan

_2026-09-26. Ordered by risk, then impact. Nothing here has been executed._

## The one decision everything waits on

**What happens to the 31 charms that are marketed and do not ship?**

Breaking Bad (7), Stranger Things (6), Friends (6), Football (5), Singers (5), Dream Catcher (1),
Flash (1). Real artwork, 62 files including connected variants, never wired into the app.

| Option | Consequence | Then the safe count is |
| --- | --- | --- |
| **A — Ship them in the app** | They become real. Largest work, best outcome | **80** |
| **B — Remove from the website** | Site becomes accurate immediately | **49** |
| **C — Label as unreleased** | Honest, keeps the artwork visible, weakest commercially | **49 shipping, 31 drawn** |

**Option C is the recommended interim** if A is planned but not soon. It is accurate, it does not
throw away artwork, and it converts a false claim into a roadmap — which is a thing people
forgive.

Note that option A produces **80**, which is where "80+" presumably came from. The figure may have
been forward-looking copy that outran the build rather than an invention.

Until this is answered, **do not deploy any charm count**, because any number implies the
collections beside it are real.

---

## Risk ranking

| Risk | Issue | Why |
| --- | --- | --- |
| **1 — Critical** | "80+" and five phantom collections live in `/faq` **schema** | False product claims in structured data, served to Google today |
| **2 — Critical** | `/products/hangly` displays 31 non-existent charms with artwork | Someone installs expecting them and does not get them |
| **3 — High** | `SoftwareApplication.description` on every page | Site-wide false claim in the entity node |
| **4 — High** | `/products/hangly/stats` publishes wrong figures under `Dataset` | The page built to be cited is wrong, with a provenance claim attached |
| **5 — Medium** | 20 pages will state 75 when deployed | Not live yet — catchable before it ships |
| **6 — Medium** | Registry describes the website, not the product | Blocks everything downstream |
| **7 — Low** | Appcast names non-existent charms | Already shipped to installed copies; cannot be retracted |

---

## Phase 0 — stop the bleeding (today, ~30 minutes)

**Do not deploy the seven unpushed commits yet.** They replace "80+" with "75". Both numbers are
wrong, and deploying converts a wrong claim into a differently wrong claim while touching 20
pages — which wastes the re-crawl.

| # | Action | Effort |
| --- | --- | --- |
| 0.1 | Answer the 31-charm question (A, B or C) | A decision |
| 0.2 | Fix the FAQ answer at `hangly-faq.ts:103` — the only "80+" that is both live and in schema | 10 min |
| 0.3 | Fix the three missed "80+" phrasings in `comparison-data.ts:757,802` | 5 min |
| 0.4 | Widen the `generate-stats.mjs` guard so it cannot miss these phrasings again | 15 min |

**0.4 matters more than it looks.** The existing guard proved it fires on `80+ charms` and gave
false confidence for `80+ across`, `80+ ready-made charms` and `Over eighty ready-made charms` —
all three of which survived a sweep that was reported as complete. A guard that passes on a
variant it was written to catch is worse than no guard, because it stops people looking.

---

## Phase 1 — make the site true (1 day, after the decision)

| # | Action | Files | Risk addressed |
| --- | --- | --- | --- |
| 1.1 | Repoint `generate-stats.mjs` at `CharmLibrary.json` | `scripts/generate-stats.mjs` | 4, 6 |
| 1.2 | Regenerate `charm-registry.ts` from the app | `src/lib/charms/` | 6 |
| 1.3 | Add the reverse check: website artwork with no app charm **fails the build** | `scripts/validate-charm-registry.mjs` | 6 |
| 1.4 | Correct `SoftwareApplication.description` and `featureList` | `lib/schema/entities.ts` | 3 |
| 1.5 | Correct the metadata and OG description | `lib/seo.ts:181` | 3 |
| 1.6 | Replace every count with 49 across the 20 pages | data files | 5 |
| 1.7 | Correct seasonal: 11 in 4 packs, not 20 | stats, roadmap, products, contact | 5 |
| 1.8 | Replace Flash with Shazam Lightning | `Collections.tsx` | — |
| 1.9 | Apply the decision from 0.1 to `Collections.tsx` | `Collections.tsx` | 2 |
| 1.10 | Rewrite the roadmap page's charm claims | `roadmap/page.tsx` | — |

**1.3 is the check that would have caught all of this.** The existing validator verifies the
website against itself, which is why it passed a site describing 31 charms that do not exist.

### Exact wording

In `docs/charm-count-verdict.md`, per surface — homepage, product page, comparisons, FAQ, schema,
stats.

---

## Phase 2 — verify before deploying (half a day)

| # | Action |
| --- | --- |
| 2.1 | `npm run build` — full validation suite |
| 2.2 | Grep the built output for every forbidden phrasing: `80+`, `eighty`, `75 charms`, `seventy-five`, and each phantom collection name |
| 2.3 | Confirm the count in the built HTML matches `CharmLibrary.json` by reading both |
| 2.4 | Re-run the entity graph, indexability and discoverability audits |
| 2.5 | Diff the schema blocks before and after |

**2.2 should be a script, not a manual grep** — that is exactly the step that was performed by
hand last time and missed three phrasings.

---

## Phase 3 — deploy and re-index (half a day)

| # | Action |
| --- | --- |
| 3.1 | Merge to `main`, build on `main`, push |
| 3.2 | Verify live: `/faq`, `/products/hangly`, `/products`, `/products/hangly/stats`, `/changelog` |
| 3.3 | `npm run ping` |
| 3.4 | Request re-indexing for the pages whose claims changed — `/faq` and `/products/hangly` first, since both carry corrected schema |

---

## Phase 4 — only then, the charm ecosystem

`/charms` and everything under it, built on a registry derived from the app.

**Your recommendation to hold is right**, and the ground-truth audit makes it stronger than when
you made it: `/charms` would not merely have used disputed data, it would have published a
catalogue of 75 charms of which 31 do not exist — giving the site's most serious accuracy problem
its own URL, its own `ItemList` schema and a place in the sitemap.

---

## Timeline

| Phase | Effort | Blocked on |
| --- | --- | --- |
| 0 — stop the bleeding | 30 min + a decision | The 31-charm question |
| 1 — make it true | 1 day | Phase 0 |
| 2 — verify | 0.5 day | Phase 1 |
| 3 — deploy | 0.5 day | Phase 2 |
| 4 — charm ecosystem | 2–3 days | Phase 3 |

**Two days from decision to an accurate, deployed site.**

---

## What I would do differently, having got this wrong once

Three process failures produced this, and all three are fixable:

1. **I validated the website against itself.** Every check I built — the registry validator, the
   stats generator, the charm-count guard — took website artifacts as ground truth. None could
   detect that the website described a product that did not exist.
   **Fix:** the app is the source of truth; validation must cross the boundary.

2. **I asserted the app was unreachable without checking.** Three documents state the app is in a
   separate private repository. It is at `apps/Hangly/` in this repo. One `ls` would have
   prevented a sprint of inference.
   **Fix:** verify a constraint before planning around it.

3. **I reported a sweep as complete when it was pattern-matched.** "80+" was replaced in 15 files
   and three phrasings survived, because the regex assumed the number sat next to the word
   "charms".
   **Fix:** after any content sweep, grep the built output for the *concept*, not the phrasing,
   and prove the guard fires on every variant rather than one.
