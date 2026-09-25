/**
 * One charm: artwork, name, region, description.
 *
 * A charm with no artwork renders a labelled placeholder rather than a broken
 * image or nothing at all. Seven ship without a website file, and hiding them
 * would misrepresent the catalogue — the page says 81, so it shows 81.
 */

import { artworkPath, type Charm } from "@/lib/charms";

export function CharmCard({ charm, showCategory = false }: { charm: Charm; showCategory?: boolean }) {
  const art = artworkPath(charm.id);
  return (
    <figure className="charm-card" id={`charm-${charm.id}`} data-region={charm.region}>
      {art ? (
        <img src={art} alt={`${charm.name} charm`} loading="lazy" decoding="async" width={110} height={150} />
      ) : (
        <div className="charm-card-placeholder" role="img" aria-label={`${charm.name} — artwork not yet published`}>
          <span aria-hidden="true">{charm.name.slice(0, 1)}</span>
        </div>
      )}
      <figcaption>
        <strong>{charm.name}</strong>
        <span className="charm-card-region">{charm.region}</span>
        <p>{charm.description}</p>
        {showCategory && <span className="charm-card-cat">{charm.category}</span>}
      </figcaption>
    </figure>
  );
}
