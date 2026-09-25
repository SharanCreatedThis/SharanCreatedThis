# Charm link asset analysis

_2026-09-26. Ranked by backlink potential against effort and uniqueness._

Baseline: the domain currently has **no inbound links from anywhere**. Every asset below is
judged on whether it gives someone outside this category a reason to link.

## The assets

### 1. Visual archive — the artwork as artwork

**What:** 150 original SVGs, 75 charms in plain and connected renderings, shown at size.

**Uniqueness: very high.** Copying it means drawing 150 vector illustrations. The largest
published competitor catalogue is 30+ charms, and no competitor publishes their artwork as
artwork.

**Link potential: high.** Design and illustration audiences link to vector sets. This reaches
people who will never install a desktop charm, which is the definition of a link from outside the
category.

**Effort: low.** The assets exist. The page is layout and captions.

**Blocked on:** the artwork licence decision, and it should not ship before it. Adding a licence
later is easy; withdrawing one is not.

---

### 2. The connected-artwork engineering note

**What:** why the thread rendering cannot be derived from the plain drawing. The thread ends at
each charm's own loop — a nazar hangs from a hole near its rim, a temple bell from a crown — so
it is drawn per charm, 75 times. Six collections shipped before their connected art did, thirty
charms rendered as broken images on the most-visited page, and the fix was a build-time manifest
that resolves to the best available artwork and fails the build outright when none exists.

**Uniqueness: very high.** This is a constraint you can only write about having hit it.

**Link potential: high, high variance.** Hacker News and engineering blogs. One good posting is
worth more than fifty directory listings.

**Effort: low.** The reasoning is already written in `generate-charm-manifest.mjs` comments.

---

### 3. Cultural symbolism reference — the twelve luck charms

**What:** what the nazar boncuğu, drishti bommai, hamsa, nimbu-mirchi, daruma, maneki-neko,
scarab, horseshoe, himmeli, páncháng jié, ghanta and lucky coin actually are. Origin, meaning,
regional variation, common misconceptions.

**Uniqueness: high.** Competitors sell these charms; none explains them. Lucky Dangle charges
$7.77 and its site is a storefront.

**Link potential: highest on this list, and slowest.** Cultural and educational sites link to
good reference material, and those links carry more weight than anything in the software
category because they come from outside it.

**Effort: high.** This is real research and real writing, with sources. Twelve charms at 600–900
words each is a fortnight, not an afternoon.

**Caveat:** it only earns links if written for the reader interested in the symbol, not as a
download funnel. A page that pivots to a CTA in paragraph three earns nothing.

---

### 4. Tamil Divine reference

**What:** vel, vinayagar, om, karuppu, temple bell.

**Uniqueness: absolute.** Verified across nine competitors — nobody else ships Tamil devotional
charms.

**Link potential: high within a specific audience**, low in general software. Tamil cultural
sites, Indian design communities, diaspora publications.

**Effort: high**, and it needs care. See `charm-ia-final.md`: these are devotional symbols and
the page has to decide what it is before it can be written.

---

### 5. The category price index

**What:** nine apps, what each charges, how many charms each publishes, with dates.

**Uniqueness: high** — a competitor cannot credibly publish a table showing they are the
expensive option.

**Link potential: medium-high, compounding.** Maintained honestly, it becomes the thing anyone
writing about this category cites. The maintenance is the moat.

**Effort: low to build, ongoing to maintain.** The data is already gathered.

---

### 6. Animation and physics documentation

**What:** the damped pendulum — how the charm swings, why it settles, why settling matters for
battery, why click-through and focus behaviour is structural rather than a setting.

**Uniqueness: medium-high.** Several competitors mention physics; Desk Dangle names Verlet
integration. Nobody documents the behaviour properly.

**Link potential: medium.** Front-end and animation audiences.

**Effort: medium.** Needs the actual implementation details, which live in the app repository.

---

### 7. Charm history research — individual deep pages

**What:** `/charms/nazar` and similar, at 600–900 words each.

**Uniqueness: high per page.**

**Link potential: high but diffuse.** Each page earns few links; ten pages compound.

**Effort: high.** Subsumed by asset 3 — build the reference first, split into pages if it earns
attention.

---

### 8. The charm database itself — `/charms`

**What:** the enumerated catalogue.

**Uniqueness: high.** Nothing in the category publishes a full catalogue.

**Link potential: medium.** It earns *citations* more than links — the page an answer engine
quotes when asked what charms Hangly has. That is worth having and is not the same as a backlink.

**Effort: medium.** Blocked on the 20 display names.

---

## Ranking

| Rank | Asset | Effort | Uniqueness | Link potential | Blocked on |
| --- | --- | --- | --- | --- | --- |
| 1 | Visual archive | Low | Very high | High | Licence decision |
| 2 | Connected-artwork engineering note | Low | Very high | High, variable | — |
| 3 | Category price index | Low | High | Med-high | — |
| 4 | Cultural symbolism reference | High | High | **Highest** | Research |
| 5 | `/charms` database | Medium | High | Medium (citations) | 20 names |
| 6 | Tamil Divine reference | High | Absolute | High, niche | A judgement call |
| 7 | Physics documentation | Medium | Med-high | Medium | App details |
| 8 | Individual charm pages | High | High | Diffuse | Subsumed by 4 |

## Recommended order

**1, 2 and 3 first.** All low effort, all genuinely hard to copy, none requiring new research —
the artwork exists, the engineering story is written in code comments, and the competitor data is
gathered. Together they are perhaps three days and they produce the first three things this
domain has ever had that someone might link to.

**Then 5**, because it makes every existing claim verifiable.

**Then 4**, which is the highest-value and slowest, and should only start once something is
earning attention. A fortnight of cultural research on a domain with no links is the right work
at the wrong time.

## What not to build

- **A charm generator or "design your own charm" tool.** Link-bait tools age badly and this one
  would compete with the actual product feature.
- **A rarity or collection system** presented as content. The product has no such mechanic; a
  page describing one would be describing something that does not exist.
- **Infographics about luck across cultures.** Generic, already abundant, and not ours.
