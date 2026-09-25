# Charm ground truth audit

_2026-09-26. Read from the Hangly application source, not from the website._

## A correction before anything else

Three previous documents in this project state that the Hangly application lives in a separate,
private repository and that its charm inventory therefore could not be verified.

**That was wrong.** The app source is in this repository at `apps/Hangly/`. Every question the
last three sprints deferred as unanswerable is answerable, and the answers change the picture
substantially.

## The answer

**The shipping Hangly 2.0 application contains 49 charms.**

Three independent sources agree exactly:

| Source | Count |
| --- | --- |
| `apps/Hangly/Hangly/Assets/CharmLibrary.json` — `charms[]` | **49** |
| `apps/Hangly/Hangly/Models/CharmKind.swift` — enum cases | **49** |
| App release notes `Docs/release-notes/v2.0.0.md` | 27 + 22 = **49** |

The id sets from `CharmLibrary.json` and `CharmKind.swift` are **identical** — verified by set
comparison, not by counting.

The release-note arithmetic: *"Twenty-seven charms to collect"* (16 hand-drawn + 11 seasonal) plus
the four collections described in `CollectionPackCatalog.swift` as *"Marvel, DC, Tamil Spiritual
and BTS"* (5 + 5 + 5 + 7 = 22).

### Version confirmed

`MARKETING_VERSION = 2.0`, `CURRENT_PROJECT_VERSION = 2`. `CharmKind.swift` and
`CharmLibrary.json` were last modified 2026-09-17; the 2.0 appcast shipped 2026-09-19. **This
source is the shipped 2.0 build**, not a work in progress.

## The app's 49 charms, by category

`CharmLibrary.json` defines nine categories:

| Category | Charms | Ids |
| --- | --- | --- |
| Protection | 5 | `nazar`, `hamsa`, `nimbuMirchi`, `drishtiBommai`, `scarab` |
| Luck & Fortune | 4 | `panchangJie`, `daruma`, `manekiNeko`, `horseshoe` |
| Ritual & Home | 2 | `ghanta`, `himmeli` |
| Classic | 5 | `circle` (Bead), `star`, `heart`, `diamond`, `camera` |
| Seasonal | 11 | `snowflake`, `bell`, `candyCane`, `pumpkin`, `ghost`, `bat`, `diya`, `lotus`, `lantern`, `firework`, `luckyCoin` |
| Marvel | 5 | `spiderMan`, `captainAmericaShield`, `ironManHelmet`, `thorHammer`, `hulkFist` |
| DC | 5 | `batmanSymbol`, `supermanShield`, `wonderWomanEmblem`, `shazamLightning`, `greenLanternRing` |
| Tamil Spiritual | 5 | `vel`, `vinayagarCoin`, `omSymbol`, `karuppuStatue`, `templeBell` |
| BTS | 7 | `btsMemberOne` … `btsMemberSeven` |

## The severe finding

**The website lists 55 charms. Only 24 of them exist in the application.**

Thirty-one charms are marketed on the website and are not in the app:

| Website collection | Charms | In app? |
| --- | --- | --- |
| Breaking Bad | 7 | **No — the app has no Breaking Bad** |
| Stranger Things | 6 | **No** |
| Friends | 6 | **No** |
| Football | 5 | **No** |
| Singers | 5 | **No** |
| Dream Catcher | 1 | **No** |
| DC — "Flash" | 1 | **No — the app's DC has Shazam Lightning instead** |

Searched the entire app source for `football`, `strangerThings`, `friends`, `breakingBad`,
`singer`, `dreamCatcher` and their display forms: **zero matches** in `Hangly/` and `Assets/`.

The artwork for these 31 is real and substantial — 32 KB to 297 KB per file, comparable to
genuine app charms. **The art exists; it was never wired into the application.**

## Charms in the app with no website artwork

Five: `circle`, `star`, `heart`, `diamond`, `camera` — the Classic category. These are drawn
procedurally in Swift (`CircleCharm.swift`, `StarCharm.swift`, `HeartCharm.swift`,
`DiamondCharm.swift`, `CameraCharm.swift`) rather than from SVG, which is why no SVG exists for
them. They are fully available to users.

## Artwork present but unused

| Location | Files | Status |
| --- | --- | --- |
| `website/public/charms/` | 31 of 75 | Artwork with no app charm — unused by the product |
| `apps/Hangly/Assets/Charms/` | 40 across 4 folders + 23 loose | Matches the app's SVG charms |

## The appcast contradicts the app's own release notes

The 2.0 appcast — which the updater shows to users — states:

> *Four more charms. A dream catcher joins the **world collection**; the RV joins **Breaking
> Bad**; **The Weeknd** joins **Music Legends**; and Spider-Man gets a second pose.*

The app's own `Docs/release-notes/v2.0.0.md` contains **zero** mentions of a dream catcher, the
RV, The Weeknd, Music Legends or a world collection. Neither do `CharmKind.swift` or
`CharmLibrary.json`.

**The appcast describes four charms and three collections that do not exist in the application it
ships.** This text is displayed inside the updater on first launch after an update.

Note: the appcast is protected infrastructure and was not modified. This is reported, not fixed.

## Charms referenced but missing

| Reference | Where | Exists? |
| --- | --- | --- |
| Dream catcher | Appcast, website collection | **No** |
| The RV / Breaking Bad | Appcast, website collection | **No** |
| The Weeknd / Music Legends | Appcast | **No** |
| Spider-Man second pose | Appcast | **No** — one `spiderMan` only |
| Flash | Website DC collection | **No** — app has Shazam Lightning |

## Hidden, experimental or removed charms

**None found.** Every one of the 49 in `CharmLibrary.json` appears in `CharmKind` and carries a
category, name, region, description and tags. No flags for hidden, beta, experimental,
deprecated or unlockable charms exist anywhere in the catalogue files.

## Summary

| Question asked | Answer |
| --- | --- |
| Charms available in app | **49** |
| Charms selectable by user | **49** (subject to the seasonal rule — see the seasonal audit) |
| Charms hidden | 0 |
| Charms experimental | 0 |
| Charms removed | 0 |
| Charms referenced but missing | 5 (dream catcher, RV, Weeknd, 2nd Spider-Man, Flash) |
| Artwork present but unused | **31** website SVGs |
