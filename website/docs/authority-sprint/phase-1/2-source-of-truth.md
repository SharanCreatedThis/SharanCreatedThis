# 2 — Charm source-of-truth system

_Implementation recommendations. No code written._

## The problem this solves

Charm facts live in four places today and none of them is authoritative:

| Where | Holds | Missing |
| --- | --- | --- |
| `public/charms/*.svg` | 75 ids, by filename | names, meanings, categories |
| `public/charms/connected/*.svg` | the same 75 | — |
| `Collections.tsx` | 55 ids + display labels + collection | the other 20 entirely |
| `stats.generated.ts` | counts, derived | per-charm metadata |

The 20 non-collection charms exist **only as filenames**. There is no `Maneki-neko` string
anywhere in the repository — only `manekiNeko.svg`. That is why they cannot be surfaced by
flipping a flag, and it is the single blocker on `/charms`.

## Recommended shape

One authored registry, one generated registry, and a build step that reconciles them.

### `src/data/charms/registry.ts` — authored by hand

The only file a human edits. One entry per charm.

```
{
  id:         "manekiNeko"        // matches the SVG filename, the join key
  name:       "Maneki-neko"       // display name — currently missing for 20 charms
  collection: null                // or "Protection", "Marvel", …
  facets:     ["luck", "cultural"]
  origin:     "Japan"
  meaning:    "A beckoning cat, raised paw inviting fortune."   // one line
  season:     null                // or "halloween" | "diwali" | "winter"
  licensed:   false               // true for the 8 IP collections
  page:       false               // true when it has earned an individual page
  sources:    ["…"]               // where the cultural claim came from
}
```

**`licensed` is the important field.** It is what stops a future template from generating
`/charms/marvel` automatically, and it makes the IP position explicit in data rather than
remembered in a document.

**`sources` matters too.** A page claiming what a drishti bommai means should record where that
came from, exactly as the competitor claims register does.

### `src/data/charms.generated.ts` — extended, not replaced

The existing generator already resolves artwork paths. Extend it to:

1. Read the registry
2. Read both artwork directories
3. Read `Collections.tsx` for collection membership
4. **Reconcile, and fail the build on any mismatch**

Three failures worth failing on:

| Failure | Why it matters |
| --- | --- |
| Artwork exists, no registry entry | The invisible-charm problem, caught at build |
| Registry entry, no artwork | A page would render a broken image |
| Collection membership disagrees between registry and `Collections.tsx` | Two sources drifting is what caused this |

That third check is what makes the system a source of truth rather than a fifth place to look.

### What `Collections.tsx` becomes

Long term it should read from the registry rather than holding its own pairs — one list, derived
two ways. That is a refactor of a live product page, so it is **not** phase 1 work. Until then,
the reconciliation check keeps the two honest.

## Visibility status, as data

The audit found three states. Make them explicit rather than inferred:

- `surfaced` — named and rendered on the site (56)
- `artwork-only` — rendered, never named (`nimbuMirchi`)
- `invisible` — ships, appears nowhere (18)

A generated count of `invisible` charms, printed at build time, means the gap can never silently
reopen. It is the same pattern as the `80+` guard: counting is half the fix, and making the
regression loud is the other half.

## Seasonal flags

`season` in the registry drives `/charms/seasonal/*` membership. It should **not** drive
automatic showing or hiding of content by date — a page that changes what it says depending on
when it is crawled is a page whose indexed version is unpredictable.

Seasonal pages stay live all year and say when the charms appear. "Hangly's Diwali charms" is a
page worth having in March.

**Open question first:** which of the 20 the app surfaces automatically, and on what dates. The
2.0 notes say "eleven seasonal charms that arrive on their own" — eleven, not twenty. The
registry should record what the app actually does, and that answer is not in this repository.

## Migration

| Step | Work | Output |
| --- | --- | --- |
| 1 | Generate a registry skeleton from the 75 filenames, `name` blank | A file with 75 entries, 20 incomplete |
| 2 | Backfill `name`, `collection`, `facets` for the 55 from `Collections.tsx` | 55 complete automatically |
| 3 | **Author the 20 by hand** — name, origin, one-line meaning, facets, season | The actual work |
| 4 | Mark `licensed: true` on the 8 IP collections | The guard-rail |
| 5 | Extend the generator to reconcile and fail on mismatch | The guarantee |
| 6 | Print `invisible` count at build | The regression alarm |

**Step 3 is the only slow one** — twenty display names and twenty honest one-line meanings, with
sources. Half a day of careful work, and everything in phase 1 is blocked on it.

## What not to build

- **No CMS.** 75 rows that change a few times a year belong in a typed file that reviews in a diff.
- **No per-charm MDX files yet.** Ten charms will earn long-form pages. Sixty-five will not, and a
  directory of 75 near-empty files invites someone to fill them.
- **No automatic page generation from the registry.** `page: true` is set by hand, after the words
  exist. A template that turns rows into pages is precisely how doorway pages get built.
