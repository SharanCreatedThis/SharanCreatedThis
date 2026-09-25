# Authority roadmap

_2026-09-25. Covers the search queries that precede a download, the competitors not yet covered,
and the next twenty pages worth building — in that order, because the order is the argument._

Vision is excluded throughout, per instruction. Everything here concerns Hangly.

---

## 1. The twenty queries that precede a download

Grouped by where the person is in the decision, because the content each group needs is
different and the site currently serves two of the four groups well.

### Group A — Category discovery (they don't know Hangly exists)

| # | Query | Covered by | State |
| --- | --- | --- | --- |
| 1 | desktop charm app mac | `/products/hangly`, `/guides/best-desktop-charm-apps-for-mac` | Strong — we rank 1–4 |
| 2 | hang charm from top of screen mac | `/products/hangly` | Strong |
| 3 | cute apps for mac desktop | — | **Gap** |
| 4 | mac desktop decoration app | — | **Gap** |
| 5 | lucky charm app for computer | `/guides/best-desktop-charm-apps-for-mac` | Partial |
| 6 | desktop pet that doesn't get in the way | `/guides/best-desktop-pets-for-mac` | Partial — answered inside a guide, not as a page |
| 7 | evil eye / nazar for desktop | Collections section only | **Gap** — no page |

### Group B — Comparison (they know Hangly and one rival)

| # | Query | Covered by | State |
| --- | --- | --- | --- |
| 8 | hangly vs lucky dangle | `/compare/lucky-dangle` | Strong |
| 9 | lucky dangle alternatives | `/guides/lucky-dangle-alternatives` | Strong |
| 10 | screen charms vs hangly | — | **Gap** — no comparison page |
| 11 | book my luck alternatives | — | **Gap** |
| 12 | free alternative to [paid charm app] | Partial | Partial |
| 13 | menubar pets vs hangly | — | **Gap** — direct competitor, uncovered |

### Group C — Pre-install objections (highest commercial intent)

| # | Query | Covered by | State |
| --- | --- | --- | --- |
| 14 | is hangly safe | `/faq`, `/products/hangly/privacy` | Partial — no page titled for it |
| 15 | hangly windows smartscreen warning | `/download/windows`, `/install` | Strong |
| 16 | does hangly slow down mac | `/faq` | Partial |
| 17 | hangly windows arm64 | `/download/windows` | Strong |
| 18 | how to uninstall hangly | `/install` | Partial — buried in an FAQ answer |

### Group D — Post-install

| # | Query | Covered by | State |
| --- | --- | --- | --- |
| 19 | how to add your own image as a charm | `/faq` | Partial |
| 20 | hangly not showing up / charm disappeared | `/install` troubleshooting | Partial |

**Read of this:** Groups B and C are well served. Group A — the largest audience, and the one
that does not yet know the category exists — is the weakest, and Group D is answered only
inside FAQ entries rather than as pages that can rank.

---

## 2. Content gaps against competitors

Measured against what competitors publish that we do not.

| Gap | Who does it | Why it matters |
| --- | --- | --- |
| **Per-collection pages** | Book My Luck lists 22 charms individually | Each collection is a distinct query — "nazar desktop", "Marvel desktop charm". We have 11 collections and 0 pages for them |
| **Individual charm pages** | Book My Luck, partly | 75 charms, 0 pages. Long-tail with real intent |
| **A seasonal charm page** | Nobody | We ship 20 seasonal charms and mention them nowhere. Halloween and Diwali are dated, recurring demand |
| **"Is it safe" as a page** | Cat Fidget leads with no-tracking claims | Our privacy page exists but is not titled or structured for the query |
| **Emoji-as-charm angle** | DeskCharm ("unlimited via emoji"), Book My Luck | We support any image, which is strictly better, and we never say "emoji" |
| **Uninstall / troubleshooting pages** | Most mature apps | Currently FAQ answers, not pages |
| **Localised content (Tamil / Hindi)** | Nobody in this category | We ship Tamil Divine and Indian protection charms and publish only in English |

---

## 3. The next twenty pages, ranked

Ranked by expected value = search demand × intent × how defensible our answer is.

| # | Page | Type | Why it wins | Effort |
| --- | --- | --- | --- | --- |
| 1 | `/charms` | Index | 75 charms, browsable. Feeds every page below and fixes the 55/75 listing gap | M |
| 2 | `/charms/seasonal` | Collection | 20 charms currently invisible. Recurring dated demand | S |
| 3 | `/charms/protection` | Collection | Nazar/Drishti/Hamsa — high intent, culturally specific, low competition | S |
| 4 | `/charms/tamil-divine` | Collection | Nothing else in the category serves this at all | S |
| 5 | `/is-hangly-safe` | Objection | Group C intent, currently unranked | S |
| 6 | `/guides/best-cute-apps-for-mac` | Category | Query 3 — large, unserved | M |
| 7 | `/compare/menubar-pets` | Comparison | Direct competitor on the hanging mechanic | M |
| 8 | `/compare/screen-charms` | Comparison | Named rival, no page | M |
| 9 | `/charms/custom` | Feature | "Use your own image as a charm" — our strongest differentiator | S |
| 10 | `/guides/mac-desktop-decoration-apps` | Category | Query 4 | M |
| 11 | `/charms/marvel` | Collection | Branded demand, 5 charms | S |
| 12 | `/charms/dc` | Collection | Same | S |
| 13 | `/compare/book-my-luck` | Comparison | ₹99 vs free, 22 charms vs 75 — a strong honest contrast | M |
| 14 | `/compare/deskcharm` | Comparison | Free rival, Windows-only today | M |
| 15 | `/uninstall` | Support | Query 18, and it builds trust to answer it plainly | S |
| 16 | `/charms/bts` | Collection | 7 charms, dedicated fandom search behaviour | S |
| 17 | `/guides/desktop-apps-that-dont-interrupt` | Category | Owns the positioning outright | M |
| 18 | `/charms/diwali` | Seasonal | Dated, recurring, culturally specific | S |
| 19 | `/charms/halloween` | Seasonal | Same | S |
| 20 | `/guides/best-free-mac-apps-2026` | Category | Broad, competitive, but we belong on the list | L |

