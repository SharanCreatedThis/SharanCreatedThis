import type { Metadata } from "next";
import { Suspense } from "react";
import Users from "./Users";

/**
 * /admin/users — every installation, a page at a time, searchable by name.
 *
 * Kept out of search like the rest of /admin (this noindex, public/_headers, robots.txt). The page ships no data: rows
 * come from the owner-only `adminUsers` function after sign-in. Suspense because the page reads its search, filters
 * and sort from the address (useSearchParams), which a static export renders on the client.
 */
export const metadata: Metadata = {
  title: "Hangly · Users",
  robots: { index: false, follow: false, nocache: true },
};

export default function UsersPage() {
  return (
    <Suspense fallback={null}>
      <Users />
    </Suspense>
  );
}
