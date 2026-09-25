# Charm discoverability audit

_2026-09-26. Measured from the built export at `out/`, not from source._

Each charm was searched for by artwork path and by whole-word display name across all 35 pages. **Charms with no display name cannot be text-matched at all**, which is itself the finding: 20 charms have only a filename.

## Method and its limits

- **Artwork** — the page references `/charms/<id>.svg` or its connected variant.
- **Text** — the rendered page contains the display name as a whole word.
- **Schema** — the display name appears inside a JSON-LD block.
- **Known false positives.** Short or common names match unrelated prose: `Eleven` matches "eleven collections", and `V`, `RM`, `Om` and `Flash` are too short to disambiguate. Text results for those five are unreliable and are marked below.

## Ranking

| Rank | Charms | Share |
| --- | --- | --- |
| Fully Discoverable | 54 | 72% |
| Partially Discoverable | 3 | 4% |
| Invisible Discoverable | 18 | 24% |

## Invisible — 18 charms

No artwork reference, no text mention, no schema entry on any of the 35 pages. They ship, and the website has never acknowledged them.

| id | Has display name? | Licensed |
| --- | --- | --- |
| `bat` | **no** | no |
| `bell` | **no** | no |
| `candyCane` | **no** | no |
| `diya` | **no** | no |
| `firework` | **no** | no |
| `ghanta` | **no** | no |
| `ghost` | **no** | no |
| `himmeli` | **no** | no |
| `horseshoe` | **no** | no |
| `lantern` | **no** | no |
| `lotus` | **no** | no |
| `luckyCoin` | **no** | no |
| `manekiNeko` | **no** | no |
| `panchangJie` | **no** | no |
| `pumpkin` | **no** | no |
| `scarab` | **no** | no |
| `shazamLightning` | **no** | **yes** |
| `snowflake` | **no** | no |

Every one lacks a display name, which is the mechanism: a charm with no name cannot be listed, captioned or matched. `shazamLightning` is additionally licensed IP and must never become indexable content.

## Partially discoverable — 3 charms

| Charm | Artwork pages | Text pages | Why partial |
| --- | --- | --- | --- |
| `daruma` | 1 | 0 | artwork rendered, no display name exists |
| Neymar Jr. | 1 | 0 | artwork rendered, name never written in prose |
| `nimbuMirchi` | 1 | 0 | artwork rendered, no display name exists |

## Fully discoverable — 54 charms

All 55 collection charms except Neymar Jr., which renders without ever being named in prose.

## Surface-by-surface coverage

| Surface | Charms present | Of 75 |
| --- | --- | --- |
| Site artwork | 57 | 76% |
| Site text | 54 | 72% |
| Product page | 54 | 72% |
| Comparison pages | 8 | 11% |
| Guides | 4 | 5% |
| FAQ | 7 | 9% |
| JSON-LD schema | 9 | 12% |
| **In the app** | **unknown** | — |
| **In screenshots** | **unknown** | — |

**Two surfaces cannot be measured here.** App visibility is not recorded in this repository — see `docs/charm-product-audit.md`. Screenshot visibility would require reading the OG and product imagery pixel by pixel; the artwork is composited into social cards by `generate-social-cards.mjs`, but which charms appear in which card is not recorded in a way this audit can read.

## The charms that carry the marketing

A small set does nearly all the work across comparisons, guides and FAQ:

`Dream Catcher`, `Drishti Bommai`, `Hamsa`, `Karuppu`, `Om`, `Eleven`, `Temple Bell`, `Vel`, `Vinayagar`

Eight to nine charms, all from Protection and Tamil Divine — the two unlicensed cultural collections. That is the site correctly leaning on the charms it can safely talk about. It is also a concentration risk: the cultural collections are 9 of 75 charms carrying the entire differentiation argument.

## Full table

