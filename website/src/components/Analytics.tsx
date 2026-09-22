/**
 * Google Analytics 4 and Microsoft Clarity, both optional.
 *
 * This replaces `@vercel/analytics`, which shipped on every page and requested
 * `/_vercel/insights/script.js` — an endpoint that exists only on Vercel. The
 * site has been on Cloudflare Pages since the cutover, so that request has been
 * a 404 on every pageview and the site has had no analytics at all.
 *
 * Both scripts load through `next/script` with `afterInteractive`, so neither
 * blocks first paint or counts against LCP. Each is skipped entirely when its id
 * is unset, which is what keeps local development and preview builds out of the
 * production property: no id in the environment, no script in the page, no
 * events. There is no "development mode" branch to get wrong.
 *
 * Route changes are reported manually. The site is a single-page app after the
 * first load, so gtag's own page_view fires once and then never again; without
 * this every visit would look like a one-page session.
 */

"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { ANALYTICS } from "@/lib/seo";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    clarity?: (...args: unknown[]) => void;
  }
}

/**
 * Reports a page_view on every client-side navigation.
 *
 * Reads useSearchParams, which opts the tree into client rendering, so it sits
 * alone in its own component behind Suspense rather than dragging the layout
 * with it.
 */
function RouteTracker({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!window.gtag) return;
    const query = searchParams.toString();
    window.gtag("event", "page_view", {
      page_path: query ? `${pathname}?${query}` : pathname,
      page_location: window.location.href,
      page_title: document.title,
      send_to: measurementId,
    });
  }, [pathname, searchParams, measurementId]);

  return null;
}

export function GoogleAnalytics() {
  const measurementId = ANALYTICS.ga4;
  if (!measurementId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            // Sent manually by RouteTracker, which also covers client-side
            // navigation. Leaving this on would double-count the first page.
            send_page_view: false,
            anonymize_ip: true
          });
        `}
      </Script>
      <Suspense fallback={null}>
        <RouteTracker measurementId={measurementId} />
      </Suspense>
    </>
  );
}

export function Clarity() {
  const projectId = ANALYTICS.clarity;
  if (!projectId) return null;

  return (
    <Script id="clarity-init" strategy="afterInteractive">
      {`
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${projectId}");
      `}
    </Script>
  );
}

/**
 * One named event, for the things worth counting beyond pageviews: which
 * product a visitor chose, and which build they took away.
 *
 * Safe to call when analytics is switched off — it simply does nothing.
 */
export function trackEvent(name: string, params?: Record<string, unknown>) {
  window.gtag?.("event", name, params ?? {});
}
