/**
 * A grid of charms, flat or grouped by category. Server-rendered throughout —
 * every charm is in the HTML before any JavaScript runs, which is the whole
 * point of these pages.
 */

import { groupByCategory, type Charm } from "@/lib/charms";
import { CharmCard } from "./CharmCard";

export function CharmGrid({ charms }: { charms: Charm[] }) {
  return (
    <div className="charm-grid">
      {charms.map((c) => <CharmCard key={c.id} charm={c} />)}
    </div>
  );
}

export function GroupedCharmGrid({ charms }: { charms: Charm[] }) {
  return (
    <>
      {groupByCategory(charms).map((group) => (
        <section key={group.key} aria-labelledby={`cat-${group.key}`} data-category={group.key}>
          <h3 id={`cat-${group.key}`} className="charm-group-heading">
            {group.label} <span>{group.charms.length}</span>
          </h3>
          <CharmGrid charms={group.charms} />
        </section>
      ))}
    </>
  );
}
