"use client";

/**
 * The changelog list, with search and filtering.
 *
 * This is a client component, which for a static export still means every
 * release is present in the prerendered HTML: the first render happens at
 * build time with no filter applied, so a crawler and an answer engine get the
 * complete list. Filtering only ever removes things from a page that already
 * shipped whole. Doing it the other way round — fetching entries on mount —
 * would hide the entire changelog from anything that does not run JavaScript,
 * which is most of what this page is written for.
 *
 * The data still comes from the Sparkle feeds via the build step. Nothing here
 * knows how to invent a release.
 */

import { useMemo, useState } from "react";
import { Link2, Search } from "lucide-react";
import type { Release } from "@/data/changelog.generated";

/** A stable, readable anchor: #hangly-2-0-0-macos. */
export function anchorFor(r: Release) {
  return `${r.product}-${r.version.replace(/\./g, "-")}-${r.platform.toLowerCase()}`;
}

const readable = (iso: string) =>
  iso
    ? new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
        day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
      })
    : "";

export function ChangelogList({ releases }: { releases: Release[] }) {
  const [query, setQuery] = useState("");
  const [product, setProduct] = useState<"all" | "hangly" | "vision">("all");

  const products = useMemo(
    () => [...new Set(releases.map((r) => r.product))] as ("hangly" | "vision")[],
    [releases],
  );

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return releases.filter((r) => {
      if (product !== "all" && r.product !== product) return false;
      if (!q) return true;
      const haystack = [r.name, r.version, r.platform, r.date, ...r.notes.map((n) => n.text)]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [releases, query, product]);

  const counts = useMemo(() => {
    const byProduct: Record<string, number> = { all: releases.length };
    for (const r of releases) byProduct[r.product] = (byProduct[r.product] ?? 0) + 1;
    return byProduct;
  }, [releases]);

  return (
    <>
      <div className="changelog-controls">
        <div className="changelog-search">
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search releases and notes"
            aria-label="Search releases and release notes"
          />
        </div>
        <div className="changelog-filters" role="group" aria-label="Filter by product">
          {(["all", ...products] as const).map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={product === p}
              className={product === p ? "is-active" : undefined}
              onClick={() => setProduct(p)}
            >
              {p === "all" ? "All" : p === "hangly" ? "Hangly" : "Vision"}
              <span>{counts[p] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="changelog-count" aria-live="polite">
        Showing {shown.length} of {releases.length} releases
        {product !== "all" ? ` for ${product === "hangly" ? "Hangly" : "Vision"}` : ""}
        {query.trim() ? ` matching “${query.trim()}”` : ""}.
      </p>

      <div className="changelog">
        {shown.map((r) => {
          const id = anchorFor(r);
          return (
            <article key={id} id={id} className="changelog-entry" data-product={r.product}>
              <h3>
                <a href={`#${id}`} className="changelog-anchor" aria-label={`Link to ${r.name} ${r.version} for ${r.platform}`}>
                  <Link2 size={14} aria-hidden="true" />
                </a>
                {r.name} {r.version} <span className="changelog-platform">{r.platform}</span>
              </h3>
              <p className="changelog-meta">
                {r.date ? readable(r.date) : "Date not published in the feed"}
                {r.minimumSystem ? ` · needs ${r.platform} ${r.minimumSystem}` : ""}
                {r.bytes ? ` · ${Math.round(r.bytes / 1_000_000)} MB` : ""}
              </p>
              {r.notes.filter((n) => n.kind === "para").map((n) => <p key={n.text}>{n.text}</p>)}
              {r.notes.some((n) => n.kind === "point") && (
                <ul className="guide-list">
                  {r.notes.filter((n) => n.kind === "point").map((n) => <li key={n.text}>{n.text}</li>)}
                </ul>
              )}
              {!r.notes.length && r.notesUrl && (
                <p>
                  The notes for this release live with the release itself:{" "}
                  <a href={r.notesUrl} rel="noopener noreferrer" target="_blank">read them</a>.
                </p>
              )}
              {!r.notes.length && !r.notesUrl && <p>No notes were published with this release.</p>}
            </article>
          );
        })}
        {!shown.length && (
          <p className="changelog-empty">
            No releases match that. Clear the search or choose a different product.
          </p>
        )}
      </div>
    </>
  );
}
