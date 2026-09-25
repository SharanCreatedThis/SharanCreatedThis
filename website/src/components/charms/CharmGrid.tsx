/**
 * A grid of charms, grouped or flat. Server-rendered throughout — the whole
 * list is in the HTML before any JavaScript runs, so a crawler and an answer
 * engine see every charm.
 */

import { groupByCollection, type Charm } from "@/lib/charms";
import { CharmCard } from "./CharmCard";

export function CharmGrid({ charms, showMeta = false }: { charms: Charm[]; showMeta?: boolean }) {
  return (
    <div className="charm-grid">
      {charms.map((c) => <CharmCard key={c.id} charm={c} showMeta={showMeta} />)}
    </div>
  );
}

export function GroupedCharmGrid({ charms }: { charms: Charm[] }) {
  return (
    <>
      {groupByCollection(charms).map((group) => (
        <section key={group.key} aria-labelledby={`charms-${group.key}`}>
          <h2 id={`charms-${group.key}`}>
            {group.label} <span className="charm-group-count">{group.charms.length}</span>
          </h2>
          <CharmGrid charms={group.charms} />
        </section>
      ))}
    </>
  );
}
