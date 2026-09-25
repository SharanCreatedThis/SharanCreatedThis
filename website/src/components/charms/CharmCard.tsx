/**
 * One charm. Server-rendered.
 *
 * An unnamed charm renders with its id and a visible marker rather than being
 * hidden. Twenty charms were invisible for months precisely because absence
 * was silent; a gap that shows up on screen gets fixed.
 */

import type { Charm } from "@/lib/charms";

export function CharmCard({ charm, showMeta = false }: { charm: Charm; showMeta?: boolean }) {
  const named = Boolean(charm.displayName);
  return (
    <figure className="charm-card" data-licensed={charm.licensed || undefined} data-unnamed={!named || undefined}>
      <img
        src={charm.artworkPath}
        alt={named ? `${charm.displayName} charm` : `Charm artwork: ${charm.id}`}
        loading="lazy"
        decoding="async"
        width={120}
        height={160}
      />
      <figcaption>
        <strong>{charm.displayName ?? charm.id}</strong>
        {!named && <em className="charm-card-gap">needs a name</em>}
        {showMeta && charm.collection && <span>{charm.collection}</span>}
        {charm.meaning && <p>{charm.meaning}</p>}
      </figcaption>
    </figure>
  );
}
