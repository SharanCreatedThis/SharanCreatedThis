import product from "@/data/hangly/product.json";

/**
 * The public product facts for Hangly. Import this module anywhere a count,
 * platform capability, rope, release, FAQ, or schema claim is shown.
 */
export const HANGLY_PRODUCT = product;
export const HANGLY_MAC = product.platforms.mac;
export const HANGLY_WINDOWS = product.platforms.windows;
export const HANGLY_ROPES = product.ropeStyles;
export const HANGLY_MARKETING = product.marketing;
export const HANGLY_RELEASES = product.releases;
