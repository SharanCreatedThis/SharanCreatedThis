"use client";

/**
 * Filtering over a server-rendered list.
 *
 * The charms are already in the DOM; this narrows what is shown. Fetching or
 * building the list client-side would hide it from anything that does not run
 * JavaScript, which is most of what these pages are written for.
 *
 * State is held here and applied by the parent, so the same control can drive
 * the index, a collection page or the archive.
 */

import { useMemo, useState } from "react";
import type { CharmSearchEntry } from "@/lib/charms";

export type CharmFilterState = { query: string; collection: string | null };

export function useCharmFilter(index: CharmSearchEntry[]) {
  const [state, setState] = useState<CharmFilterState>({ query: "", collection: null });

  const matching = useMemo(() => {
    const needle = state.query.trim().toLowerCase();
    if (!needle) return null; // null means "no text filter", distinct from "no matches"
    return new Set(index.filter((e) => e.haystack.includes(needle)).map((e) => e.id));
  }, [index, state.query]);

  return { state, setState, matching };
}

export function CharmFilterBar({
  collections,
  state,
  onChange,
  shown,
  total,
}: {
  collections: string[];
  state: CharmFilterState;
  onChange: (next: CharmFilterState) => void;
  shown: number;
  total: number;
}) {
  return (
    <div className="charm-filters">
      <input
        type="search"
        className="charm-search"
        value={state.query}
        onChange={(e) => onChange({ ...state, query: e.target.value })}
        placeholder="Search charms"
        aria-label="Search charms by name, collection or meaning"
      />
      <div className="charm-filter-chips" role="group" aria-label="Filter by collection">
        <button
          type="button"
          aria-pressed={state.collection === null}
          onClick={() => onChange({ ...state, collection: null })}
        >
          All
        </button>
        {collections.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={state.collection === c}
            onClick={() => onChange({ ...state, collection: c })}
          >
            {c}
          </button>
        ))}
      </div>
      <p className="charm-filter-count" aria-live="polite">
        Showing {shown} of {total} charms
      </p>
    </div>
  );
}
