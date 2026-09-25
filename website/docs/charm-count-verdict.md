# Charm count verdict

_2026-09-26. The answer, and the exact wording that is safe to use._

## Can Hangly claim 75, 77 or 80+ charms?

**None of the above. The defensible number is 49.**

| Claim | Verdict | Evidence |
| --- | --- | --- |
| **80+ charms** | **No.** Unsupported by anything | No artefact in either repository produces 80 |
| **77 charms** | **No.** My own inference last sprint, and wrong | Based on appcast text naming charms that do not exist in the app |
| **75 charms** | **No.** Currently on 20 live pages | Counts 31 website SVGs with no charm behind them; omits 5 that ship |
| **55 charms** | **No.** The website's collection listing | Only 24 of the 55 exist in the app |
| **49 charms** | **Yes** | `CharmLibrary.json` = 49, `CharmKind` = 49, identical sets; release-note arithmetic agrees |

### Why 77 was wrong

Last sprint I concluded the app had "at least 77 charms" because the 2.0 appcast names a dream
catcher, the RV, The Weeknd and a second Spider-Man pose that the website lacked. I reasoned that
the app must contain them.

**It does not.** The app's own `v2.0.0.md` never mentions them, and none appears in `CharmKind` or
`CharmLibrary.json`. The appcast describes charms that exist in neither place. I inferred a
product fact from marketing text, which is the same mistake as "80+" in a different direction.

### Why 75 is worse than it looks

75 is not an overstatement of 26 spread thinly. It is **31 charms that do not exist** minus **5
that do and are uncounted**. A user who installs Hangly expecting the Breaking Bad, Friends,
Stranger Things, Football or Singers collections advertised on the product page will not find
them. They are not hidden, not unlockable, not coming in an update that exists — they are not in
the application.

This is a factual accuracy problem on live pages, not an SEO problem.

## The blocker

**31 charms are marketed and do not ship.** Until that is resolved — by shipping them, removing
them, or labelling them — no total is safe, because any number implies the collections beside it
are real.

The right number *after* resolution:

- **If the 31 are removed from the website:** 49.
- **If the 31 ship in a future release:** 80. Which is where "80+" presumably came from — it may
  have been a forward-looking figure that outran the build.

## Safe wording, per surface

Every line below is true of Hangly 2.0 as it ships today.

### Homepage
> **"A charm that hangs from the top of your screen, with real pendulum physics. Free for Mac and
> Windows."**

No count. The home page does not currently state one and should not start.

### Hangly product page
> **"Forty-nine charms — protection charms, luck charms, Tamil spiritual symbols, Marvel, DC and
> BTS, plus eleven seasonal charms that arrive on their own. Free, with any image of your own as
> a charm."**

Accurate to the app's nine categories. **The collections section must stop displaying the seven
that do not ship.**

### Comparison pages
> **"Hangly ships 49 charms across nine categories, free. [Competitor] publishes [n]."**

The competitive position survives intact: 49 still beats DangleJoy's 30+, Book My Luck's 22 and
Lucky Dangle's 12. **The overlap argument is unaffected** — all eleven charms Lucky Dangle sells
are real Hangly charms in the app.

### FAQ
> **Q: How many charms does Hangly have?**
> **A: Forty-nine. Eleven of them are seasonal and arrive on their own at Halloween, Diwali,
> Christmas and New Year, and every charm can also be chosen by hand at any time. You can add any
> image of your own as a charm as well.**

### Schema (`SoftwareApplication.description`)
> **"A free desktop app for macOS and Windows that hangs a decorative charm from the top of your
> screen on a cord with real pendulum physics. Forty-nine charms across nine categories, plus any
> image of your own."**

### Statistics page
State all of it, since that page exists to be checkable:

| Figure | Value |
| --- | --- |
| Charms in the app | 49 |
| Categories | 9 |
| Seasonal charms | 11, in 4 packs |
| Collections | 4 (Marvel, DC, Tamil Spiritual, BTS) |
| Drawn as vectors | 44 |
| Drawn procedurally | 5 |
| Custom charms | any image |

### What must not be said
- Any number above 49
- That Breaking Bad, Stranger Things, Friends, Football, Singers or Dream Catcher charms exist
- That Flash is a DC charm — the app ships Shazam Lightning
- A fixed Diwali date as a product fact — the window is user-editable and drifts
- That seasonal charms are only available in season — all 49 are always selectable

## Success criteria — answered

| Question | Answer |
| --- | --- |
| **Exactly how many charms ship** | **49** |
| **Exactly how many users can access** | **49** — no unlocks, no gating |
| **Exactly how many are seasonal** | **11**, in 4 packs |
| **Exactly how many are visible on the website** | **55 listed, of which 24 are real**; 75 artwork files, 44 real |
| **Which number is safe to market** | **49**, once the 31 phantom charms are removed from the site |

## Recommended order

1. **Decide what happens to the 31.** Product decision; everything waits on it.
2. **Correct the live pages.** Twenty pages state 75. This is factual accuracy on a shipping site
   and it outranks every other item in this project's backlog.
3. **Regenerate the registry from `CharmLibrary.json`.** ~1.25 days — see
   `charm-source-of-truth-plan.md`. The 20 "missing" display names are not missing; they are in
   the app.
4. **Then build `/charms`**, from a registry that describes the product.

`/charms` was the highest-priority authority asset. It should not be built until step 1 is
answered — a catalogue page listing charms that do not exist would take the most visible accuracy
problem on the site and give it its own URL.
