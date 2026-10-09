"use client";

/**
 * The Users page: every installation, one row each, searchable by name, ID, place, platform or version, filtered,
 * sorted and paged on the server (lib/admin/users.ts → the `adminUsers` function). Nothing here reads /users itself,
 * and nothing loads more than a page. The search, filters and sort live in the address, so back and forward, a
 * bookmark and a shared link all land on the same view; the open installation does too (?user=).
 */
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type User, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { ArrowDownWideNarrow, Check, ChevronLeft, ChevronRight, Copy, Download, Filter, Loader2, RotateCw, Search, X } from "lucide-react";
import { auth, db, signInWithGoogle } from "@/lib/admin/firebase";
import {
  type Activity, type CrashRow, type Direction, type Platform, type Query, type SortName, type Status, type UserRow,
  AdminError, DEFAULT_DIR, countUsers, crashesFor, exportUsers, getUser, listUsers, looksLikeId, looksLikeShortId, otherFilters,
} from "@/lib/admin/users";
import AdminShell from "../AdminShell";

// MARK: - Formatting

const nf = new Intl.NumberFormat("en-IN");
const fmt = (n: number | null | undefined) => (n == null ? "—" : nf.format(n));
const regionNames = typeof Intl !== "undefined" && "DisplayNames" in Intl ? new Intl.DisplayNames(["en"], { type: "region" }) : null;
const countryName = (code: string | null) => {
  if (!code) return "—";
  if (!/^[A-Z]{2}$/.test(code)) return code;
  try { return regionNames?.of(code) ?? code; } catch { return code; }
};
const platformName = (p: string | null) => (p === "macos" ? "macOS" : p === "windows" ? "Windows" : p ?? "—");
const exact = (ms: number | null) => (ms == null ? "" : new Date(ms).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "medium" }));
/** "3 minutes ago", "2 days ago"; the exact moment is in the title. */
function relative(ms: number | null, now: number): string {
  if (ms == null) return "—";
  const s = Math.round((now - ms) / 1000);
  if (s < 0) return "just now";
  if (s < 60) return `${s} second${s === 1 ? "" : "s"} ago`;
  const steps: [number, string][] = [[60, "minute"], [3600, "hour"], [86400, "day"], [2592000, "month"], [31536000, "year"]];
  let unit = "minute", size = 60;
  for (const [length, name] of steps) if (s >= length) { unit = name; size = length; }
  const n = Math.floor(s / size);
  return `${n} ${unit}${n === 1 ? "" : "s"} ago`;
}
const shortId = (id: string) => `${id.slice(0, 8)}…`;

// MARK: - The address

const SORTS: { value: SortName; label: string }[] = [
  { value: "lastSeen", label: "Last seen" }, { value: "firstSeen", label: "First seen" }, { value: "name", label: "Name" },
  { value: "version", label: "App version" }, { value: "activeDays", label: "Active days" }, { value: "crashCount", label: "Crashes" },
];
const ACTIVITIES: { value: Activity; label: string }[] = [
  { value: "1d", label: "Seen today" }, { value: "7d", label: "Seen in 7 days" }, { value: "30d", label: "Seen in 30 days" },
  { value: "inactive30", label: "Inactive 30+ days" },
];

function readQuery(params: URLSearchParams): Query {
  const pick = <T extends string>(key: string, allowed: readonly T[]): T | null => {
    const v = params.get(key);
    return v && (allowed as readonly string[]).includes(v) ? (v as T) : null;
  };
  const sort = pick<SortName>("sort", SORTS.map((s) => s.value)) ?? "lastSeen";
  const size = Number(params.get("size"));
  return {
    q: params.get("q") ?? "",
    platform: pick<Platform>("platform", ["macos", "windows"]),
    versions: (params.get("version") ?? "").split(",").filter((v) => /^[\w.-]{1,24}$/.test(v)).slice(0, 30),
    status: pick<Status>("status", ["installed", "uninstalled"]),
    activity: pick<Activity>("activity", ACTIVITIES.map((a) => a.value)),
    country: params.get("country") || null,
    region: params.get("region") || null,
    city: params.get("city") || null,
    architecture: pick("arch", ["x64", "arm64", "unknown"] as const),
    sort,
    dir: pick<Direction>("dir", ["asc", "desc"]) ?? DEFAULT_DIR[sort],
    pageSize: size === 25 || size === 100 ? size : 50,
  };
}

