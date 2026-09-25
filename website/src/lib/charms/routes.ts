/**
 * Which charm URLs exist, derived from the registry.
 *
 * The sitemap reads this. Two rules are enforced here rather than remembered:
 *
 * 1. **A licensed charm never gets a route.** Eight of the eleven collections
 *    are somebody else's intellectual property, and an indexed page carrying a
 *    trademark in its title and schema is a different artefact from a charm
 *    inside an app. No amount of authored copy unlocks one.
 * 2. **An unauthored charm never gets a route.** A page needs a name, a
 *    description, a meaning and a source before it is worth indexing. Today
 *    that means no individual charm pages at all, which is the correct and
 *    honest output of an empty registry.
 *
 * Group routes are listed separately and are enabled by hand, because a group
 * page needs written introduction copy that no amount of registry data
 * provides.
 */

import { CHARMS } from "./charm-registry";
import { pageEligible } from "./queries";

export type CharmRoute = {
  path: string;
  kind: "index" | "group" | "charm";
  /** False until the page actually exists and has content. */
  ready: boolean;
  /** Why it is not ready, for the readiness report. */
  blockedBy?: string[];
};

/**
 * Group pages the architecture calls for. `ready` stays false until the page
 * is built and its introduction is written — the registry cannot supply prose.
 */
const GROUP_ROUTES: { path: string; label: string }[] = [
  { path: "/charms/lucky", label: "Luck and protection charms" },
  { path: "/charms/protection", label: "Protection charms" },
  { path: "/charms/tamil-divine", label: "Tamil Divine charms" },
  { path: "/charms/seasonal", label: "Seasonal charms" },
  { path: "/charms/custom", label: "Custom charms from your own images" },
];

export function charmRoutes(): CharmRoute[] {
  const eligible = new Set(pageEligible().map((c) => c.id));

  const charmPages: CharmRoute[] = CHARMS.filter((c) => !c.licensed).map((c) => {
    const blockers: string[] = [];
    if (!c.displayName) blockers.push("displayName");
    if (!c.description) blockers.push("description");
    if (!c.meaning) blockers.push("meaning");
    if (!c.sourceUrls.length) blockers.push("sourceUrls");
    return {
      path: `/charms/${slug(c.displayName ?? c.id)}`,
      kind: "charm" as const,
      ready: eligible.has(c.id),
      ...(blockers.length ? { blockedBy: blockers } : {}),
    };
  });

  return [
    { path: "/charms", kind: "index", ready: false, blockedBy: ["page not built"] },
    ...GROUP_ROUTES.map((g) => ({
      path: g.path,
      kind: "group" as const,
      ready: false,
      blockedBy: ["page not built", "introduction copy not written"],
    })),
    ...charmPages,
  ];
}

/** Only the routes that may be advertised to a crawler. */
export function indexableCharmRoutes(): CharmRoute[] {
  return charmRoutes().filter((r) => r.ready);
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
