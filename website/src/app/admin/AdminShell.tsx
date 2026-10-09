"use client";

/**
 * The private dashboard's frame: the heading, the sections — Analytics, Users and Notifications — and who is signed in.
 * Shared so the pages are one place with several rooms, not several sites.
 */
import Link from "next/link";
import { type User } from "firebase/auth";
import { signOut } from "@/lib/admin/firebase";

export type AdminSection = "analytics" | "users" | "notifications";

export default function AdminShell({
  user, section, title, children,
}: { user?: User; section: AdminSection; title: string; children: React.ReactNode }) {
  return (
    // The Users table is wide: on a desktop it gets the screen, not the site's 1320 px column.
    <main className={section === "users" ? "adm wrap adm-wide" : "adm wrap"}>
      <header className="adm-head">
        <div>
          <p className="adm-eyebrow">HANGLY · INTERNAL</p>
          <h1>{title}</h1>
        </div>
        {user && (
          <div className="adm-user">
            <span>{user.email}</span>
            <button className="adm-link" onClick={() => signOut()}>Sign out</button>
          </div>
        )}
      </header>
      <nav className="adm-tabs" aria-label="Admin sections">
        <Link href="/admin" className={section === "analytics" ? "on" : undefined} aria-current={section === "analytics" ? "page" : undefined}>
          Analytics
        </Link>
        <Link href="/admin/users" className={section === "users" ? "on" : undefined} aria-current={section === "users" ? "page" : undefined}>
          Users
        </Link>
        <Link href="/admin/notifications" className={section === "notifications" ? "on" : undefined} aria-current={section === "notifications" ? "page" : undefined}>
          Notifications
        </Link>
      </nav>
      {children}
    </main>
  );
}
