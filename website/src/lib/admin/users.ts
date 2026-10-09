/**
 * The Users page's one way in: the `adminUsers` callable in the Hangly repository (firebase/functions/src/adminApi.ts),
 * which admits only the owner. /users itself stays closed to the browser (firestore.rules); every row comes through
 * that function, a page at a time.
 *
 * Called over the callable protocol with fetch rather than the SDK's httpsCallable, so a search that is overtaken by
 * the next keystroke is aborted on the wire, not just ignored when it lands.
 */
import { auth, EMULATED } from "./firebase";

const ENDPOINT = EMULATED
  ? "http://127.0.0.1:5001/hangly-sm/asia-south1/adminUsers"
  : "https://asia-south1-hangly-sm.cloudfunctions.net/adminUsers";

export type Platform = "macos" | "windows";
export type Status = "installed" | "uninstalled";
export type Activity = "1d" | "7d" | "30d" | "inactive30";
export type SortName = "lastSeen" | "firstSeen" | "name" | "version" | "activeDays" | "crashCount";
export type Direction = "asc" | "desc";

export interface Query {
  q: string;
  platform: Platform | null;
  versions: string[];
  status: Status | null;
  activity: Activity | null;
  country: string | null;
  region: string | null;
  city: string | null;
  architecture: "x64" | "arm64" | "unknown" | null;
  sort: SortName;
  dir: Direction;
  pageSize: 25 | 50 | 100;
}

export interface UserRow {
  id: string;
  nickname: string;
  platform: string | null;
  appVersion: string | null;
  reportedVersion: string | null;
  firstAppVersion: string | null;
  previousAppVersion: string | null;
  appVersionChangedAt: number | null;
  osName: string | null;
  osVersion: string | null;
  architecture: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  firstSeen: number | null;
  firstSeenSource: string | null;
  lastSeen: number | null;
  activeDays: number;
  retentionDays: number;
  crashCount: number;
  nonFatalCount: number;
  lastCrashAt: number | null;
  installed: boolean;
  uninstalledAt: number | null;
  reinstallCount: number;
  source: string | null;
  createdAt: number | null;
  updatedAt: number | null;
  claimed: boolean;
}

export interface CrashRow {
  id: string;
  timestamp: number | null;
  occurredAt: string | null;
  appVersion: string | null;
  exceptionType: string | null;
  message: string;
  source: string | null;
  fatal: boolean;
  stackTrace: string;
}

export interface Page { rows: UserRow[]; next: string | null; partial: boolean }

/** What the function said when it refused: its code and its own words, shown as they are. */
export class AdminError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
  }
}

async function call<T>(data: Record<string, unknown>, signal?: AbortSignal): Promise<T> {
  const user = auth().currentUser;
  if (!user) throw new AdminError("unauthenticated", "Sign in first.");
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` },
    body: JSON.stringify({ data }),
    signal,
  });
  const body = await response.json().catch(() => null) as { result?: T; error?: { status?: string; message?: string } } | null;
  if (!response.ok || !body || body.error || body.result === undefined) {
    const status = body?.error?.status?.toLowerCase().replace(/_/g, "-") ?? `http-${response.status}`;
    throw new AdminError(status, body?.error?.message ?? "The request did not complete.");
  }
  return body.result;
}

/** The query as the function takes it: empty filters left out. */
function filters(query: Query): Record<string, unknown> {
  return Object.fromEntries(Object.entries({
    q: query.q.trim() || undefined,
    platform: query.platform ?? undefined,
    versions: query.versions.length ? query.versions : undefined,
    status: query.status ?? undefined,
    activity: query.activity ?? undefined,
    country: query.country ?? undefined,
    region: query.region ?? undefined,
    city: query.city ?? undefined,
    architecture: query.architecture ?? undefined,
    sort: query.sort,
    dir: query.dir,
    pageSize: query.pageSize,
  }).filter(([, v]) => v !== undefined));
}

export const listUsers = (query: Query, cursor: string | null, signal?: AbortSignal) =>
  call<Page>({ action: "list", ...filters(query), cursor }, signal);

export const countUsers = (query: Query, signal?: AbortSignal) =>
  call<{ count: number; exact: boolean }>({ action: "count", ...filters(query) }, signal);

export const getUser = (id: string, signal?: AbortSignal) => call<{ user: UserRow }>({ action: "get", id }, signal);

export const crashesFor = (id: string, signal?: AbortSignal) => call<{ crashes: CrashRow[] }>({ action: "crashes", id }, signal);

export const exportUsers = (query: Query) =>
  call<{ csv: string; rows: number; truncated: boolean }>({ action: "export", ...filters(query) });

// MARK: - What the page may combine (the function enforces the same: adminUsers.ts parseListRequest)

export const DEFAULT_DIR: Record<SortName, Direction> = {
  lastSeen: "desc", firstSeen: "desc", name: "asc", version: "desc", activeDays: "desc", crashCount: "desc",
};

/** The same split the function makes: part of an installation ID, or words. */
export const looksLikeId = (q: string) => /^[0-9a-f-]{6,36}$/i.test(q.trim()) && /\d/.test(q);
/** Part of an installation ID too short to look up as one (the server's searchPlan wants six): it is searched as a word. */
export const looksLikeShortId = (q: string) => /^[0-9a-f-]{2,5}$/i.test(q.trim()) && /\d/.test(q);

/** The filters other than the platform that are set. */
export function otherFilters(query: Query): string[] {
  return [
    query.versions.length ? "version" : "", query.status ? "status" : "", query.activity ? "activity" : "",
    query.country ? "country" : "", query.region ? "region" : "", query.city ? "city" : "",
    query.architecture ? "architecture" : "",
  ].filter(Boolean);
}
