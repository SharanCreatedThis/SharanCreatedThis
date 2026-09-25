/**
 * Long-form sections for the hub pages.
 *
 * /contact, /products and /portfolio each rendered under 250 words of visible
 * text, which the validator flagged as thin and which is a real problem rather
 * than a pedantic one: these are the three pages most likely to be a person's
 * first contact with the site, and they said almost nothing a search engine or
 * an answer engine could repeat.
 *
 * Everything here is server-rendered plain text. No animation, no client
 * JavaScript — an answer engine reading the page gets the same thing a person
 * does, which is the whole requirement.
 */

import Link from "next/link";

export function Prose({ id, heading, children }: { id: string; heading: string; children: React.ReactNode }) {
  return (
    <section className="hub-prose" aria-labelledby={id}>
      <h2 id={id}>{heading}</h2>
      {children}
    </section>
  );
}

export function ProseFaq({ id, heading = "Common questions", faqs }: { id: string; heading?: string; faqs: { q: string; a: string }[] }) {
  return (
    <section className="hub-prose hub-faq" aria-labelledby={id}>
      <h2 id={id}>{heading}</h2>
      <div>
        {faqs.map((f) => (
          <div key={f.q}>
            <h3>{f.q}</h3>
            <p>{f.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/** A comparison table. The first cell of each row is its header. */
export function ProseTable({ caption, columns, rows }: { caption: string; columns: string[]; rows: string[][] }) {
  return (
    <div className="hub-table-wrap">
      <table className="hub-table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>{columns.map((c) => <th key={c} scope="col">{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]}>
              <th scope="row">{row[0]}</th>
              {row.slice(1).map((cell, i) => <td key={columns[i + 1]}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** A labelled list of onward links, so a section ends somewhere. */
export function ProseLinks({ links }: { links: { label: string; href: string; note?: string }[] }) {
  return (
    <ul className="hub-prose-links">
      {links.map((l) => (
        <li key={l.href}>
          {l.href.startsWith("/")
            ? <Link href={l.href}>{l.label}</Link>
            : <a href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a>}
          {l.note ? <span>{l.note}</span> : null}
        </li>
      ))}
    </ul>
  );
}
