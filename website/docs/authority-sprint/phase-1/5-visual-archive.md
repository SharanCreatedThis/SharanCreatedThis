# 5 — Visual archive

_Design only. No pages built._

## What it is

A page that treats the charm artwork as work, not as product photography. 150 original SVGs — 75
charms in two renderings each — shown at size, with the plain and connected drawings side by
side, and an explanation of why the second one cannot be derived from the first.

## Why it is citation-worthy

The test from the sprint: **could a competitor reproduce this in a weekend?** No. Copying it means
drawing 150 vector illustrations. The next largest library in the category is DangleJoy at 30+
charms, and no competitor publishes their artwork as artwork at all.

Three audiences link to it, and none of them wants a desktop charm:

- **Designers and illustrators** — a vector set with a consistent visual language across eleven
  themes and several cultural traditions.
- **Developers** — the connected-rendering problem is a genuine technical constraint with a
  non-obvious consequence.
- **People interested in the symbols themselves** — the nazar, daruma, drishti bommai and scarab
  have audiences with no software interest whatsoever.

That third group is the most valuable link source available to this site and the least contested.

## The technical story that makes it interesting

This is the part a competitor cannot copy even with the artwork, because it is a constraint they
have to have hit:

> Every charm has two drawings. The plain one is the charm alone. The connected one is the same
> charm with the hanging thread drawn in — and the thread has to end at that charm's own loop,
> which is in a different place on every charm. A nazar hangs from a hole near its rim; a temple
> bell hangs from a crown; the RV does not have a loop at all and needed one invented.
>
> So the connected rendering cannot be derived from the plain one by any rule. It is drawn per
> charm, by hand, 75 times.
>
> Six collections shipped before their connected artwork did. The page requested the connected
> file regardless, so thirty charms rendered as broken images on the most-visited page of the
> site. The fix was a build-time manifest that resolves each charm to the best artwork that
> exists and falls back rather than 404s — and a build that fails outright if a charm has no
> artwork at all, because the alternative is finding out from a stranger.

That passage is true, specific, and the kind of thing that gets linked from engineering blogs.
It is already documented in `scripts/generate-charm-manifest.mjs`; the archive is where it
becomes public.

## URL and structure

**`/charms/archive`** — under `/charms`, because it is a view of the same data, and the index is
canonical for the charms themselves.

1. **Opening** — 150 drawings, 75 charms, two renderings each, one visual language. What the
   archive is, in a paragraph.
2. **The pairs** — each charm shown plain and connected, side by side, at a size where the
   linework is visible. This is the core of the page and it should be generous with space.
3. **The thread problem** — the passage above, with three or four charms chosen to show how
   differently the thread attaches. Nazar, temple bell, and something awkward like the RV.
4. **The visual language** — line weight, palette, how a Tamil Divine charm and a Breaking Bad
   charm stay recognisably from the same set.
5. **Scale and format** — why SVG, why the artwork is drawn rather than exported from raster, and
   the 89 MB → 33 MB reduction that came from shipping vectors instead of a compiled catalogue
   carrying a bitmap of every unused charm.
6. **Licence and reuse** — see below.
7. **Credit and contact** — who drew them.

## Content requirements

| Element | Requirement |
| --- | --- |
| Artwork | Both renderings per charm, at display size, lazy-loaded below the fold |
| Words | 800–1,200. Enough to carry the technical story; not a manual |
| Technical accuracy | Every claim checkable against the repository |
| Performance | The heaviest page on the site by far — see below |
| Schema | `ImageGallery` or `CollectionPage` with `ImageObject` per charm, `author` and `creator` on each |
| Attribution | Named creator on every image. This is the point of the page |

## The performance constraint

150 SVGs on one page is the largest payload on the site. Three requirements:

- **Lazy-load everything below the fold.** Non-negotiable.
- **Do not inline the SVGs.** They stay as separate cacheable files.
- **Consider paginating by collection** if the full page cannot be made fast. A slow archive is
  worse than a paginated one, and the licensed collections can sit at the back.

The artwork was already re-encoded once from 38.4 MB to 8.3 MB across the directory with verified
visual parity, so the files themselves are in good shape. The risk is request count, not bytes.

## The licensing question — decide before publishing

The archive invites reuse, and **the eight licensed collections cannot be offered for reuse under
any terms.** Marvel, DC, BTS, Football, Stranger Things, Singers, Breaking Bad and Friends are
someone else's IP regardless of who drew the vector.

Three options:

| Option | What it means | Recommendation |
| --- | --- | --- |
| Show everything, licence nothing | The archive is a gallery; all rights reserved | **Safest, and enough** |
| Licence only the 28 cultural charms | The safe set becomes genuinely reusable, which earns repository links | **Best long-term, needs a real decision** |
| Licence everything | Not available | No |

There is a further subtlety on option 2: a nazar or a hamsa is a public-domain *symbol*, but the
specific drawing is an original work. Licensing the drawings is a choice about your own artwork
and is entirely yours to make. It is also the single thing on this page most likely to earn a
durable link, because repositories link to things they can use.

**Do not publish the archive until this is decided**, because adding a licence later is easy and
retracting one is not.

## What the archive must not become

- **Not a charm index.** `/charms` is the database with names, meanings and filters. The archive
  is about the drawings. If the two converge, delete the archive and keep the index.
- **Not a download page.** One CTA at the end, and no more.
- **Not 75 individual artwork pages.** One archive. Individual pages happen only where 600 words
  of history exist, and that is a different page about the symbol, not about the drawing.

## Effort and value

| | |
| --- | --- |
| Effort | **Low** — the assets exist and the technical story is already written in code comments |
| Value | **High** — the best single shot at a design-community link |
| Blocked on | The licensing decision |
| Build after | `/charms`, so the archive has an index to sit under |
