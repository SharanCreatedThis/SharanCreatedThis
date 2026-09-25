# 4 — Citation-worthy assets

_Things Hangly can publish that competitors cannot easily copy, ranked by authority value._

The test applied to each: **could a competitor reproduce this in a weekend?** If yes, it is a
feature, not an asset. Everything below either requires data they do not have, work they have not
done, or a position they cannot honestly take.

---

## 1. The charm database — `/charms`

**Why it cannot be copied:** 75 charms with complete artwork in two renderings each. The next
largest library in the category is DangleJoy at 30+. Copying this means drawing 150 SVGs.

**What makes it citable:** a filterable, permanent, structured record of every charm — name,
collection, origin, cultural meaning where one exists. `ItemList` schema. The kind of page that
gets linked as "the list of desktop charms" rather than as an app download.

**Effort:** Medium. The data exists and is already generated.
**Value: highest on this list.**

---

## 2. The cultural charm reference — `/charms/lucky` and its charm pages

**Why it cannot be copied:** competitors sell these charms; none explains them. Lucky Dangle
charges $7.77 for eleven cultural charms and its site is a storefront. Writing 600 honest words
on the nazar boncuğu, the drishti bommai, the daruma and the maneki-neko is research work, not
design work.

**What makes it citable:** it stops being about an app. A well-written page on what a drishti
bommai is and why it is hung outside South Indian homes earns links from people who will never
install anything — and that is what a link from outside the category looks like.

**Effort:** High. This is real writing.
**Value: highest long-term.**

---

## 3. Hangly statistics — `/products/hangly/stats` *(shipped)*

**Why it cannot be copied:** every figure is counted from source at build time, with a generation
date on the page and a `Dataset` schema. A competitor can publish numbers; they cannot easily
publish numbers that are provably derived.

**What to add:** per-collection artwork weight, the 89 MB → 33 MB reduction with method, charm
count over time.
**Effort:** Low — it exists. **Value: high.**

---

## 4. The release archive — `/changelog` *(shipped)*

**Why it cannot be copied:** generated from the same Sparkle feed the updater reads, so the page
and the update cannot disagree. Most competitors publish no changelog at all.

**What to add:** a stable permalink per release, and a `.json` or RSS feed of the release history.
**Effort:** Low. **Value: medium — it is a trust asset more than a traffic one.**

---

## 5. The visual archive — a charm artwork gallery

**Why it cannot be copied:** 150 original SVGs. The artwork is the product.

**What makes it citable:** design and illustration audiences link to artwork. A page showing the
charms as artwork — at size, with the connected rendering beside the plain one, and a note on why
the thread has to be drawn per charm — is interesting to people who do not want a desktop charm.

**Effort:** Low. The assets exist.
**Value: high, and the most likely single asset to earn a design-community link.**

---

## 6. The design process write-up — how a charm is made

**Why it cannot be copied:** it is your process. Nobody else can write it.

**What makes it citable:** the connected-rendering problem is genuinely interesting — the thread
ends at each charm's own loop, so it cannot be derived and must be drawn per charm, which is why
six collections shipped before their connected art did. That is a real constraint with a real
engineering consequence, and it is the sort of post that reaches Hacker News.

**Effort:** Medium. **Value: high.**

---

## 7. The category price index

**Why it cannot be copied:** a competitor cannot credibly publish a table showing they are the
expensive option.

**What makes it citable:** ten apps, what each charges, how many charms each ships, updated with
dates. Hangly free with 75; DangleJoy $4.99 with 30+; Book My Luck ₹99 with 22; Lucky Dangle
$7.77 with 12; Screen Charms $4.99 Pro from a one-charm free tier. Maintained honestly, this
becomes the reference anyone writing about the category cites.

**Effort:** Low to build, ongoing to maintain.
**Value: high — and the maintenance is the moat.**

---

## 8. The Windows-on-ARM engineering note

**Why it cannot be copied:** almost nothing in this category ships a native ARM64 build, because
the detection trap is invisible until you hit it — a Windows-on-ARM machine reports `Win64; x64`
because the browser runs under emulation, so naive detection sends every ARM laptop the wrong
file, silently, forever.

**What makes it citable:** this is a genuine engineering finding with a reproducible cause and a
concrete fix. It has an audience well beyond desktop charms.

**Effort:** Low — the reasoning is already on `/download/windows`. It needs pulling out.
**Value: medium-high, and the audience is developers, who link.**

---

## 9. A charm rarity or collection system — **product change, not content**

**Why it cannot be copied quickly:** it changes the app, not the site.

**Honest assessment:** Hangly has no rarity, unlock or collection mechanic today. It could —
seasonal charms that appear on their date already behave a little like this. But recommending a
"rarity system" as a content asset when the product has none would be inventing a feature to
justify a page. **Listed for the roadmap, not for the sprint.**

**Effort:** High, and it is app work. **Value: unproven.**

---

## 10. The seasonal charm calendar

**Why it cannot be copied:** it requires shipping seasonal charms, which you do and they mostly
do not.

**What makes it citable:** a page stating which charms appear when — Diwali, Halloween, winter —
is useful, dated, and gives a reason to return. Recurring dated content earns links every cycle
rather than once.

**Effort:** Low. **Value: medium, compounding.**

---

## Ranking

| Rank | Asset | Effort | Value | Status |
| --- | --- | --- | --- | --- |
| 1 | Charm database `/charms` | M | Highest | Not built |
| 2 | Cultural charm reference | H | Highest | Not built |
| 3 | Visual archive | L | High | Not built |
| 4 | Category price index | L + upkeep | High | Not built |
| 5 | Design process write-up | M | High | Not built |
| 6 | Statistics page | L | High | **Shipped** |
| 7 | Windows-on-ARM note | L | Med-high | Partly on `/download/windows` |
| 8 | Release archive | L | Medium | **Shipped** |
| 9 | Seasonal calendar | L | Medium | Not built |
| 10 | Rarity system | H | Unproven | Product change |

**Start with 3 and 4.** Both are low effort, both are genuinely hard to copy, and neither needs
new writing — the artwork and the competitor data already exist. Then 1, then 2.
