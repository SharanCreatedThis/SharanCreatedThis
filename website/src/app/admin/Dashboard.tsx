"use client";

/**
 * The private Hangly dashboard.
 *
 * Reads two documents and nothing else: `stats/latest`, live (onSnapshot — liveStats rewrites it every 15 minutes),
 * and the nightly snapshot `stats/<day>` for the trend arrows. Both are written by Hangly's Cloud Functions from
 * Firestore aggregation queries, so opening this page costs two document reads whatever the number of users, and
 * nothing here ever lists /users or /crashReports (the rules would refuse it anyway).
 */
import { useEffect, useMemo, useState } from "react";
import { type User, onAuthStateChanged } from "firebase/auth";
import { type Timestamp, doc, getDoc, onSnapshot } from "firebase/firestore";
import { auth, db, signInWithGoogle, signOut } from "@/lib/admin/firebase";

type Split = { value: string; count: number };
type Rate = { crashed: number; active: number; rate: number };
type Signature = { signature: string; count: number; lastSeen: Timestamp | null };

type Latest = {
  totalUsers: number; installedUsers: number; uninstalledUsers: number; importedUsers: number;
  totalMacUsers: number; totalWindowsUsers: number;
  activeUsers1d: number; activeUsers7d: number; activeUsers30d: number;
  newUsers1d: number; newUsers7d: number; newUsers30d: number;
  platforms: Split[]; appVersions: Split[]; architectures?: Split[]; architecturesByPlatform?: Record<string, Split[]>;
  latestVersion: string | null; latestVersionUsers: number; latestVersionPercent: number;
  outdatedUsers: number; outdatedUsersPercent: number;
  totalCrashes: number; crashRate: number; crashedUsers7d: number;
  crashRateByPlatform?: Record<string, Rate>; crashesByPlatform?: Split[];
  crashReports30d?: { last30d: number; sampled: number; fatal: number; nonFatal: number; installations: number;
    byVersion: Split[]; byPlatform: Split[]; topSignatures: Signature[] };
  countries?: Split[]; regions?: Split[]; cities?: Split[];
  newestUserSeenAt: Timestamp | null; lastActivityAt: Timestamp | null;
  generatedAt: Timestamp | null; computedAt?: Timestamp | null; day?: string;
};

/** The nightly snapshot's names for the figures the trend arrows compare. */
type Snapshot = { totalInstalls?: number; activeUsers1d?: number; activeUsers7d?: number; activeUsers30d?: number };

const LIVE_EVERY_MS = 15 * 60 * 1000;
const nf = new Intl.NumberFormat("en-IN");
const fmt = (n: number | undefined | null) => (n == null ? "—" : nf.format(n));
const pct = (n: number | undefined | null, digits = 1) => (n == null ? "—" : `${n.toFixed(digits)}%`);
const share = (part: number, whole: number) => (whole > 0 ? (part / whole) * 100 : 0);
const regionNames = typeof Intl !== "undefined" && "DisplayNames" in Intl
  ? new Intl.DisplayNames(["en"], { type: "region" }) : null;
