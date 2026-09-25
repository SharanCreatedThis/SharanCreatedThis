# 3 — Charm authority system

_The information architecture for 75 charms. Written before the content gap list because it
constrains it: several obvious pages turn out to be unsafe to build._

## The constraint nobody has raised yet

**Eight of the eleven collections are licensed intellectual property.**

| Collection | Charms | Status |
| --- | --- | --- |
| Marvel | Spider-Man, Captain America Shield, Iron Man Helmet, Thor Hammer, Hulk Fist | **Disney/Marvel IP** |
| DC | Batman, Superman, Wonder Woman, Flash, Green Lantern | **Warner/DC IP** |
| BTS | Jin, Suga, J-Hope, RM, Jimin, V, Jung Kook | **HYBE IP / personality rights** |
| Football | Ronaldo, Messi, Neymar, Real Madrid, FC Barcelona | **Personality + club marks** |
| Stranger Things | Eleven, Mike, Dustin, Lucas, Will, Demogorgon | **Netflix IP** |
| Singers | Billie Eilish, XXXTENTACION, Michael Jackson, Taylor Swift, Juice WRLD | **Personality rights** |
| Breaking Bad | Walter White, Jesse Pinkman, Saul Goodman, Gus Fring, Mike, Heisenberg, The RV | **Sony/AMC IP** |
| Friends | Rachel, Monica, Ross, Joey, Chandler, Phoebe | **Warner IP** |
| Protection | Nazar / Evil Eye, Drishti Bommai, Hamsa | **Safe — cultural, public domain** |
| Tamil Divine | Vel, Vinayagar, Om, Karuppu, Temple Bell | **Safe — cultural, public domain** |
| Dream Catcher | Dream Catcher | **Safe — cultural** |

Plus the 20 seasonal and lucky charms, all culturally generic and safe except `shazamLightning`,
which is DC.

**This matters because SEO landing pages change the risk profile.** A charm inside an app is one
thing. A page at `/charms/marvel` optimised for "Marvel desktop charm", with schema declaring it,
a sitemap entry advertising it and a title tag naming the trademark, is a public, indexed,
commercial use of someone else's mark. That is the artefact a brand protection team finds, and it
is trivially found — it is designed to be found.

I am not a lawyer and this is not legal advice. But recommending eight branded landing pages
without naming this would be negligent, so: **do not build collection pages for the eight
licensed collections.** The upside is real traffic; the downside is a takedown affecting the app,
not just the page.

**Everything below therefore builds on the 28 charms that are culturally rooted and safe** — and
those happen to be both the most defensible and the most interesting, because they carry meaning
that can be written about honestly.

## What is actually buildable

```
/charms                                    index — all 75, filterable
│
├── /charms/lucky                          20 seasonal & lucky, currently unlisted anywhere
│   ├── /charms/lucky/nazar                the single highest-demand charm in the category
│   ├── /charms/lucky/maneki-neko
│   ├── /charms/lucky/daruma
│   ├── /charms/lucky/horseshoe
│   ├── /charms/lucky/scarab
│   └── /charms/lucky/himmeli
│
├── /charms/protection                     Nazar, Drishti Bommai, Hamsa
│   ├── /charms/protection/drishti-bommai  nothing else in the category has this
│   └── /charms/protection/hamsa
│
├── /charms/tamil-divine                   Vel, Vinayagar, Om, Karuppu, Temple Bell
│   ├── /charms/tamil-divine/vel
│   └── /charms/tamil-divine/vinayagar
│
├── /charms/seasonal                       hub for the dated set
│   ├── /charms/seasonal/diwali            diya, ghanta, lotus, nimbu-mirchi, firework
│   ├── /charms/seasonal/halloween         bat, ghost, pumpkin
│   └── /charms/seasonal/winter            snowflake, candy cane, bell, lantern
│
└── /charms/custom                         any image as a charm
```

**28 pages maximum, and only about 14 are worth building in the first pass.** Every one is
supported by a charm that ships, with real cultural meaning to write about.

### Why the individual charm pages are defensible and not filler

A page for `nazar` is not a charm on a grid with two sentences. It is: what the nazar boncuğu is,
where it comes from, why the eye, why blue glass, how it is used in Turkey and across South Asia,
how it differs from the drishti bommai and the hamsa — and, incidentally, that Hangly hangs one
on your screen for free while three competitors charge for it.

That page can be written with authority because the subject has a real history. The same is true
of maneki-neko, daruma, the scarab, the horseshoe, the vel, Vinayagar and the diya.

It is **not** true of "Spider-Man charm", which is why those pages are absent above for a second
reason beyond the legal one: there is nothing honest to say about a Spider-Man charm except that
it exists.

### The single highest-value page on this list

**`/charms/lucky`.** Twenty charms that ship today and appear nowhere on the site. Lucky Dangle
sells eleven of them for $7.77. Screen Charms puts four behind $4.99. Desk Dangle and Screen
Dangle both lead with the nazar.

We give away the largest set of cultural luck charms in the category and have never said so once.

## Page templates

**Collection page** (`/charms/lucky`, `/charms/protection`, `/charms/tamil-divine`)
- What this group of charms is and where the tradition comes from — 300–500 words of real content
- Every charm, with artwork, name, origin and one line of meaning
- What competitors charge for the equivalent, where verifiable
- Download CTA, links to the index and to sibling collections
- Schema: `CollectionPage` + `ItemList`, `BreadcrumbList`

**Individual charm page** (`/charms/lucky/nazar`)
- 600–900 words: origin, meaning, regional variation, common misconceptions
- The charm's artwork as it appears in Hangly
- How to use it in the app, in two lines
- Related charms, cross-linked within and across collections
- Schema: `Article` or `CreativeWork`, `BreadcrumbList`, `FAQPage` where there are real questions

**Do not build an individual page for a charm you cannot write 600 honest words about.** That
rule alone reduces 75 charms to roughly 12 worth writing, which is the correct number.

## Sequencing

| Phase | Pages | Why this order |
| --- | --- | --- |
| 1 | `/charms`, `/charms/lucky` | Fixes the 55-vs-75 listing gap and surfaces the competitive set |
| 2 | `/charms/protection`, `/charms/tamil-divine`, `/charms/custom` | The other safe collections plus the differentiator |
| 3 | `/charms/lucky/nazar`, `/maneki-neko`, `/daruma` | The three highest-demand individual charms |
| 4 | `/charms/seasonal` + `/diwali`, `/halloween` | Dated, recurring; build ahead of the season |
| 5 | `/charms/protection/drishti-bommai`, `/charms/tamil-divine/vel`, `/vinayagar` | Nothing else in the category serves these |

Stop after phase 2 and measure. If the collection pages earn impressions, continue. If they do
not, eleven more of them will not fix that.

## What the app should change

Two recommendations that are not website work:

1. **Group the 20 loose charms into a named collection in the app** — "Luck & Seasons" or
   similar. They then flow into `Collections.tsx`, the generated stats pick them up, and the
   published count and the installed count become the same number without any special-casing.
2. **Move `shazamLightning` into the DC collection**, where it belongs.
