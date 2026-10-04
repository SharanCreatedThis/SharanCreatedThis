/**
 * Announcements: the broadcasts Hangly shows under the charm, written from /admin/notifications.
 *
 * The limits here are the same as Firestore's rules (Hangly repository: firebase/firestore.rules), the endpoint that
 * serves them (functions/src/announcements.ts) and both apps. The rules are the guard; this is so the form says what
 * is wrong before the rules refuse it.
 */
import { Timestamp } from "firebase/firestore";

export const LIMITS = {
  title: 60,
  message: 200,
  actionTarget: 300,
  actionLabel: 24,
  minDuration: 5,
  maxDuration: 300,
  maxWindowDays: 90,
} as const;

export type ActionType = "none" | "openLibrary" | "openCharm" | "openCreate" | "openNotifications" | "openUrl";
export type Priority = "low" | "normal" | "high";
export type Platform = "mac" | "windows";
export type Audience = "all" | "test";

export const ACTIONS: { value: ActionType; label: string; button: string | null; hint: string }[] = [
  { value: "openLibrary", label: "Open Library", button: "Open Library", hint: "Opens the Library, on a collection if you pick one." },
  { value: "openCharm", label: "Show a charm", button: "Show Charm", hint: "Opens the Library describing one charm. Nothing is hung." },
  { value: "openCreate", label: "Open Create", button: "Open Create", hint: "Opens Creator Studio." },
  { value: "openUrl", label: "Open a link", button: "Open", hint: "Opens a page on sharancreatedthis.in, Instagram or YouTube." },
  { value: "none", label: "No button", button: null, hint: "Something to read; no button." },
];

export const PRIORITIES: { value: Priority; label: string; hint: string }[] = [
  { value: "normal", label: "Normal", hint: "A pop-up under the charm, after anything already waiting." },
  { value: "high", label: "High", hint: "A pop-up before anything else, the update reminder included." },
  { value: "low", label: "Low", hint: "A pop-up after every normal one. Nothing is kept once it has gone." },
];

/** The collections' IDs, as both apps name them (CharmCollection on macOS, the catalogue on Windows). */
export const COLLECTIONS: { id: string; name: string }[] = [
  { id: "marvel", name: "Marvel" },
  { id: "dc", name: "DC" },
  { id: "tamilSpiritual", name: "Spirituality" },
  { id: "bts", name: "BTS" },
  { id: "footballLegends", name: "Football Legends" },
  { id: "musicLegends", name: "Music Legends" },
  { id: "friends", name: "Friends" },
  { id: "breakingBad", name: "Breaking Bad" },
  { id: "strangerThings", name: "Stranger Things" },
  { id: "onePiece", name: "One Piece" },
  { id: "harryPotter", name: "Harry Potter" },
  { id: "ben10", name: "Ben 10" },
  { id: "attackOnTitan", name: "Attack on Titan" },
  { id: "naruto", name: "Naruto" },
  { id: "gameOfThrones", name: "Game of Thrones" },
  { id: "airJordan", name: "Air Jordan" },
  { id: "pokemon", name: "Pokémon" },
];

/** What the form holds. Times are local `datetime-local` strings. */
export type Draft = {
  title: string;
  message: string;
  actionType: ActionType;
  actionTarget: string;
  actionLabel: string;
  priority: Priority;
  platforms: Platform[];
  audience: Audience;
  durationSeconds: number;
  startAt: string;
  expireAt: string;
};

/** As stored. `createdAt` and `createdBy` are the server's and the signed-in owner's. */
export type Announcement = {
  title: string;
  message: string;
  actionType: ActionType;
  actionTarget: string;
  actionLabel?: string;
  priority: Priority;
  platforms: Platform[];
  audience: Audience;
  durationSeconds: number;
  startAt: Timestamp;
  expireAt: Timestamp;
  createdAt: Timestamp | null;
  createdBy: string;
};

/** `yyyy-MM-ddTHH:mm` in local time, for a datetime-local input. */
export function localInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function emptyDraft(now = new Date()): Draft {
  return {
    title: "",
    message: "",
    actionType: "openLibrary",
    actionTarget: "",
    actionLabel: "",
    priority: "normal",
    platforms: ["mac", "windows"],
    audience: "all",
    durationSeconds: 30,
    startAt: localInput(now),
    expireAt: localInput(new Date(now.getTime() + 7 * 24 * 3600_000)),
  };
}

export function draftFrom(a: Announcement): Draft {
  return {
    title: a.title,
    message: a.message,
    actionType: a.actionType,
    actionTarget: a.actionTarget,
    actionLabel: a.actionLabel ?? "",
    priority: a.priority,
    platforms: a.platforms,
    audience: a.audience,
    durationSeconds: a.durationSeconds,
    startAt: localInput(new Date()),
    expireAt: localInput(new Date(Date.now() + 7 * 24 * 3600_000)),
  };
}

