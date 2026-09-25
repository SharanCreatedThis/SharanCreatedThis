# Charm product audit

_2026-09-26. Verified facts only. Where the repository cannot answer a question, it says so._

## The finding that changes things

**The website ships artwork for 75 charms. The Hangly application has more.**

The 2.0 release notes — the same appcast the updater reads, so the most authoritative charm
document available — name four additions:

> *Four more charms. A dream catcher joins the **world collection**; the RV joins Breaking Bad;
> **The Weeknd** joins **Music Legends**; and **Spider-Man gets a second pose**, hanging from the
> web line in his own hand.*

Checked against the artwork directory:

| 2.0 addition | Artwork on the website | Named on the website |
| --- | --- | --- |
| Dream catcher | `dreamCatcher.svg` — present | Yes |
| The RV → Breaking Bad | `breakingBad7.svg` — present | Yes, "The RV" |
| **The Weeknd → Music Legends** | **absent** | **absent** |
| **Spider-Man, second pose** | **absent** — only `spiderMan.svg` | **absent** |

There is no `weeknd`, `theWeeknd` or any second Spider-Man file in `public/charms/`. There is no
"Music Legends" collection and no "world collection" anywhere in `Collections.tsx`.

**So the application contains at least 77 charms, and the website knows about 75.**

### This challenges a conclusion from the previous sprint

The charm count audit concluded that "80+ charms" was unsupported and replaced it with 75
everywhere. That conclusion was correct *about the website* and may be wrong *about the product*.

- **75 is verifiable**: the number of charms whose artwork ships in this repository.
- **The site states it as a product claim** — "Hangly ships 75 charms" — which is a claim about
  the application, and the application demonstrably contains at least two the website has never
  seen.
- "80+" was unsupported by evidence, but it may have been closer to the truth than 75 is.

**The site may now understate the product.** This is not a reason to restore "80+", which was
still a number nobody could check. It is a reason to get the real figure from the app before
`/charms` publishes a count as a product promise.

## The app and the website disagree about collections

| App (per 2.0 notes) | Website (`Collections.tsx`) |
| --- | --- |
| "world collection" | "Dream Catcher", 1 charm |
| "Music Legends" | "Singers", 5 charms |

Either the app renamed these and the site did not follow, or the site invented its own grouping.
Either way, **`Collections.tsx` is not a mirror of the app's collection model**, and every page
built on it inherits that.

## Eleven seasonal charms, not twenty

The 2.0 notes state: *"eleven seasonal charms that arrive on their own"*.

The website has **20 charms belonging to no collection**. Eleven is not twenty.

The most likely explanation — unverified — is that nine of the twenty belong to app collections
the website does not model, plausibly the "world collection". `manekiNeko`, `daruma`, `horseshoe`,
`scarab`, `himmeli`, `panchangJie`, `luckyCoin`, `lotus` and `ghanta` would be a coherent "world"
grouping, leaving exactly eleven seasonal: `bat`, `ghost`, `pumpkin`, `candyCane`, `snowflake`,
`diya`, `firework`, `lantern`, `bell`, `nimbuMirchi` and one other.

**That is a hypothesis with an appealing arithmetic fit, and it is not evidence.** It should not
reach a page.

## What is verified

### Charm artwork
- **75 charms** with artwork in `public/charms/`
- **75** with a matching connected rendering in `public/charms/connected/` — exact parity, no gaps
- **0** charms falling back to plain artwork in the generated manifest

### Collection membership — 55 charms across 11 collections

| Collection | Charms | Licensed |
| --- | --- | --- |
| Protection | 3 | No |
| Tamil Divine | 5 | No |
| Dream Catcher | 1 | No |
| Marvel | 5 | **Yes** |
| DC | 5 | **Yes** |
| BTS | 7 | **Yes** |
| Football | 5 | **Yes** |
| Stranger Things | 6 | **Yes** |
| Singers | 5 | **Yes** |
| Breaking Bad | 7 | **Yes** |
| Friends | 6 | **Yes** |

**46 of 55 collection charms are licensed IP**, plus `shazamLightning` loose in the uncollected
set — 47 of 75.

### Charm id numbering — resolved

An earlier concern that `singer20`–`singer24` implied nineteen missing singers was wrong. The
numbering is one continuous sequence shared across five collections:

```
breakingBad 1–7 · strangerThings 8–13 · friends 14–19 · singer 20–24 · football 25–29
```

**1 to 29 with no gaps.** The website's artwork set is internally complete.

### Components that render a charm

| Component | Charms named |
| --- | --- |
| `Collections.tsx` | 55 |
| `Features.tsx` | `nimbuMirchi`, `karuppuStatue`, `captainAmericaShield`, `drishtiBommai`, `btsMemberThree` |
| `Demo.tsx` | `nazar`, `daruma`, `vinayagarCoin`, `spiderMan` |
| `HowItWorks.tsx` | `spiderMan`, `nazar`, `daruma` |
| `Hero.tsx` | `spiderMan` |
| `CTA.tsx` | `nazar` |

`generate-charm-manifest.mjs` reads only `Collections.tsx`, `Demo.tsx`, `Hero.tsx` and `CTA.tsx`.
It does not read `Features.tsx` or `HowItWorks.tsx`, which is why `nimbuMirchi` renders artwork
while being absent from the manifest. Harmless today; a hole in a check meant to guarantee that
no charm ships without artwork.

## What cannot be verified from this repository

| Question | Why it matters |
| --- | --- |
| **How many charms does the app contain?** | `/charms` will publish a count as a product claim |
| **Which charms are installed by default?** | The audit was asked for this. Nothing here records it |
| **Which eleven are the seasonal ones, and on what dates?** | `/charms/seasonal` depends on it |
| **What are the app's real collection names?** | The site says "Singers"; the app says "Music Legends" |
| **Is The Weeknd shipping, and the second Spider-Man pose?** | Both are in the 2.0 notes and absent here |

These are product questions, answerable in minutes by someone with the app source, and they gate
the accuracy of every page in the ecosystem.

## Recommendations

1. **Do not publish a charm count on `/charms` until the app's real figure is known.** The page
   can list the 75 charms whose artwork exists and describe them as "the charms shown here"
   without asserting a product total.
2. **Reconcile the collection model** between app and site, or state plainly that the site groups
   charms its own way.
3. **Widen the manifest scanner** to every Hangly component.
4. **Record the answers in the registry** once known, with provenance, rather than in a document.
