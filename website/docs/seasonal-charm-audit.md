# Seasonal charm audit

_2026-09-26. From `SeasonalPack.swift`, `SeasonalSettings.swift` and `SeasonalCoordinator.swift`._

## The eleven seasonal charms

Four packs, exactly as the release notes describe them.

| Pack | Charms | Window |
| --- | --- | --- |
| **Halloween** | `bat`, `ghost`, `pumpkin` | 1 – 31 October |
| **Diwali** | `lotus`, `lantern`, `diya` | **Not fixed** — defaults to 5 – 11 November, editable |
| **Christmas** | `snowflake`, `candyCane`, `bell` | 1 – 26 December |
| **New Year** | `firework`, `luckyCoin` | 27 December – 6 January |

3 + 3 + 3 + 2 = **11**, matching both the appcast and the app's own release notes.

Charms hang smallest-first, *"the one the season is about on the end."*

### Why Diwali is different

From the source:

> *Diwali is not here: it moves with the lunar calendar, a month either side of where it fell
> last year, so no fixed window could be right two years running. It is carried in settings
> instead, where it can be corrected.*

The default window is 5–11 November, described as *"somewhere near right for the years just
ahead, and wrong eventually — which is why it can be edited."*

This is worth noting for any page about the Diwali charms: **the date is user-editable and the
default will drift.** A page should not state a fixed Diwali window as a product fact.

### Christmas and New Year do not overlap

Christmas ends on Boxing Day and New Year begins the next morning, deliberately: *"a day claimed
twice would be a day where which charm you got depended on the order of an enum."*

## Which are lucky charms

The app's own categories, from `CharmLibrary.json`:

| Category | Charms |
| --- | --- |
| **Luck & Fortune** | `panchangJie`, `daruma`, `manekiNeko`, `horseshoe` |
| **Protection** | `nazar`, `hamsa`, `nimbuMirchi`, `drishtiBommai`, `scarab` |
| **Ritual & Home** | `ghanta`, `himmeli` |
| **Seasonal** | the eleven above |
| **Classic** | `circle`, `star`, `heart`, `diamond`, `camera` |

## Which belong to both

**None.** The app's categories are mutually exclusive — each charm carries exactly one `category`
in `CharmLibrary.json`. No charm is both seasonal and lucky.

Two assumptions from earlier planning are wrong and should be corrected:

- **`luckyCoin` is categorised `seasonal`, not luck.** It belongs to the New Year pack.
- **`lotus` is categorised `seasonal`, not cultural.** It belongs to the Diwali pack.

Earlier documents in this project grouped both as luck or cultural charms on the basis of their
names. The app disagrees, and the app is the product.

## Which appear automatically

All eleven, when their pack's window arrives — but the behaviour is narrower and more considerate
than "seasonal charms appear":

1. **The pack dresses the rope** on the first day of its window.
2. **What was there is stored first**, and restored when the season ends. It survives a reboot,
   because it is written to settings rather than held in memory.
3. **It yields to the user.** Pick something else during a season and the rope stops being
   "dressed as" that pack — nothing is put back over that choice later, and nothing is taken away
   again that year.
4. **It can be switched off** (`isAutomatic`) or **pinned** to a chosen pack regardless of date.
5. It checks hourly.

The source is explicit about why: *"Changing what somebody chose is a liberty; changing it back
on the first of November is the thing that turns it into a decoration rather than a nuisance."*

## Which require user selection

**All 49 charms are selectable by hand at any time, including the eleven seasonal ones.** There is
no date restriction on availability. The seasonal system changes what is *on the rope by default*;
it does not change what is *in the picker*.

This distinction matters for any page about seasonal charms: it would be wrong to write "the
Halloween charms appear in October", because they are available in March. What appears in October
is the Halloween pack *on the rope*, automatically, unless the user has said otherwise.

## Summary

| Question | Answer |
| --- | --- |
| Seasonal charms | **11**, in 4 packs |
| Lucky charms (app category) | **4** |
| Protection charms | **5** |
| Both seasonal and lucky | **0** — categories are exclusive |
| Appear automatically | 11, by date, restoring afterwards |
| Require user selection | 0 — all 49 are always selectable |
| Fixed windows | Halloween, Christmas, New Year |
| User-editable window | Diwali, default 5–11 November |
