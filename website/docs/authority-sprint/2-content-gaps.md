# 2 — Content gap analysis

_30 pages, ranked. Every one is supported by something Hangly actually ships._

Authority impact is scored **High / Medium / Low** on three factors: whether we can say something
nobody else can, whether the query has commercial intent, and whether the page would earn a link
or a citation on its own.

Search intent uses the standard four: informational, commercial investigation, transactional,
navigational.

**Excluded on purpose:** every page targeting one of the eight licensed collections — Marvel, DC,
BTS, Football, Stranger Things, Singers, Breaking Bad, Friends. See
`3-charm-architecture.md` for why. That removes roughly a dozen otherwise-obvious pages.

---

## Tier 1 — build these first (1–8)

| # | Page | Target query | Intent | Type | Impact |
| --- | --- | --- | --- | --- | --- |
| 1 | `/charms` | "hangly charms", "desktop charm list" | Commercial | Filterable index of all 75 | **High** |
| 2 | `/charms/lucky` | "lucky charm app desktop", "free lucky charms pc" | Commercial | Collection, 20 charms | **High** |
| 3 | `/charms/lucky/nazar` | "nazar desktop", "evil eye for pc" | Informational | Long-form charm page | **High** |
| 4 | `/compare/menubar-pets` | "menubar pets alternative" | Commercial investigation | Comparison | **High** |
| 5 | `/charms/custom` | "use own image as desktop charm" | Commercial | Feature page | **High** |
| 6 | `/compare/book-my-luck` | "book my luck alternative" | Commercial investigation | Comparison | **High** |
| 7 | `/charms/protection` | "protection charm desktop", "drishti bommai" | Informational | Collection, 3 charms | **High** |
| 8 | `/compare/screen-charms` | "screen charms alternative" | Commercial investigation | Comparison | **High** |

## Tier 2 — high value, build after measuring tier 1 (9–18)

| # | Page | Target query | Intent | Type | Impact |
| --- | --- | --- | --- | --- | --- |
| 9 | `/charms/tamil-divine` | "tamil god desktop wallpaper app", "vinayagar" | Informational | Collection, 5 charms | **High** |
| 10 | `/charms/lucky/maneki-neko` | "maneki neko desktop" | Informational | Charm page | Medium |
| 11 | `/charms/lucky/daruma` | "daruma doll desktop" | Informational | Charm page | Medium |
| 12 | `/charms/seasonal/diwali` | "diwali desktop decoration" | Informational | Seasonal collection | **High** |
| 13 | `/is-hangly-safe` | "is hangly safe", "hangly virus" | Commercial | Objection page | **High** |
| 14 | `/guides/best-cute-apps-for-mac` | "cute apps for mac" | Commercial investigation | Category guide | Medium |
| 15 | `/uninstall` | "how to uninstall hangly" | Navigational | Support page | Medium |
| 16 | `/charms/seasonal` | "seasonal desktop decorations" | Informational | Seasonal hub | Medium |
| 17 | `/guides/mac-desktop-decoration-apps` | "mac desktop decoration" | Commercial investigation | Category guide | Medium |
| 18 | `/compare/desk-dangle` | "desk dangle alternative mac" | Commercial investigation | Comparison | Medium |

## Tier 3 — worth building, lower urgency (19–30)

| # | Page | Target query | Intent | Type | Impact |
| --- | --- | --- | --- | --- | --- |
| 19 | `/charms/protection/drishti-bommai` | "drishti bommai meaning" | Informational | Charm page | Medium |
| 20 | `/charms/tamil-divine/vel` | "vel murugan symbol" | Informational | Charm page | Medium |
| 21 | `/charms/seasonal/halloween` | "halloween desktop decoration" | Informational | Seasonal | Medium |
| 22 | `/guides/desktop-apps-that-dont-interrupt` | "non intrusive desktop app" | Commercial investigation | Category guide | **High** |
| 23 | `/charms/lucky/horseshoe` | "lucky horseshoe desktop" | Informational | Charm page | Low |
| 24 | `/guides/menu-bar-pets-and-charms` | "menu bar pet mac" | Commercial investigation | Category guide | Medium |
| 25 | `/charms/seasonal/winter` | "christmas desktop decoration free" | Informational | Seasonal | Medium |
| 26 | `/charms/lucky/scarab` | "scarab amulet meaning" | Informational | Charm page | Low |
| 27 | `/compare/drishti-dangle` | "drishti dangle alternative" | Commercial investigation | Comparison | Low |
| 28 | `/guides/free-vs-paid-desktop-charm-apps` | "free desktop charm app" | Commercial investigation | Category guide | **High** |
| 29 | `/charms/tamil-divine/vinayagar` | "vinayagar / ganesha symbol" | Informational | Charm page | Medium |
| 30 | `/hangly-vs-desktop-pets` | "desktop charm vs desktop pet" | Informational | Positioning page | Medium |

---

## By category, as requested

- **Charm-related** — 1, 2, 3, 5, 7, 9, 10, 11, 19, 20, 23, 26, 29 (13 pages)
- **Cultural charms** — 3, 7, 9, 12, 19, 20, 26, 29 (8)
- **Luck charms** — 2, 3, 10, 11, 23, 26 (6)
- **Desktop customization** — 14, 17, 22, 28 (4)
- **Mac personalization** — 14, 17 (2)
- **Menu bar customization** — 4, 24 (2)
- **Desktop pets** — 24, 30 (2)
- **Aesthetic workspace setup** — 14, 17, 21, 25 (4)
- **Productivity customization** — 22 (1)
- **Collectible systems** — 1, 16 (2)

**Two categories are deliberately thin.** *Productivity customization* gets one page because
Hangly does not do productivity — it has no timer, no streaks, no reminders, and pretending
otherwise to fill a category would produce exactly the templated filler this sprint was told to
avoid. *Collectible systems* gets two because Hangly has no rarity or unlock mechanic today; see
`4-citation-assets.md`, where it is proposed as a product change rather than assumed.

## What this list does not include, and why

- **Eight collection pages for the licensed IP.** Highest apparent traffic, unacceptable risk.
- **75 individual charm pages.** Only about 12 charms have 600 honest words behind them.
- **A blog.** Nothing above needs one, and `/blog` stays reserved.
- **More FAQs.** 169 distinct questions already ship across 25 FAQPage blocks.
- **Localised Tamil or Hindi pages.** Genuinely interesting given the Tamil Divine collection, and
  deliberately excluded: doing it properly needs a native speaker, and machine-translating a
  cultural page about Vinayagar would be worse than not having one.