const COLLECTION_ID = /^[A-Za-z0-9]{1,40}$/;
const CHARM_ID = /^[A-Za-z0-9_-]{1,64}$/;

/** Every problem with the draft, by field. Empty means it can be sent. */
export function validate(d: Draft): Partial<Record<keyof Draft, string>> {
  const errors: Partial<Record<keyof Draft, string>> = {};
  const title = d.title.trim(), message = d.message.trim(), target = d.actionTarget.trim();
  if (!title) errors.title = "A title is needed.";
  // UTF-16 units, as Firestore's rules count them: an emoji such as 🔔 uses two of the sixty.
  else if (title.length > LIMITS.title) errors.title = `At most ${LIMITS.title} characters (an emoji counts as two).`;
  if (!message) errors.message = "A message is needed.";
  else if (message.length > LIMITS.message) errors.message = `At most ${LIMITS.message} characters (an emoji counts as two).`;
  if (d.actionLabel.trim().length > LIMITS.actionLabel) errors.actionLabel = `At most ${LIMITS.actionLabel} characters.`;

  switch (d.actionType) {
    case "openLibrary":
      if (target && !COLLECTION_ID.test(target)) errors.actionTarget = "Pick a collection, or the whole Library.";
      break;
    case "openCharm":
      if (!CHARM_ID.test(target)) errors.actionTarget = "A charm ID, such as spiderMan.";
      break;
    case "openUrl":
      if (!linkAllowed(target)) {
        errors.actionTarget = "An https:// link on sharancreatedthis.in, instagram.com, youtube.com or youtu.be.";
      }
      break;
    default:
      break;
  }

  if (d.platforms.length === 0) errors.platforms = "Pick at least one.";
  if (!Number.isInteger(d.durationSeconds) || d.durationSeconds < LIMITS.minDuration || d.durationSeconds > LIMITS.maxDuration) {
    errors.durationSeconds = `${LIMITS.minDuration}–${LIMITS.maxDuration} seconds.`;
  }
  const start = new Date(d.startAt), expire = new Date(d.expireAt);
  if (Number.isNaN(start.getTime())) errors.startAt = "When should it start?";
  if (Number.isNaN(expire.getTime())) errors.expireAt = "When should it end?";
  else if (expire <= start) errors.expireAt = "Must be after the start.";
  else if (expire.getTime() - start.getTime() > LIMITS.maxWindowDays * 24 * 3600_000) errors.expireAt = `At most ${LIMITS.maxWindowDays} days after the start.`;
  else if (expire.getTime() <= Date.now()) errors.expireAt = "That is already over.";
  return errors;
}

/** The document to write, without createdAt and createdBy (the page adds those). */
export function toDocument(d: Draft) {
  const target = d.actionType === "none" || d.actionType === "openCreate" || d.actionType === "openNotifications" ? "" : d.actionTarget.trim();
  const label = d.actionLabel.trim();
  return {
    title: d.title.trim(),
    message: d.message.trim(),
    actionType: d.actionType,
    actionTarget: target,
    ...(label && d.actionType !== "none" ? { actionLabel: label } : {}),
    priority: d.priority,
    platforms: [...new Set(d.platforms)],
    audience: d.audience,
    durationSeconds: d.durationSeconds,
    startAt: Timestamp.fromDate(new Date(d.startAt)),
    expireAt: Timestamp.fromDate(new Date(d.expireAt)),
  };
}

/**
 * A random document ID: `a_k3x9q2m7d1zp`. Random, not made from the title, because the apps report it in analytics
 * (`notification_id`), and no event may carry a notification's words.
 */
export function newId(): string {
  const bytes = new Uint8Array(9);
  crypto.getRandomValues(bytes);
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  return "a_" + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

/** Where "Open a link" may go: the same list as firestore.rules, the endpoint and both apps. */
export const LINK_HOSTS = ["sharancreatedthis.in", "instagram.com", "youtube.com", "youtu.be"];

export function linkAllowed(target: string): boolean {
  if (target.length > LIMITS.actionTarget || !/^https:\/\/[a-z0-9.-]+(\/[^\s]*)?$/.test(target)) return false;
  try {
    const url = new URL(target);
    if (url.protocol !== "https:" || url.username || url.password || url.port) return false;
    return LINK_HOSTS.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
}

export type Status = "scheduled" | "live" | "expired";

export function statusOf(a: Announcement, now = Date.now()): Status {
  if (a.expireAt.toMillis() <= now) return "expired";
  return a.startAt.toMillis() > now ? "scheduled" : "live";
}

/** The button's words, as the apps work them out. */
export function buttonTitle(type: ActionType, label: string): string | null {
  if (type === "none") return null;
  if (label.trim()) return label.trim();
  return ACTIONS.find((a) => a.value === type)?.button ?? "Open";
}
