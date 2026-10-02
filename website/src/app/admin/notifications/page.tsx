import type { Metadata } from "next";
import Notifications from "./Notifications";

/**
 * /admin/notifications — writing the broadcasts Hangly shows under the charm.
 *
 * Out of search the same three ways as /admin (this noindex, public/_headers, robots.txt). The page carries no data;
 * everything is read and written after sign-in, under Firestore rules that admit one account.
 */
export const metadata: Metadata = {
  title: "Hangly · Notifications",
  robots: { index: false, follow: false, nocache: true },
};

export default function NotificationsPage() {
  return <Notifications />;
}
