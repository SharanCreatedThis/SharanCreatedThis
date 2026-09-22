import type { MetadataRoute } from "next";
import { DEFAULT_DESCRIPTION, SITE_NAME } from "@/lib/seo";

/**
 * The web app manifest.
 *
 * The site is not an installable app and does not pretend to be one: `display`
 * is "browser" rather than "standalone", so adding it to a phone's home screen
 * opens it in the browser with its own icon and colours instead of in a chrome
 * -less window that would strip away the back button for no gain.
 *
 * It exists for the icon, the name and the theme colour — which is what Android
 * reads for the address bar and the task switcher, and what several link
 * previews fall back to.
 */
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "Sharan",
    description: DEFAULT_DESCRIPTION,
    start_url: "/",
    display: "browser",
    background_color: "#09090b",
    theme_color: "#09090b",
    lang: "en-IN",
    categories: ["portfolio", "photography", "productivity"],
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