function writeQuery(query: Query, user: string | null): string {
  const p = new URLSearchParams();
  if (query.q.trim()) p.set("q", query.q.trim());
  if (query.platform) p.set("platform", query.platform);
  if (query.versions.length) p.set("version", query.versions.join(","));
  if (query.status) p.set("status", query.status);
  if (query.activity) p.set("activity", query.activity);
  if (query.country) p.set("country", query.country);
  if (query.region) p.set("region", query.region);
  if (query.city) p.set("city", query.city);
  if (query.architecture) p.set("arch", query.architecture);
  if (query.sort !== "lastSeen") p.set("sort", query.sort);
  if (query.dir !== DEFAULT_DIR[query.sort]) p.set("dir", query.dir);
  if (query.pageSize !== 50) p.set("size", String(query.pageSize));
  if (user) p.set("user", user);
  const s = p.toString();
  return s ? `?${s}` : "";
}

/**
 * The query the function is asked, made legal: a search combines with the platform only and is ordered by last seen;
 * another sort combines with the platform only, one way; filtered results run newest first. What was set aside is
 * named, so the page can say so rather than quietly show something else.
 */
function effective(query: Query): { query: Query; setAside: string[] } {
  const q = { ...query };
  const setAside: string[] = [];
  const dropOthers = () => {
    for (const name of otherFilters(q)) setAside.push(name);
    Object.assign(q, { versions: [], status: null, activity: null, country: null, region: null, city: null, architecture: null });
  };
  if (q.q.trim()) {
    if (otherFilters(q).length) dropOthers();
    if (q.sort !== "lastSeen" && !looksLikeId(q.q)) { setAside.push("sort"); q.sort = "lastSeen"; }
    q.dir = "desc";
  } else if (q.sort !== "lastSeen") {
    if (otherFilters(q).length) { setAside.push("sort"); q.sort = "lastSeen"; q.dir = "desc"; }
    else if (q.platform) q.dir = DEFAULT_DIR[q.sort];
  } else if (q.platform || otherFilters(q).length) {
    q.dir = "desc";
  }
  return { query: q, setAside };
}

const keyOf = (q: Query) => JSON.stringify({ ...q, q: q.q.trim().toLowerCase() });

// MARK: - The page

interface Latest {
  totalUsers?: number;
  appVersions?: { value: string; count: number }[];
  versionsDiscovered?: string[];
  countries?: { value: string; count: number }[];
  regions?: { value: string; count: number }[];
  cities?: { value: string; count: number }[];
}

export default function Users() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [status, setStatus] = useState<string | null>(null);
  useEffect(() => onAuthStateChanged(auth(), setUser), []);

  if (user === undefined) return <Shell><p className="adm-muted">Checking sign-in…</p></Shell>;
  if (!user) {
    return (
      <Shell>
        <div className="adm-signin">
          <h2>Sign in</h2>
          <p className="adm-muted">Private. Only the owner&apos;s Google account can read anything here.</p>
          <button type="button" className="adm-button" onClick={async () => {
            setStatus(null);
            try { await signInWithGoogle(); } catch (err) {
              const code = (err as { code?: string }).code ?? "error";
              if (code !== "auth/popup-closed-by-user" && code !== "auth/cancelled-popup-request") setStatus(`Sign-in did not complete: ${code}`);
            }
          }}>Sign in with Google</button>
          {status && <p className="adm-status">{status}</p>}
        </div>
      </Shell>
    );
  }
  return <Shell user={user}><UsersBody /></Shell>;
}

function Shell({ user, children }: { user?: User; children: React.ReactNode }) {
  return <AdminShell user={user} section="users" title="Users">{children}</AdminShell>;
}