| id | Display name | Collection | Artwork | Text | Schema | Rank |
| --- | --- | --- | --- | --- | --- | --- |
| `breakingBad1` | Walter White | Breaking Bad | 1 | 1 | 0 | Fully |
| `breakingBad2` | Jesse Pinkman | Breaking Bad | 1 | 1 | 0 | Fully |
| `breakingBad3` | Saul Goodman | Breaking Bad | 1 | 1 | 0 | Fully |
| `breakingBad4` | Gus Fring | Breaking Bad | 1 | 1 | 0 | Fully |
| `breakingBad5` | Mike Ehrmantraut | Breaking Bad | 1 | 1 | 0 | Fully |
| `breakingBad6` | Heisenberg | Breaking Bad | 1 | 1 | 0 | Fully |
| `breakingBad7` | The RV | Breaking Bad | 1 | 2 | 0 | Fully |
| `btsMemberFive` | Jimin | BTS | 1 | 1 | 0 | Fully |
| `btsMemberFour` | RM | BTS | 1 | 1 | 52 | Fully |
| `btsMemberOne` | Jin | BTS | 1 | 1 | 0 | Fully |
| `btsMemberSeven` | Jung Kook | BTS | 1 | 1 | 0 | Fully |
| `btsMemberSix` | V | BTS | 1 | 1 | 56 | Fully |
| `btsMemberThree` | J-Hope | BTS | 1 | 1 | 0 | Fully |
| `btsMemberTwo` | Suga | BTS | 1 | 1 | 0 | Fully |
| `batmanSymbol` | Batman | DC | 1 | 1 | 0 | Fully |
| `flash` | Flash | DC | 1 | 1 | 0 | Fully |
| `greenLanternRing` | Green Lantern | DC | 1 | 1 | 0 | Fully |
| `supermanShield` | Superman | DC | 1 | 1 | 0 | Fully |
| `wonderWomanEmblem` | Wonder Woman | DC | 1 | 1 | 0 | Fully |
| `dreamCatcher` | Dream Catcher | Dream Catcher | 1 | 4 | 1 | Fully |
| `football25` | Cristiano Ronaldo | Football | 1 | 1 | 0 | Fully |
| `football26` | Lionel Messi | Football | 1 | 1 | 0 | Fully |
| `football27` | Neymar Jr. | Football | 1 | 0 | 0 | Partially |
| `football28` | Real Madrid | Football | 1 | 1 | 0 | Fully |
| `football29` | FC Barcelona | Football | 1 | 1 | 0 | Fully |
| `friends14` | Rachel Green | Friends | 1 | 1 | 0 | Fully |
| `friends15` | Monica Geller | Friends | 1 | 1 | 0 | Fully |
| `friends16` | Ross Geller | Friends | 1 | 1 | 0 | Fully |
| `friends17` | Joey Tribbiani | Friends | 1 | 1 | 0 | Fully |
| `friends18` | Chandler Bing | Friends | 1 | 1 | 0 | Fully |
| `friends19` | Phoebe Buffay | Friends | 1 | 1 | 0 | Fully |
| `captainAmericaShield` | Captain America Shield | Marvel | 1 | 1 | 0 | Fully |
| `hulkFist` | Hulk Fist | Marvel | 1 | 1 | 0 | Fully |
| `ironManHelmet` | Iron Man Helmet | Marvel | 1 | 1 | 0 | Fully |
| `spiderMan` | Spider-Man | Marvel | 1 | 2 | 0 | Fully |
| `thorHammer` | Thor Hammer | Marvel | 1 | 1 | 0 | Fully |
| `drishtiBommai` | Drishti Bommai | Protection | 1 | 3 | 2 | Fully |
| `hamsa` | Hamsa | Protection | 1 | 3 | 0 | Fully |
| `nazar` | Nazar / Evil Eye | Protection | 1 | 1 | 0 | Fully |
| `singer20` | Billie Eilish | Singers | 1 | 1 | 0 | Fully |
| `singer21` | XXXTENTACION | Singers | 1 | 1 | 0 | Fully |
| `singer22` | Michael Jackson | Singers | 1 | 1 | 0 | Fully |
| `singer23` | Taylor Swift | Singers | 1 | 1 | 0 | Fully |
| `singer24` | Juice WRLD | Singers | 1 | 1 | 0 | Fully |
| `strangerThings10` | Dustin Henderson | Stranger Things | 1 | 1 | 0 | Fully |
| `strangerThings11` | Lucas Sinclair | Stranger Things | 1 | 1 | 0 | Fully |
| `strangerThings12` | Will Byers | Stranger Things | 1 | 1 | 0 | Fully |
| `strangerThings13` | Demogorgon | Stranger Things | 1 | 1 | 0 | Fully |
| `strangerThings8` | Eleven | Stranger Things | 1 | 24 | 1 | Fully |
| `strangerThings9` | Mike Wheeler | Stranger Things | 1 | 1 | 0 | Fully |
| `karuppuStatue` | Karuppu | Tamil Divine | 1 | 2 | 1 | Fully |
| `omSymbol` | Om | Tamil Divine | 1 | 3 | 2 | Fully |
| `templeBell` | Temple Bell | Tamil Divine | 1 | 4 | 0 | Fully |
| `vel` | Vel | Tamil Divine | 1 | 4 | 5 | Fully |
| `vinayagarCoin` | Vinayagar | Tamil Divine | 1 | 3 | 2 | Fully |
| `bat` | **none** | — | 0 | 0 | 0 | Invisible |
| `bell` | **none** | — | 0 | 0 | 0 | Invisible |
| `candyCane` | **none** | — | 0 | 0 | 0 | Invisible |
| `daruma` | **none** | — | 1 | 0 | 0 | Partially |
| `diya` | **none** | — | 0 | 0 | 0 | Invisible |
| `firework` | **none** | — | 0 | 0 | 0 | Invisible |
| `ghanta` | **none** | — | 0 | 0 | 0 | Invisible |
| `ghost` | **none** | — | 0 | 0 | 0 | Invisible |
| `himmeli` | **none** | — | 0 | 0 | 0 | Invisible |
| `horseshoe` | **none** | — | 0 | 0 | 0 | Invisible |
| `lantern` | **none** | — | 0 | 0 | 0 | Invisible |
| `lotus` | **none** | — | 0 | 0 | 0 | Invisible |
| `luckyCoin` | **none** | — | 0 | 0 | 0 | Invisible |
| `manekiNeko` | **none** | — | 0 | 0 | 0 | Invisible |
| `nimbuMirchi` | **none** | — | 1 | 0 | 0 | Partially |
| `panchangJie` | **none** | — | 0 | 0 | 0 | Invisible |
| `pumpkin` | **none** | — | 0 | 0 | 0 | Invisible |
| `scarab` | **none** | — | 0 | 0 | 0 | Invisible |
| `shazamLightning` | **none** | — | 0 | 0 | 0 | Invisible |
| `snowflake` | **none** | — | 0 | 0 | 0 | Invisible |
