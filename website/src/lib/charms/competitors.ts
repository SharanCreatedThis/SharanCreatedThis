/**
 * What competing apps charge for comparable cultural charms.
 *
 * Kept here rather than inline in JSX for two reasons. Competitor figures go
 * stale and should have one place to update, with the date they were read
 * attached. And a number beside the word "charm" in a component is
 * indistinguishable from a Hangly count to the charm-count validator — which
 * is working as intended, so the fix is to name these as competitor data
 * rather than to loosen the check.
 *
 * Every figure was read from the product's own site on the date below.
 */

export const COMPETITOR_CHARM_PRICING_CHECKED = "2026-09-25";

export type CompetitorPricing = {
  name: string;
  /** Their published catalogue, exactly as they state it. */
  charms: string;
  price: string;
  note?: string;
};

export const COMPETITOR_CHARM_PRICING: CompetitorPricing[] = [
  { name: "Lucky Dangle", charms: "12", price: "$7.77 / $11.11" },
  { name: "Book My Luck", charms: "22 overall", price: "₹99" },
  { name: "Screen Charms", charms: "1 free, more in Pro", price: "Free / $4.99 Pro" },
  { name: "Desk Dangle", charms: "10 overall", price: "Free", note: "Windows only" },
];