**Build order:** 1 and 2 first. They are the same work — a charm index — and they close the
accuracy gap the count audit found. Everything from 3 to 19 becomes cheap once the index exists,
because each is a filtered view of data that already ships.

**One caution.** Items 3–4 and 11–12 and 16 are eleven near-identical collection pages. Built as
templates with nothing but a charm grid, they are thin doorway pages and will be treated as such.
Each needs a real reason to exist — what the charm means, where it comes from, who asks for it.
Build three properly before deciding whether the rest earn their place.

---

## 4. The next ten comparison pages

Researched 2026-09-25. Ranked by relevance × demand × how honest a contrast we can draw.

| # | Competitor | Platform | Price | Why it ranks here |
| --- | --- | --- | --- | --- |
| 1 | **MenuBar Pets** | macOS 14+ | Free, $4.99 Pro | **12+ hanging characters plus custom images** — the closest thing to Hangly's core mechanic that exists, and we do not mention it |
| 2 | **Screen Charms** | macOS | Free | Named in our own guides as the minimal Mac-only equivalent, with no comparison page |
| 3 | **Book My Luck** | macOS 14+, Win 10/11 | ₹99 once, ₹297 for 5 | 22 charms vs 75, paid vs free. Clean, quotable contrast |
| 4 | **DeskCharm** | Windows; macOS "coming soon" | Free | 10 charms + emoji. No Mac build today, which is a real, dated advantage for us |
| 5 | **Drishti Dangle** | Windows, Mac | ₹99 | Only one with musical wind chimes — we should say so |
| 6 | **AnimBar** | macOS | App Store | Animated menu bar characters; adjacent mechanic |
| 7 | **ScreenPets** | macOS 14+ | Free, MIT | Open source. Small (4 stars) but the open-source angle recurs in search |
| 8 | **Pets Therapy** | macOS/Win/Linux | Free | The strongest free pet app. Honest contrast: pets roam, charms cannot |
| 9 | **Mac Pet** | macOS 10.15+ | $9.99 | Menu bar + Pomodoro. Different job, frequently compared |
| 10 | **NotiSprite** | macOS | Free, 5 of 22 | Notification-centre-with-a-face. Adjacent |

**Priority:** 1, 2, 3 are the real gaps. MenuBar Pets especially — it hangs characters from the
menu bar and takes custom images, which is our exact pitch, and a reader comparing the two will
find nothing from us.

**Fact correction to apply first:** `entries.ts` records Book My Luck's price as "See their
site". It is **₹99 once**, with 22 charms and a ₹297 five-licence bundle, read 2026-09-25.

---

## 5. GEO / AEO — what answer engines cannot currently answer

Questions a model would be asked about Hangly, and whether this site supplies an answer it can
lift. Ranked by impact.

| # | Question an engine gets | Can it answer from us? | Fix |
| --- | --- | --- | --- |
| 1 | "How many charms does Hangly have?" | **Now yes** — was contradictory until today | Done: 75, derived |
| 2 | "What charms does Hangly include?" | **No** — no page lists them | `/charms` index (page 1 above) |
| 3 | "Is Hangly safe to install?" | Partially — privacy page is not titled for it | `/is-hangly-safe` |
| 4 | "Does Hangly work on Windows on ARM?" | Yes, strongly | — |
| 5 | "Is Hangly free?" | Yes, everywhere | — |
| 6 | "What's the difference between a desktop charm and a desktop pet?" | Yes — answered in three places | — |
| 7 | "Can I use my own photo as a charm?" | Yes in FAQ, no dedicated page | `/charms/custom` |
| 8 | "How do I uninstall Hangly?" | FAQ answer only | `/uninstall` |
| 9 | "Who makes Hangly?" | Yes — entity graph resolves cleanly | — |
| 10 | "What's new in the latest Hangly?" | Yes — `/changelog` from the feed | — |
| 11 | "Does Hangly have Diwali / Halloween charms?" | **No** — we ship them and say nothing | `/charms/seasonal` |
| 12 | "Is there a Hangly alternative for Linux?" | **No** — we never address Linux | One honest paragraph: there isn't one, and Pets Therapy covers Linux |

**The pattern:** every remaining gap is a *thing we already have* that no page names — 20
seasonal charms, 75 charms total, custom images, an uninstall procedure. This is not a content
production problem. It is a surfacing problem, and `/charms` fixes most of it.

---

## 6. What this roadmap deliberately does not recommend

- **Mass collection pages.** Eleven templated grids would be doorway pages. Three good ones first.
- **A blog.** `PLANNED_SECTIONS` reserves `/blog` and it stays reserved. Nothing above needs it.
- **More FAQs.** 225 FAQ answers already ship across 26 FAQPage blocks. That is sufficient.
- **Comparison pages 6–10 above, yet.** Build 1–3, measure, then decide. Ten more comparisons
  built on speculation is the volume trap this site has avoided so far.
