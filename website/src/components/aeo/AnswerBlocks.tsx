/**
 * The blocks an answer engine lifts.
 *
 * Each is a heading immediately followed by a self-contained answer. That
 * shape is the whole point: a model summarising a page takes a stated answer
 * far more readily than it condenses argument spread across paragraphs, and a
 * person skimming for one fact wants the same thing. The two goals agree here,
 * which is why none of this is hidden or duplicated for machines.
 *
 * Every block renders visible text. Nothing here exists only in schema.
 */

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/** 40-80 words, above everything else. The answer, before the argument. */
export function QuickAnswer({ children }: { children: React.ReactNode }) {
  return (
    <section className="aeo-quick" aria-labelledby="quick-answer">
      <h2 id="quick-answer">Quick answer</h2>
      <p>{children}</p>
    </section>
  );
}

export function KeyTakeaways({ points }: { points: string[] }) {
  if (!points.length) return null;
  return (
    <section className="aeo-takeaways" aria-labelledby="key-takeaways">
      <h2 id="key-takeaways">Key takeaways</h2>
      <ul>{points.map((p) => <li key={p}>{p}</li>)}</ul>
    </section>
  );
}

/** One paragraph, at the end, for someone who scrolled past everything. */
export function InShort({ children }: { children: React.ReactNode }) {
  return (
    <section className="aeo-inshort" aria-labelledby="in-short">
      <h2 id="in-short">In short</h2>
      <p>{children}</p>
    </section>
  );
}

export function BestFor({ cases }: { cases: { who: string; why: string }[] }) {
  if (!cases.length) return null;
  return (
    <section className="aeo-bestfor" aria-labelledby="best-for">
      <h2 id="best-for">Best for</h2>
      <dl>
        {cases.map((c) => (
          <div key={c.who}>
            <dt>{c.who}</dt>
            <dd>{c.why}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function Alternatives({ items }: { items: { label: string; href: string; note: string }[] }) {
  if (!items.length) return null;
  return (
    <section className="aeo-alternatives" aria-labelledby="alternatives">
      <h2 id="alternatives">Alternatives</h2>
      <ul>
        {items.map((a) => (
          <li key={a.href}>
            {a.href.startsWith("/")
              ? <Link href={a.href}>{a.label} <ArrowUpRight size={13} /></Link>
              : <a href={a.href} rel="nofollow noopener noreferrer" target="_blank">{a.label} <ArrowUpRight size={13} /></a>}
            <span>{a.note}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
