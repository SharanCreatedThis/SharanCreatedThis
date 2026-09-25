# 3 — Charm visibility audit

_Measured 2026-09-25 from the source and the built export. Placed first because the other four
plans depend on knowing exactly what is invisible and why._

## Headline

| State | Count |
| --- | --- |
| Charms with complete artwork shipping | **75** |
| Named and rendered in a collection | 55 |
| Named outside a collection | 1 (`daruma`) |
| Artwork rendered, never named in text | 1 (`nimbuMirchi`) |
| **Completely invisible — no name, no artwork, no mention** | **18** |

The "56 surfaced" figure from the charm count audit is 55 collection charms plus `daruma`.
`nimbuMirchi` is a 57th partial case: its artwork appears on the product page with alt text, but
its name appears in no body copy and it is absent from the generated manifest.

## Why only 56 are surfaced — the actual mechanism

Not an oversight in one place. Three separate causes compound.

### Cause 1 — the site renders charms from `Collections.tsx`, and 20 charms are not in it

Every charm that appears anywhere on the site does so because a component names it. There are
five such components, and between them they name 57 of the 75:

| Component | Charms named | How |
| --- | --- | --- |
| `Collections.tsx` | 55 | The eleven collections |
| `Demo.tsx` | 4 | `nazar`, `daruma`, `vinayagarCoin`, `spiderMan` |
| `HowItWorks.tsx` | 1 | `daruma` |
| `Features.tsx` | 3 | `nimbuMirchi`, `karuppuStatue`, `captainAmericaShield`, `drishtiBommai`, `btsMemberThree` |
| `Hero.tsx` / `CTA.tsx` | a few | one-off `<Charm name=…>` |

A charm not named by one of those files does not exist as far as the website is concerned. The
18 invisible charms are simply never named.

### Cause 2 — the 20 have no human-readable label anywhere in the codebase

This is the real blocker and it is easy to miss. A collection entry is a pair:

```
["nazar", "Nazar / Evil Eye"]
```

The id, and the display label. **The 20 non-collection charms have only an id.** There is no
`Maneki-neko`, no `Daruma doll`, no `Nimbu-mirchi` string anywhere — only `manekiNeko`,
`daruma`, `nimbuMirchi` as filenames.

So they cannot be surfaced by flipping a flag. Somebody has to write a display name, and for a
page worth publishing, an origin and a meaning too. **That authoring work is the gap, not the
engineering.**

### Cause 3 — the manifest scanner does not read every component that renders a charm

`generate-charm-manifest.mjs` scans `Collections.tsx`, `Demo.tsx`, `Hero.tsx` and `CTA.tsx`. It
does not scan `Features.tsx` or `HowItWorks.tsx`, both of which render `<Charm name=…>`.

`nimbuMirchi` is rendered by `Features.tsx` and is therefore absent from `CHARM_ART`, falling
through to the plain-artwork fallback. In this instance the fallback is visually correct — that
card draws its own CSS thread — so nothing is broken today.

It is still a latent hole: the manifest's promise is that a charm with no artwork fails the
build, and a charm rendered only from an unscanned file escapes that check.

**Recommendation:** have the scanner read every file under `src/components/hangly/` for
`<Charm name="…">` rather than an allow-list of four.

## The 18 invisible charms

Verified: zero whole-word mentions in any rendered page, zero artwork references. Earlier counts
suggesting `bat`, `bell` and `lantern` appeared were substring matches inside unrelated words.

| id | Almost certainly | Competitor sells it? |
| --- | --- | --- |
| `manekiNeko` | Japanese beckoning cat | **Lucky Dangle $7.77, Screen Charms $4.99, DangleJoy** |
| `horseshoe` | European luck charm | **Lucky Dangle** |
| `scarab` | Egyptian amulet | **Lucky Dangle** |
| `himmeli` | Finnish straw ornament | **Lucky Dangle** |
| `panchangJie` | Chinese endless knot | **Lucky Dangle** |
| `ghanta` | Hindu ritual bell | **Lucky Dangle** |
| `luckyCoin` | Chinese coin | — |
| `diya` | Diwali oil lamp | — |
| `lotus` | Hindu/Buddhist lotus | — |
| `firework` | Celebration | — |
| `lantern` | Festival lantern | — |
| `bell` | Generic bell | — |
| `bat` | Halloween | — |
| `ghost` | Halloween | — |
| `pumpkin` | Halloween | — |
| `candyCane` | Winter | — |
| `snowflake` | Winter | — |
| `shazamLightning` | **DC Comics — licensed IP** | — |

Plus `daruma` and `nimbuMirchi`, both partially surfaced, both also sold by competitors.

**Six of the eighteen are charms a rival charges money for.** Lucky Dangle's twelve-charm
catalogue at $7.77–$11.11 overlaps this set almost exactly.

## Visible in the app — not verifiable here

The requirement asks for "visible in app" per charm. **I cannot determine this.** The Hangly
application lives in a separate, private repository; this repository contains the website and the
artwork it ships. Nothing here reports which charms the app exposes in its picker, or whether the
seasonal charms appear automatically on their dates.

The 2.0 release notes mention "eleven seasonal charms that arrive on their own", which suggests
at least eleven of the twenty are app-surfaced by date rather than by the picker — but eleven is
not twenty, and the release note does not say which.

**This needs answering before `/charms` ships**, because the page will state what a user gets. Two
questions:

1. Which of the 20 appear in the app's charm picker?
2. Which appear automatically by date, and on what dates?

## Priority

| # | Action | Effort | Unblocks |
| --- | --- | --- | --- |
| 1 | Answer the two app questions above | — | Everything |
| 2 | Author display names + one-line meanings for the 20 | M | `/charms`, `/charms/lucky` |
| 3 | Move the 20 into a named collection in the app and in `Collections.tsx` | M | Published count = installed count, permanently |
| 4 | Widen the manifest scanner to all Hangly components | S | Closes the latent hole |
| 5 | Move `shazamLightning` into the DC collection | S | Correct classification |