const countryName = (code: string) => {
  if (!/^[A-Z]{2}$/.test(code)) return code === "unknown" ? "Unknown" : code;
  try { return regionNames?.of(code) ?? code; } catch { return code; }
};
const compareVersions = (a: string, b: string) => {
  const pa = a.split(".").map((n) => parseInt(n, 10) || 0), pb = b.split(".").map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) - (pb[i] ?? 0);
  return 0;
};
const ago = (then: Date | null, now: number) => {
  if (!then) return "—";
  const s = Math.max(0, Math.round((now - then.getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s ago`;
  const h = Math.floor(m / 60);
  return h < 48 ? `${h}h ${m % 60}m ago` : `${Math.floor(h / 24)}d ago`;
};
/** "in 7m 12s", or "overdue by 2m" once the scheduled run is late. */
const until = (due: number, now: number) => {
  const s = Math.round((due - now) / 1000);
  const span = (n: number) => (n >= 60 ? `${Math.floor(n / 60)}m ${n % 60}s` : `${n}s`);
  return s >= 0 ? `in ${span(s)}` : `overdue by ${span(-s)}`;
};
const when = (t: Timestamp | null | undefined) =>
  t ? t.toDate().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "medium" }) : "—";

export default function Dashboard() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [status, setStatus] = useState<string | null>(null);
  const [latest, setLatest] = useState<Latest | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [denied, setDenied] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => onAuthStateChanged(auth(), setUser), []);

  useEffect(() => {
    if (!user) return;
    setDenied(false);
    return onSnapshot(doc(db(), "stats", "latest"),
      (s) => setLatest((s.data() as Latest | undefined) ?? null),
      () => setDenied(true));
  }, [user]);

  useEffect(() => {
    if (!user || !latest?.day) return;
    getDoc(doc(db(), "stats", latest.day)).then((s) => setSnapshot((s.data() as Snapshot | undefined) ?? null)).catch(() => {});
  }, [user, latest?.day]);

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  if (user === undefined) return <Shell><p className="adm-muted">Checking sign-in…</p></Shell>;

  if (!user) {
    return (
      <Shell>
        <div className="adm-signin">
          <h2>Sign in</h2>
          <p className="adm-muted">Private. Only the owner&apos;s Google account can read anything here.</p>
          <button type="button" className="adm-button" onClick={async () => {
            setStatus(null);
            try { await signInWithGoogle(); }
            catch (err) {
              const code = (err as { code?: string }).code ?? "error";
              if (code !== "auth/popup-closed-by-user" && code !== "auth/cancelled-popup-request") setStatus(`Sign-in did not complete: ${code}`);
            }
          }}>Sign in with Google</button>
          {status && <p className="adm-status">{status}</p>}
        </div>
      </Shell>
    );
  }

  if (denied) {
    return (
      <Shell user={user}>
        <p className="adm-status">Signed in as {user.email}, which cannot read these statistics.</p>
      </Shell>
    );
  }

  if (!latest) return <Shell user={user}><p className="adm-muted">Loading stats/latest…</p></Shell>;

  return <Shell user={user}><Body s={latest} snap={snapshot} now={now} /></Shell>;
}

function Shell({ user, children }: { user?: User; children: React.ReactNode }) {
  return (
    <main className="adm wrap">
      <header className="adm-head">
        <div>
          <p className="adm-eyebrow">HANGLY · INTERNAL</p>
          <h1>Analytics</h1>
        </div>
        {user && (
          <div className="adm-user">
            <span>{user.email}</span>
            <button className="adm-link" onClick={() => signOut()}>Sign out</button>
          </div>
        )}
      </header>
      {children}
    </main>
  );
}

function Body({ s, snap, now }: { s: Latest; snap: Snapshot | null; now: number }) {
  const generated = s.generatedAt?.toDate() ?? null;
  const age = generated ? now - generated.getTime() : Infinity;
  const fresh = age < LIVE_EVERY_MS + 5 * 60 * 1000;
  const versions = useMemo(
    () => [...(s.appVersions ?? [])].sort((a, b) => (a.value === "other" ? 1 : b.value === "other" ? -1 : compareVersions(b.value, a.value))),
    [s.appVersions],
  );
  const since = snap ? "since 00:30 IST" : undefined;
  const trend = (current: number, before: number | undefined) => (snap && before != null ? current - before : undefined);

  return (
    <>
      <section className="adm-live" aria-label="Last refresh">
        <span className={`adm-dot ${fresh ? "on" : "stale"}`} aria-hidden />
        <div>
          <p className="adm-eyebrow">stats/latest · generatedAt</p>
          <p className="adm-generated">{when(s.generatedAt)}</p>
        </div>
        <dl className="adm-meta">
          <div><dt>Last liveStats run</dt><dd>{ago(generated, now)}</dd></div>
          <div><dt>Next run</dt><dd>{generated ? until(generated.getTime() + LIVE_EVERY_MS, now) : "—"}</dd></div>
          <div><dt>Nightly scan (geography, retention)</dt><dd>{when(s.computedAt)}</dd></div>
          <div><dt>Source</dt><dd>Firestore aggregation counts</dd></div>
        </dl>
      </section>

      <h2 className="adm-h2">Overview</h2>
      <div className="adm-cards">
        <Card label="Total users" value={fmt(s.totalUsers)} delta={trend(s.totalUsers, snap?.totalInstalls)} note={since} />
        <Card label="Installed" value={fmt(s.installedUsers)} sub={pct(share(s.installedUsers, s.totalUsers))} />
        <Card label="Uninstalled" value={fmt(s.uninstalledUsers)} sub={pct(share(s.uninstalledUsers, s.totalUsers))} />
        <Card label="Active · 1 day" value={fmt(s.activeUsers1d)} delta={trend(s.activeUsers1d, snap?.activeUsers1d)} note={since} />
        <Card label="Active · 7 days" value={fmt(s.activeUsers7d)} delta={trend(s.activeUsers7d, snap?.activeUsers7d)} note={since} />
        <Card label="Active · 30 days" value={fmt(s.activeUsers30d)} delta={trend(s.activeUsers30d, snap?.activeUsers30d)} note={since} />
        <Card label="Mac users" value={fmt(s.totalMacUsers)} sub={pct(share(s.totalMacUsers, s.totalUsers))} />
        <Card label="Windows users" value={fmt(s.totalWindowsUsers)} sub={pct(share(s.totalWindowsUsers, s.totalUsers))} />
        <Card label="Fatal crashes (all time)" value={fmt(s.totalCrashes)} sub={`${fmt(s.crashedUsers7d)} installs in 7 days`} />
        <Card label="Crash rate · 7 days" value={pct(s.crashRate * 100, 2)} sub="crashed ÷ active" />
        <Card label="Newest user seen" value={ago(s.newestUserSeenAt?.toDate() ?? null, now)} sub={when(s.newestUserSeenAt)} />
        <Card label="Imported from PostHog" value={fmt(s.importedUsers)} sub="before 2.1.0" />
      </div>

      <h2 className="adm-h2">Growth</h2>
      <p className="adm-muted adm-note">Installations by first seen. Imported installations keep the date PostHog first saw them.</p>
      <div className="adm-cards three">
        <Card label="New users · 1 day" value={fmt(s.newUsers1d)} />
        <Card label="New users · 7 days" value={fmt(s.newUsers7d)} />
        <Card label="New users · 30 days" value={fmt(s.newUsers30d)} />
      </div>

      <h2 className="adm-h2">Version adoption</h2>
      <div className="adm-cards three">
        <Card label={`Latest · ${s.latestVersion ?? "—"}`} value={fmt(s.latestVersionUsers)} sub={`${pct(s.latestVersionPercent)} adoption`} />
        <Card label="Not on the latest" value={fmt(s.outdatedUsers)} sub={pct(s.outdatedUsersPercent)} />
        <Card label="Versions in use" value={fmt(versions.filter((v) => v.value !== "other").length)} />
      </div>
      <Bars rows={versions.map((v) => ({ label: v.value, count: v.count, badge: v.value === s.latestVersion ? "latest" : undefined }))}
        total={s.totalUsers} caption="Users by version (lastKnownAppVersion)" />

      <h2 className="adm-h2">Platforms</h2>
      <div className="adm-grid two">
        <Bars rows={(s.platforms ?? []).map((p) => ({ label: p.value === "macos" ? "macOS" : p.value === "windows" ? "Windows" : p.value, count: p.count }))}
          total={s.totalUsers} caption="Users by platform" />
        <Bars rows={(s.architectures ?? []).map((a) => ({ label: a.value, count: a.count }))} total={s.totalUsers}
          caption="Users by architecture (unknown: Macs imported before 2.1.0)" />
        {Object.entries(s.architecturesByPlatform ?? {}).map(([platform, rows]) => (
          <Bars key={platform} rows={rows.map((a) => ({ label: a.value, count: a.count }))}
            total={rows.reduce((t, r) => t + r.count, 0)} caption={`${platform === "macos" ? "macOS" : "Windows"} by architecture`} />
        ))}
      </div>

      <h2 className="adm-h2">Geography</h2>
      <p className="adm-muted adm-note">From the nightly scan ({when(s.computedAt)}). Located from the connection; the address is never stored.</p>
      <div className="adm-grid three">
        <Table caption="Top countries" rows={(s.countries ?? []).slice(0, 20).map((c) => [countryName(c.value), c.count])} total={sumOf(s.countries)} />
        <Table caption="Top states" rows={(s.regions ?? []).slice(0, 20).map((r) => [placeName(r.value), r.count])} total={sumOf(s.regions)} />
        <Table caption="Top cities" rows={(s.cities ?? []).slice(0, 20).map((c) => [placeName(c.value), c.count])} total={sumOf(s.cities)} />
      </div>

      <h2 className="adm-h2">Crashes</h2>
      <div className="adm-cards">
        <Card label="Fatal crashes (all time)" value={fmt(s.totalCrashes)} sub="from installation records" />
        <Card label="Crash rate · 7 days" value={pct(s.crashRate * 100, 2)} />
        {(s.crashesByPlatform ?? []).map((p) => (
          <Card key={p.value} label={`Fatal · ${p.value === "macos" ? "macOS" : "Windows"}`} value={fmt(p.count)}
            sub={s.crashRateByPlatform?.[p.value] ? `${pct(s.crashRateByPlatform[p.value].rate * 100, 2)} of active` : undefined} />
        ))}
        <Card label="Error reports · 30 days" value={fmt(s.crashReports30d?.last30d)} sub="Windows; macOS reports go to Crashlytics" />
        <Card label="Of the newest sampled" value={`${fmt(s.crashReports30d?.fatal)} fatal`}
          sub={`${fmt(s.crashReports30d?.nonFatal)} non-fatal · ${fmt(s.crashReports30d?.installations)} installs`} />
      </div>
      <div className="adm-grid two">
        <Bars rows={(s.crashReports30d?.byVersion ?? []).map((v) => ({ label: v.value, count: v.count }))}
          total={s.crashReports30d?.sampled ?? 0} caption={`Error reports by version (newest ${fmt(s.crashReports30d?.sampled)})`} />
        <div className="adm-panel">
          <p className="adm-caption">Top signatures (newest {fmt(s.crashReports30d?.sampled)} reports)</p>
          <table className="adm-table">
            <thead><tr><th>Exception</th><th className="num">Reports</th><th className="num">Last seen</th></tr></thead>
            <tbody>
              {(s.crashReports30d?.topSignatures ?? []).map((t) => (
                <tr key={t.signature}>
                  <td className="mono">{t.signature.replace(/^System\./, "")}</td>
                  <td className="num">{fmt(t.count)}</td>
                  <td className="num">{ago(t.lastSeen?.toDate() ?? null, now)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <details className="adm-raw">
        <summary>stats/latest as stored</summary>
        <pre>{JSON.stringify(s, (_k, v) => (v && typeof v === "object" && "seconds" in v && "nanoseconds" in v
          ? new Date(v.seconds * 1000).toISOString() : v), 2)}</pre>
      </details>
    </>
  );
}

const sumOf = (rows?: Split[]) => (rows ?? []).reduce((t, r) => t + r.count, 0);
const placeName = (value: string) => {
  if (value === "unknown") return "Unknown";
  const parts = value.split(", ");
  const code = parts.at(-1) ?? "";
  return /^[A-Z]{2}$/.test(code) ? [...parts.slice(0, -1), countryName(code)].join(", ") : value;
};

function Card({ label, value, sub, delta, note }: { label: string; value: string; sub?: string; delta?: number; note?: string }) {
  return (
    <div className="adm-card">
      <p className="adm-label">{label}</p>
      <p className="adm-value">{value}</p>
      {delta !== undefined && (
        <p className={`adm-delta ${delta > 0 ? "up" : delta < 0 ? "down" : ""}`}>
          {delta > 0 ? "▲" : delta < 0 ? "▼" : "•"} {fmt(Math.abs(delta))} <span>{note}</span>
        </p>
      )}
      {sub && <p className="adm-sub">{sub}</p>}
    </div>
  );
}

function Bars({ rows, total, caption }: { rows: { label: string; count: number; badge?: string }[]; total: number; caption: string }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <div className="adm-panel">
      <p className="adm-caption">{caption}</p>
      <ul className="adm-bars">
        {rows.map((r) => (
          <li key={r.label}>
            <span className="adm-bar-label">{r.label}{r.badge && <em>{r.badge}</em>}</span>
            <span className="adm-bar"><span style={{ width: `${(r.count / max) * 100}%` }} /></span>
            <span className="num">{fmt(r.count)}</span>
            <span className="num adm-muted">{pct(share(r.count, total))}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Table({ caption, rows, total }: { caption: string; rows: [string, number][]; total: number }) {
  return (
    <div className="adm-panel">
      <p className="adm-caption">{caption}</p>
      <table className="adm-table">
        <tbody>
          {rows.map(([name, count]) => (
            <tr key={name}>
              <td>{name}</td>
              <td className="num">{fmt(count)}</td>
              <td className="num adm-muted">{pct(share(count, total))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
