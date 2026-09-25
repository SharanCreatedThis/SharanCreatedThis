# Authority sprint — phase 1 plans

_2026-09-25. Implementation plans only. No code, no pages, nothing deployed._

| Document | Covers |
| --- | --- |
| [3 — Visibility audit](3-visibility-audit.md) | Why only 56 of 75 charms are surfaced |
| [1 — `/charms` IA](1-charms-ia.md) | Page structure, canonical URLs, taxonomy, what earns a page |
| [2 — Source of truth](2-source-of-truth.md) | Registry, categories, seasonal flags, visibility status |
| [4 — Lucky Dangle strategy](4-lucky-dangle-strategy.md) | Verified overlap and rewrite plan |
| [5 — Visual archive](5-visual-archive.md) | IA, structure, content requirements |

The visibility audit is listed first because the other four depend on it.

## The blocker

**Twenty charms have no display name anywhere in the codebase** — only a camelCase filename.
There is no `Maneki-neko` string in the repository, only `manekiNeko.svg`.

They cannot be surfaced by changing code. Someone has to author twenty display names and twenty
honest one-line meanings, with sources. That is roughly half a day, and **every page in phase 1
is blocked on it.**

## Two open questions only you can answer

1. **Which of the 20 does the app actually show?** The 2.0 notes say "eleven seasonal charms that
   arrive on their own" — eleven, not twenty. `/charms` will state what a user gets, so this has
   to be right.
2. **What licence, if any, applies to the charm artwork?** It gates the visual archive, and it is
   easier to add a licence than to withdraw one.

## What phase 1 produces, if executed

18 indexable pages, built in six steps, stopping to measure after step 2. Not 75 charm pages —
ten, and only where 600 honest words exist behind them.
