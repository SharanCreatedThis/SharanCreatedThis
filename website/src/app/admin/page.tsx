import type { Metadata } from "next";
import Dashboard from "./Dashboard";

/**
 * /admin — the private Hangly dashboard.
 *
 * Kept out of search on three layers: this noindex, the X-Robots-Tag in public/_headers, and robots.txt. The page
 * itself carries no data; everything it shows is read after sign-in, under Firestore rules that admit one account.
 */
export const metadata: Metadata = {
  title: "Hangly · Admin",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminPage() {
  return <Dashboard />;
}
