"use client";

/**
 * Filtering over a list that is already in the HTML.
 *
 * The grid is server-rendered; this narrows what is shown by hiding cards. It
 * never fetches and it never touches the URL — a facet combination is a view,
 * not a page, and query-string URLs would generate hundreds of near-duplicate
 * indexable pages out of one catalogue.
 *
 * With JavaScript off, the filter bar is absent and all 81 charms are visible,
 * which is the correct degradation for a page whose job is to list them.
 */

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { CharmSearchEntry } from "@/lib/charms";

export function CharmFilters({
  index,
  categories,
  regions,
  total,
}: {
  index: CharmSearchEntry[];
  categories: { id: string; name: string }[];
  regions: string[];
  total: number;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [region, setRegion] = useState<string | null>(null);

  const matching = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return null;
    return new Set(index.filter((e) => e.haystack.includes(needle)).map((e) => e.id));
  }, [index, query]);

  /* Cards and category sections carry data attributes; hiding is done with a
     style rule rather than by unmounting, so nothing leaves the DOM. */
  const css = useMemo(() => {
    const rules: string[] = [];
    if (matching) {
      rules.push(`.charm-card{display:none}`);
      rules.push([...matching].map((id) => `#charm-${CSS.escape(id)}`).join(",") + `{display:flex}`);
    }
    if (category) rules.push(`[data-category]:not([data-category="${category}"]){display:none}`);
    if (region) {
      rules.push(`.charm-card{display:none}`);
      rules.push(`.charm-card[data-region="${CSS.escape(region)}"]{display:flex}`);
    }
    return rules.join("");
  }, [matching, category, region]);

  const shown = matching ? matching.size : total;

  return (
    <div className="charm-filters">
      {css && <style>{css}</style>}
      <div className="charm-search">
        <Search size={16} aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search charms, regions, meanings"
          aria-label="Search charms by name, region, meaning or tag"
        />
      </div>

      <div className="charm-chips" role="group" aria-label="Filter by category">
        <button type="button" aria-pressed={category === null} onClick={() => setCategory(null)}>All</button>
        {categories.map((c) => (
          <button key={c.id} type="button" aria-pressed={category === c.id} onClick={() => setCategory(c.id)}>
            {c.name}
          </button>
        ))}
      </div>

      <label className="charm-region-select">
        <span className="sr-only">Filter by region</span>
        <select value={region ?? ""} onChange={(e) => setRegion(e.target.value || null)}>
          <option value="">Every region</option>
          {regions.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </label>

      <p className="charm-filter-count" aria-live="polite">
        {query.trim() ? `${shown} of ${total} charms match` : `${total} charms`}
      </p>
    </div>
  );
}