function UsersBody() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const query = useMemo(() => readQuery(new URLSearchParams(params.toString())), [params]);
  const openId = params.get("user");
  const { query: asked, setAside } = useMemo(() => effective(query), [query]);
  const askedKey = keyOf(asked);

  const navigate = useCallback((next: Query, options: { replace?: boolean; user?: string | null } = {}) => {
    const url = `${pathname}${writeQuery(next, options.user === undefined ? openId : options.user)}`;
    if (options.replace) router.replace(url, { scroll: false });
    else router.push(url, { scroll: false });
  }, [pathname, router, openId]);
  const update = (patch: Partial<Query>) => navigate({ ...query, ...patch });

  // The search box: typed into freely, sent to the address 300 ms after the last keystroke.
  const [text, setText] = useState(query.q);
  const typing = useRef(false);
  useEffect(() => { if (!typing.current) setText(query.q); }, [query.q]);
  useEffect(() => {
    if (text === query.q) { typing.current = false; return; }
    typing.current = true;
    const t = window.setTimeout(() => { typing.current = false; navigate({ ...query, q: text }, { replace: true }); }, 300);
    return () => window.clearTimeout(t);
  }, [text]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pages: the cursor each one started from. Any change to the query starts again at the first.
  const [cursors, setCursors] = useState<(string | null)[]>([null]);
  const [pageIndex, setPageIndex] = useState(0);
  useEffect(() => { setCursors([null]); setPageIndex(0); }, [askedKey]);

  const [rows, setRows] = useState<UserRow[] | null>(null);
  const [next, setNext] = useState<string | null>(null);
  const [partial, setPartial] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AdminError | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    listUsers(asked, cursors[pageIndex] ?? null, controller.signal)
      .then((page) => { setRows(page.rows); setNext(page.next); setPartial(page.partial); setLoading(false); })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err instanceof AdminError ? err : new AdminError("unavailable", "The request did not complete."));
        setLoading(false);
      });
    return () => controller.abort();
  }, [askedKey, pageIndex, attempt]); // eslint-disable-line react-hooks/exhaustive-deps

  const [count, setCount] = useState<{ count: number; exact: boolean } | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    setCount(null);
    countUsers(asked, controller.signal).then(setCount).catch(() => {});
    return () => controller.abort();
  }, [askedKey, attempt]); // eslint-disable-line react-hooks/exhaustive-deps

  // The filters' choices come from the dashboard's own summary (stats/latest): one document read.
  const [latest, setLatest] = useState<Latest | null>(null);
  useEffect(() => { getDoc(doc(db(), "stats", "latest")).then((s) => setLatest((s.data() as Latest | undefined) ?? null)).catch(() => {}); }, []);

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = window.setInterval(() => setNow(Date.now()), 30_000); return () => window.clearInterval(t); }, []);

  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "SELECT") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const searching = text.trim() !== "" && (loading || text !== query.q);
  const filtered = Boolean(asked.q.trim() || asked.platform || otherFilters(asked).length);
  // Unfiltered, the total is already in stats/latest (liveStats, every 15 minutes): shown at once, then replaced by
  // the exact count when it arrives — a count over every installation takes seconds at 40,000 and grows with them.
  const shownCount = count ?? (!filtered && typeof latest?.totalUsers === "number" ? { count: latest.totalUsers, exact: true } : null);
  const activeFilters = (asked.platform ? 1 : 0) + otherFilters(asked).length;
  const firstRow = pageIndex * asked.pageSize + 1;

  async function runExport() {
    setExporting("Exporting…");
    try {
      const result = await exportUsers(asked);
      const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `hangly-users-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
      setExporting(result.truncated ? `Exported the first ${fmt(result.rows)} rows (the export limit). Narrow the filters for the rest.` : `Exported ${fmt(result.rows)} rows.`);
    } catch (err) {
      setExporting(err instanceof AdminError ? err.message : "The export did not complete.");
    }
  }

  return (
    <div className="usr">
      <div className="usr-top">
        <p className="usr-count" aria-live="polite">
          {shownCount == null
            ? <span className="adm-muted">Counting…</span>
            : filtered
              // A search of several words is counted for its longest word only, so the count is a ceiling: "sharan
              // chennai" counts everyone in Chennai. The page itself shows only installations with every word.
              ? shownCount.exact
                ? <><strong>{fmt(shownCount.count)}</strong> matching {shownCount.count === 1 ? "user" : "users"}</>
                : <span title="Counted for the longest word of the search; fewer installations have every word.">
                    Up to <strong>{fmt(shownCount.count)}</strong> matching {shownCount.count === 1 ? "user" : "users"}
                  </span>
              : <>Total users: <strong>{fmt(shownCount.count)}</strong></>}
        </p>
        <Link href="/admin" className="usr-back">← Overview</Link>
      </div>

      <div className="usr-bar">
        <label className="usr-search">
          <Search size={16} aria-hidden />
          <input ref={searchRef} type="search" value={text} placeholder="Search by name, installation ID, city, platform or version…"
            aria-label="Search users" autoComplete="off" spellCheck={false}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Escape") setText(""); }} />
          {searching && <Loader2 size={16} className="usr-spin" aria-label="Searching" />}
          {text && !searching && (
            <button type="button" className="usr-clear" aria-label="Clear search" onClick={() => { setText(""); searchRef.current?.focus(); }}><X size={15} /></button>
          )}
        </label>

        <button type="button" className={`usr-btn ${filtersOpen ? "on" : ""}`} aria-expanded={filtersOpen} onClick={() => setFiltersOpen((o) => !o)}>
          <Filter size={15} aria-hidden /> Filters{activeFilters ? <span className="usr-badge">{activeFilters}</span> : null}
        </button>

        <label className="usr-select" title={setAside.includes("sort") ? "This sort does not combine with the current search or filters" : undefined}>
          <ArrowDownWideNarrow size={15} aria-hidden />
          <select value={asked.sort} aria-label="Sort by" onChange={(e) => {
            const sort = e.target.value as SortName;
            update({ sort, dir: DEFAULT_DIR[sort] });
          }}>
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}
                disabled={s.value !== "lastSeen" && (Boolean(query.q.trim() && !looksLikeId(query.q)) || otherFilters(query).length > 0)}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="usr-btn icon" aria-label={asked.dir === "desc" ? "Descending; reverse" : "Ascending; reverse"}
          title={filtered ? "Filtered results run one way" : "Reverse the order"} disabled={filtered}
          onClick={() => update({ dir: asked.dir === "desc" ? "asc" : "desc" })}>
          {asked.dir === "desc" ? "↓" : "↑"}
        </button>

        <label className="usr-select">
          <select value={asked.pageSize} aria-label="Rows per page" onChange={(e) => update({ pageSize: Number(e.target.value) as 25 | 50 | 100 })}>
            {[25, 50, 100].map((n) => <option key={n} value={n}>{n} per page</option>)}
          </select>
        </label>

        <button type="button" className="usr-btn" onClick={runExport} disabled={exporting === "Exporting…"}>
          {exporting === "Exporting…" ? <Loader2 size={15} className="usr-spin" aria-hidden /> : <Download size={15} aria-hidden />} CSV
        </button>
      </div>

      {filtersOpen && <FilterPanel query={query} latest={latest} searching={Boolean(query.q.trim())} onChange={update} onClose={() => setFiltersOpen(false)} />}

      <Chips query={query} asked={asked} onChange={update} />
      {setAside.length > 0 && (
        <p className="usr-note">
          {query.q.trim()
            ? "Search combines with the platform filter only, ordered by last seen. "
            : "With these filters, results are ordered by last seen. "}
          Set aside: {[...new Set(setAside)].join(", ")}.
        </p>
      )}
      {looksLikeShortId(query.q) && (
        <p className="usr-note">Installation IDs are looked up from six characters; shorter, &ldquo;{query.q.trim()}&rdquo; is searched as a word.</p>
      )}
      {exporting && exporting !== "Exporting…" && <p className="usr-note">{exporting} <button className="usr-linkbtn" onClick={() => setExporting(null)}>Dismiss</button></p>}

      <div className="usr-table-wrap">
        <table className="usr-table">
          <thead>
            <tr>
              <th>Name</th><th>Installation ID</th><th>Platform</th><th>App version</th><th className="hide-md">OS version</th>
              <th className="hide-md">Arch</th><th>Country</th><th className="hide-md">State / region</th><th>City</th>
              <th className="hide-sm">First seen</th><th>Last seen</th><th className="num">Active days</th><th className="num">Crashes</th>
              <th>Status</th><th className="hide-md">Previous</th><th className="hide-md">First version</th><th className="num hide-md">Reinstalls</th>
            </tr>
          </thead>
          <tbody>
            {loading && !rows ? <Skeleton cols={17} rows={Math.min(asked.pageSize, 12)} />
              : rows?.map((r) => (
                <tr key={r.id} className={`${loading ? "stale" : ""} ${openId === r.id ? "open" : ""}`} tabIndex={0}
                  onClick={() => navigate(query, { user: r.id })}
                  onKeyDown={(e) => { if (e.key === "Enter") navigate(query, { user: r.id }); }}>
                  <td className="usr-name">{r.nickname || <span className="adm-muted">—</span>}</td>
                  <td><IdCell id={r.id} /></td>
                  <td>{platformName(r.platform)}</td>
                  <td className="mono">{r.appVersion ?? "—"}</td>
                  <td className="hide-md">{r.osVersion ?? "—"}</td>
                  <td className="hide-md">{r.architecture ?? "—"}</td>
                  <td>{countryName(r.country)}</td>
                  <td className="hide-md">{r.region ?? "—"}</td>
                  <td>{r.city ?? "—"}</td>
                  <td className="hide-sm" title={exact(r.firstSeen)}>{relative(r.firstSeen, now)}</td>
                  <td title={exact(r.lastSeen)}>{relative(r.lastSeen, now)}</td>
                  <td className="num">{fmt(r.activeDays)}</td>
                  <td className="num">{r.crashCount ? <span className="usr-crash">{fmt(r.crashCount)}</span> : "0"}</td>
                  <td>{r.installed ? <span className="usr-pill ok">Installed</span> : <span className="usr-pill off">Uninstalled</span>}</td>
                  <td className="hide-md mono">{r.previousAppVersion ?? "—"}</td>
                  <td className="hide-md mono">{r.firstAppVersion ?? "—"}</td>
                  <td className="num hide-md">{fmt(r.reinstallCount)}</td>
                </tr>
              ))}
          </tbody>
        </table>
        {!loading && !error && rows?.length === 0 && (
          <div className="usr-empty">
            {asked.q.trim() ? <>No users found for &ldquo;{asked.q.trim()}&rdquo;</> : "No users match these filters."}
            {asked.q.trim() && asked.q.trim().length < 2 && !looksLikeId(asked.q) && <p className="adm-muted">Type at least two letters.</p>}
          </div>
        )}
        {error && (
          <div className="usr-empty usr-error" role="alert">
            <p>{error.code === "permission-denied" ? "This account cannot read installations." : error.message}</p>
            <button type="button" className="usr-btn" onClick={() => setAttempt((a) => a + 1)}><RotateCw size={14} aria-hidden /> Retry</button>
          </div>
        )}
      </div>

      {partial && <p className="usr-note">This page stopped after checking 1,000 installations for every word of the search. Next carries on.</p>}

      <nav className="usr-pager" aria-label="Pages">
        <span className="adm-muted">
          {rows && rows.length > 0 ? `Page ${pageIndex + 1} · ${fmt(firstRow)}–${fmt(firstRow + rows.length - 1)}` : `Page ${pageIndex + 1}`}
        </span>
        <div>
          <button type="button" className="usr-btn" disabled={pageIndex === 0 || loading} onClick={() => setPageIndex((i) => i - 1)}>
            <ChevronLeft size={15} aria-hidden /> Previous
          </button>
          <button type="button" className="usr-btn" disabled={!next || loading} onClick={() => {
            setCursors((c) => { const copy = c.slice(0, pageIndex + 1); copy[pageIndex + 1] = next; return copy; });
            setPageIndex((i) => i + 1);
          }}>
            Next <ChevronRight size={15} aria-hidden />
          </button>
        </div>
      </nav>

      {openId && <Drawer id={openId} now={now} onClose={() => navigate(query, { user: null })} />}
    </div>
  );
}

// MARK: - Pieces

function IdCell({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <span className="usr-id" title={id}>
      <span className="mono">{shortId(id)}</span>
      <button type="button" className="usr-copy" aria-label={`Copy installation ID ${id}`}
        onClick={(e) => {
          e.stopPropagation();
          navigator.clipboard?.writeText(id).then(() => { setCopied(true); window.setTimeout(() => setCopied(false), 1200); }).catch(() => {});
        }}>
        {copied ? <Check size={13} /> : <Copy size={13} />}
      </button>
    </span>
  );
}

function Skeleton({ cols, rows }: { cols: number; rows: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, r) => (
        <tr key={r} className="usr-skel" aria-hidden>
          {Array.from({ length: cols }, (_, c) => <td key={c} className={c > 10 ? "hide-md" : undefined}><span /></td>)}
        </tr>
      ))}
    </>
  );
}

const placeParts = (value: string) => value.split(", ");

function FilterPanel({ query, latest, searching, onChange, onClose }: {
  query: Query; latest: Latest | null; searching: boolean; onChange: (patch: Partial<Query>) => void; onClose: () => void;
}) {
  const versions = useMemo(() => {
    const all = [...new Set([...(latest?.appVersions ?? []).map((v) => v.value), ...(latest?.versionsDiscovered ?? [])])]
      .filter((v) => v !== "other" && /^\d/.test(v))
      .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
    const families = [...new Set(all.map((v) => v.split(".").slice(0, 2).join(".")))]
      .map((f) => ({ label: `${f}.x`, members: all.filter((v) => v.startsWith(`${f}.`) || v === f) }))
      .filter((f) => f.members.length > 1);
    return { all, families };
  }, [latest]);
  const disabled = searching;
  const versionValue = query.versions.join(",");
  return (
    <div className="usr-panel" role="dialog" aria-label="Filters">
      <div className="usr-panel-head">
        <strong>Filters</strong>
        {searching && <span className="adm-muted">While searching, only Platform applies.</span>}
        <button type="button" className="usr-linkbtn" onClick={() => onChange({ platform: null, versions: [], status: null, activity: null, country: null, region: null, city: null, architecture: null })}>Clear all</button>
        <button type="button" className="usr-clear" aria-label="Close filters" onClick={onClose}><X size={15} /></button>
      </div>
      <div className="usr-panel-grid">
        <Segment label="Platform" value={query.platform} options={[["macos", "macOS"], ["windows", "Windows"]]}
          onChange={(platform) => onChange({ platform: platform as Platform | null })} />
        <Segment label="Status" value={query.status} options={[["installed", "Installed"], ["uninstalled", "Uninstalled"]]} disabled={disabled}
          onChange={(status) => onChange({ status: status as Status | null, sort: "lastSeen", dir: "desc" })} />
        <Segment label="Architecture" value={query.architecture} options={[["x64", "x64"], ["arm64", "arm64"], ["unknown", "Unknown"]]} disabled={disabled}
          onChange={(architecture) => onChange({ architecture: architecture as Query["architecture"], sort: "lastSeen", dir: "desc" })} />
        <label className="usr-field">
          <span>Version</span>
          <select value={versionValue} disabled={disabled} onChange={(e) => onChange({ versions: e.target.value ? e.target.value.split(",") : [], sort: "lastSeen", dir: "desc" })}>
            <option value="">Any version</option>
            {versions.families.map((f) => <option key={f.label} value={f.members.join(",")}>{f.label} (all)</option>)}
            {versions.all.map((v) => <option key={v} value={v}>{v}</option>)}
            {versionValue && !versions.all.includes(versionValue) && !versions.families.some((f) => f.members.join(",") === versionValue) && <option value={versionValue}>{versionValue}</option>}
          </select>
        </label>
        <label className="usr-field">
          <span>Activity</span>
          <select value={query.activity ?? ""} disabled={disabled} onChange={(e) => onChange({ activity: (e.target.value || null) as Activity | null, sort: "lastSeen", dir: "desc" })}>
            <option value="">Any time</option>
            {ACTIVITIES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        </label>
        <label className="usr-field">
          <span>Country</span>
          <select value={query.country ?? ""} disabled={disabled} onChange={(e) => onChange({ country: e.target.value || null, region: null, city: null, sort: "lastSeen", dir: "desc" })}>
            <option value="">Any country</option>
            {(latest?.countries ?? []).filter((c) => /^[A-Z]{2}$/.test(c.value)).map((c) => <option key={c.value} value={c.value}>{countryName(c.value)} ({fmt(c.count)})</option>)}
            {query.country && !(latest?.countries ?? []).some((c) => c.value === query.country) && <option value={query.country}>{countryName(query.country)}</option>}
          </select>
        </label>
        <label className="usr-field">
          <span>State / region</span>
          <select value={query.region ? `${query.region}|${query.country ?? ""}` : ""} disabled={disabled} onChange={(e) => {
            const [region, country] = e.target.value.split("|");
            onChange({ region: region || null, country: country || query.country, city: null, sort: "lastSeen", dir: "desc" });
          }}>
            <option value="">Any state</option>
            {(latest?.regions ?? []).filter((r) => r.value !== "unknown" && (!query.country || r.value.endsWith(`, ${query.country}`))).map((r) => {
              const parts = placeParts(r.value);
              return <option key={r.value} value={`${parts.slice(0, -1).join(", ")}|${parts.at(-1)}`}>{r.value} ({fmt(r.count)})</option>;
            })}
            {query.region && <option value={`${query.region}|${query.country ?? ""}`}>{query.region}</option>}
          </select>
        </label>
        <label className="usr-field">
          <span>City</span>
          <select value={query.city ? `${query.city}|${query.country ?? ""}` : ""} disabled={disabled} onChange={(e) => {
            const [city, country] = e.target.value.split("|");
            onChange({ city: city || null, country: country || query.country, sort: "lastSeen", dir: "desc" });
          }}>
            <option value="">Any city</option>
            {(latest?.cities ?? []).filter((c) => c.value !== "unknown" && (!query.country || c.value.endsWith(`, ${query.country}`))).map((c) => {
              const parts = placeParts(c.value);
              return <option key={c.value} value={`${parts[0]}|${parts.at(-1)}`}>{c.value} ({fmt(c.count)})</option>;
            })}
            {query.city && <option value={`${query.city}|${query.country ?? ""}`}>{query.city}</option>}
          </select>
        </label>
      </div>
      <p className="adm-muted usr-panel-note">Filters combine. Sorting by anything but last seen works alone or with Platform; the lists show the top places from the nightly scan.</p>
    </div>
  );
}

function Segment({ label, value, options, disabled, onChange }: {
  label: string; value: string | null; options: [string, string][]; disabled?: boolean; onChange: (value: string | null) => void;
}) {
  return (
    <div className="usr-field">
      <span>{label}</span>
      <div className="usr-segment" role="group" aria-label={label}>
        <button type="button" className={value === null ? "on" : undefined} disabled={disabled} onClick={() => onChange(null)}>All</button>
        {options.map(([v, l]) => (
          <button key={v} type="button" className={value === v ? "on" : undefined} disabled={disabled} aria-pressed={value === v} onClick={() => onChange(v)}>{l}</button>
        ))}
      </div>
    </div>
  );
}

function Chips({ query, asked, onChange }: { query: Query; asked: Query; onChange: (patch: Partial<Query>) => void }) {
  const chips: [string, Partial<Query>, boolean][] = [];
  const applied = (name: string) => name === "platform" ? asked.platform !== null : otherFilters(asked).includes(name);
  if (query.platform) chips.push([platformName(query.platform), { platform: null }, applied("platform")]);
  if (query.versions.length) chips.push([`Version ${query.versions.length > 3 ? `${query.versions[0]} +${query.versions.length - 1}` : query.versions.join(", ")}`, { versions: [] }, applied("version")]);
  if (query.status) chips.push([query.status === "installed" ? "Installed" : "Uninstalled", { status: null }, applied("status")]);
  if (query.activity) chips.push([ACTIVITIES.find((a) => a.value === query.activity)?.label ?? query.activity, { activity: null }, applied("activity")]);
  if (query.country) chips.push([countryName(query.country), { country: null, region: null, city: null }, applied("country")]);
  if (query.region) chips.push([query.region, { region: null }, applied("region")]);
  if (query.city) chips.push([query.city, { city: null }, applied("city")]);
  if (query.architecture) chips.push([`Arch ${query.architecture}`, { architecture: null }, applied("architecture")]);
  if (chips.length === 0) return null;
  return (
    <div className="usr-chips">
      {chips.map(([label, clear, on]) => (
        <span key={label} className={`usr-chip ${on ? "" : "aside"}`}>
          {label}
          <button type="button" aria-label={`Remove ${label}`} onClick={() => onChange(clear)}><X size={12} /></button>
        </span>
      ))}
    </div>
  );
}

// MARK: - One installation

function Drawer({ id, now, onClose }: { id: string; now: number; onClose: () => void }) {
  const [user, setUser] = useState<UserRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [crashes, setCrashes] = useState<CrashRow[] | null | "loading">(null);
  const [crashError, setCrashError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setUser(null); setError(null); setCrashes(null); setCrashError(null);
    getUser(id, controller.signal).then((r) => setUser(r.user)).catch((err) => {
      if (!controller.signal.aborted) setError(err instanceof AdminError ? err.message : "Could not load this installation.");
    });
    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const loadCrashes = () => {
    setCrashes("loading"); setCrashError(null);
    crashesFor(id).then((r) => setCrashes(r.crashes)).catch((err) => { setCrashes(null); setCrashError(err instanceof AdminError ? err.message : "Could not load crash reports."); });
  };

  const time = (ms: number | null) => (ms == null ? "—" : <span title={exact(ms)}>{exact(ms)} <span className="adm-muted">· {relative(ms, now)}</span></span>);
  return (
    <>
      <div className="usr-scrim" onClick={onClose} aria-hidden />
      <aside className="usr-drawer" role="dialog" aria-modal="true" aria-label="Installation">
        <div className="usr-drawer-head">
          <div>
            <p className="adm-eyebrow">Installation</p>
            <h2>{user ? (user.nickname || "Unnamed") : error ? "Not found" : "Loading…"}</h2>
            <p className="usr-id-full"><span className="mono">{id}</span><IdCopy id={id} /></p>
          </div>
          <button type="button" className="usr-clear" aria-label="Close" onClick={onClose}><X size={18} /></button>
        </div>
        {error && <p className="adm-status">{error}</p>}
        {!user && !error && <div className="usr-drawer-skel"><span /><span /><span /><span /></div>}
        {user && (
          <div className="usr-drawer-body">
            <Section title="Identity" rows={[
              ["Nickname", user.nickname || "—"], ["Installation ID", <span key="id" className="mono">{user.id}</span>],
              ["Platform", platformName(user.platform)], ["Architecture", user.architecture ?? "unknown"],
              ["OS", [user.osName, user.osVersion].filter(Boolean).join(" ") || "—"],
            ]} />
            <Section title="Versions" rows={[
              ["Current version", user.appVersion ?? "—"],
              ...(user.reportedVersion && user.reportedVersion !== user.appVersion ? [["Last synced version", user.reportedVersion] as [string, React.ReactNode]] : []),
              ["Previous version", user.previousAppVersion ?? "—"], ["First version", user.firstAppVersion ?? "—"],
              ["Version changed", time(user.appVersionChangedAt)],
            ]} />
            <Section title="Activity" rows={[
              ["First seen", time(user.firstSeen)], ["Last seen", time(user.lastSeen)],
              ["Active days", fmt(user.activeDays)], ["Retention days", fmt(user.retentionDays)],
            ]} />
            <Section title="Geography" rows={[
              ["Country", countryName(user.country)], ["State / region", user.region ?? "—"], ["City", user.city ?? "—"],
            ]} />
            <Section title="Reliability" rows={[
              ["Fatal crashes", fmt(user.crashCount)], ["Non-fatal reports", fmt(user.nonFatalCount)], ["Last crash", time(user.lastCrashAt)],
              ["Status", user.installed ? "Installed" : "Uninstalled"], ["Uninstalled", time(user.uninstalledAt)],
              ["Reinstalls", fmt(user.reinstallCount)],
            ]} />
            <div className="usr-crashes">
              {user.platform === "macos"
                ? <p className="adm-muted">macOS crash reports go to Crashlytics, not here.</p>
                : crashes === null
                  ? <button type="button" className="usr-btn" onClick={loadCrashes} disabled={!user.crashCount && !user.nonFatalCount}>
                      View crash reports{user.crashCount || user.nonFatalCount ? ` (${fmt(user.crashCount + user.nonFatalCount)})` : " (none)"}
                    </button>
                  : crashes === "loading" ? <p className="adm-muted"><Loader2 size={14} className="usr-spin" /> Loading crash reports…</p>
                    : crashes.length === 0 ? <p className="adm-muted">No crash reports from this installation.</p>
                      : (
                        <>
                          <p className="adm-caption">Newest {crashes.length} crash reports from this installation</p>
                          {crashes.map((c) => (
                            <details key={c.id} className="usr-crash-row">
                              <summary>
                                <span className={`usr-pill ${c.fatal ? "off" : ""}`}>{c.fatal ? "Fatal" : "Non-fatal"}</span>
                                <span className="mono">{(c.exceptionType ?? "Exception").replace(/^System\./, "")}</span>
                                <span className="adm-muted">{c.appVersion ?? ""} · {relative(c.timestamp, now)}</span>
                              </summary>
                              <p className="usr-crash-msg">{c.message}</p>
                              {c.stackTrace && <pre>{c.stackTrace}</pre>}
                            </details>
                          ))}
                        </>
                      )}
              {crashError && <p className="adm-status">{crashError}</p>}
            </div>
            <Section title="Record" rows={[
              ["Source", user.source === "posthog" ? "Imported from PostHog" : user.source === "app" ? "Registered by the app" : (user.source ?? "—")],
              ["First seen from", user.firstSeenSource ?? "—"], ["Claimed by an app", user.claimed ? "Yes" : "Not yet"],
              ["Created", time(user.createdAt)], ["Updated", time(user.updatedAt)],
            ]} />
          </div>
        )}
      </aside>
    </>
  );
}

function IdCopy({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button type="button" className="usr-copy" aria-label="Copy installation ID"
      onClick={() => navigator.clipboard?.writeText(id).then(() => { setCopied(true); window.setTimeout(() => setCopied(false), 1200); }).catch(() => {})}>
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

function Section({ title, rows }: { title: string; rows: [string, React.ReactNode][] }) {
  return (
    <section className="usr-section">
      <h3>{title}</h3>
      <dl>
        {rows.map(([label, value]) => (
          <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
        ))}
      </dl>
    </section>
  );
}
