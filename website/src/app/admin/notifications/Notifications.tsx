"use client";

/**
 * Admin → Notifications: write a broadcast, see it as the card it becomes, and manage what is out there.
 *
 * Writes announcements/{id} straight to Firestore, as the signed-in owner. The rules (Hangly repository,
 * firebase/firestore.rules) admit nobody else and check every field; this form checks the same things first so it
 * can say what is wrong. Installed apps fetch live announcements through the `announcements` function — within five
 * minutes for a new install's first fetch, and within six hours for one already running.
 *
 * Reads: one listener on the newest fifty announcements while this page is open.
 */
import { useEffect, useMemo, useState } from "react";
import { type User, onAuthStateChanged } from "firebase/auth";
import {
  Timestamp, collection, deleteDoc, doc, limit, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc,
} from "firebase/firestore";
import { auth, db, signInWithGoogle } from "@/lib/admin/firebase";
import {
  ACTIONS, type Announcement, COLLECTIONS, type Draft, LIMITS, PRIORITIES, type Platform, buttonTitle, draftFrom,
  emptyDraft, newId, statusOf, toDocument, validate,
} from "@/lib/admin/announcements";
import AdminShell from "../AdminShell";

type Row = { id: string; data: Announcement };

export default function Notifications() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [denied, setDenied] = useState(false);
  const [draft, setDraft] = useState<Draft>(() => emptyDraft());
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => onAuthStateChanged(auth(), setUser), []);
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(t);
  }, []);
  useEffect(() => {
    if (!user) return;
    setDenied(false);
    return onSnapshot(
      query(collection(db(), "announcements"), orderBy("createdAt", "desc"), limit(50)),
      (snap) => setRows(snap.docs.map((d) => ({ id: d.id, data: d.data() as Announcement }))),
      () => setDenied(true),
    );
  }, [user]);

  const errors = useMemo(() => validate(draft), [draft]);
  const valid = Object.keys(errors).length === 0;

  if (user === undefined) return <AdminShell section="notifications" title="Notifications"><p className="adm-muted">Checking sign-in…</p></AdminShell>;
  if (!user) {
    return (
      <AdminShell section="notifications" title="Notifications">
        <div className="adm-signin">
          <h2>Sign in</h2>
          <p className="adm-muted">Private. Only the owner&apos;s Google account can send notifications.</p>
          <button type="button" className="adm-button" onClick={() => signInWithGoogle().catch(() => {})}>Sign in with Google</button>
        </div>
      </AdminShell>
    );
  }
  if (denied) {
    return (
      <AdminShell user={user} section="notifications" title="Notifications">
        <p className="adm-status">Signed in as {user.email}, which cannot manage notifications.</p>
      </AdminShell>
    );
  }

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const error = (key: keyof Draft) => (touched && errors[key] ? <p className="ntf-error">{errors[key]}</p> : null);

  async function send() {
    setTouched(true);
    setStatus(null);
    if (!valid || !user?.email) return;
    const id = newId(draft.title);
    setBusy(true);
    try {
      await setDoc(doc(db(), "announcements", id), { ...toDocument(draft), createdAt: serverTimestamp(), createdBy: user.email });
      const live = new Date(draft.startAt).getTime() <= Date.now();
      setStatus({ kind: "ok", text: `Sent as ${id}. ${live ? "Live now" : "Scheduled"}${draft.audience === "test" ? ", testers only" : ""}.` });
      setDraft(emptyDraft());
      setTouched(false);
    } catch (err) {
      setStatus({ kind: "error", text: `Not sent: ${(err as { code?: string }).code ?? "error"}. Nothing was changed.` });
    } finally {
      setBusy(false);
    }
  }

  async function expire(row: Row) {
    if (!window.confirm(`Stop “${row.data.title}”? Apps drop it at their next check; anyone who already saw it keeps it in their history.`)) return;
    const nowStamp = Timestamp.now();
    // The rules need expireAt after startAt, so a scheduled one that never started starts a moment before it ends.
    const startAt = row.data.startAt.toMillis() < nowStamp.toMillis() ? row.data.startAt : Timestamp.fromMillis(nowStamp.toMillis() - 1000);
    await updateDoc(doc(db(), "announcements", row.id), { expireAt: nowStamp, startAt }).catch((err) =>
      setStatus({ kind: "error", text: `Could not expire: ${(err as { code?: string }).code ?? "error"}` }));
  }

  async function remove(row: Row) {
    if (!window.confirm(`Delete “${row.data.title}” for good? Use Expire to stop it and keep the record.`)) return;
    await deleteDoc(doc(db(), "announcements", row.id)).catch((err) =>
      setStatus({ kind: "error", text: `Could not delete: ${(err as { code?: string }).code ?? "error"}` }));
  }

  const action = ACTIONS.find((a) => a.value === draft.actionType)!;
  const priority = PRIORITIES.find((p) => p.value === draft.priority)!;

  return (
    <AdminShell user={user} section="notifications" title="Notifications">
      <div className="ntf-grid">
        <section className="adm-panel ntf-form" aria-label="New notification">
          <h2 className="adm-h2 ntf-h2">New notification</h2>

          <label className="ntf-field">
            <span>Title <em>{draft.title.length}/{LIMITS.title}</em></span>
            <input value={draft.title} maxLength={LIMITS.title + 10} placeholder="⚽ Football Pack" onChange={(e) => set("title", e.target.value)} />
            {error("title")}
          </label>

          <label className="ntf-field">
            <span>Message <em>{draft.message.length}/{LIMITS.message}</em></span>
            <textarea rows={3} value={draft.message} placeholder="6 New Charms Live" onChange={(e) => set("message", e.target.value)} />
            {error("message")}
          </label>

          <div className="ntf-row">
            <label className="ntf-field">
              <span>Action</span>
              <select value={draft.actionType} onChange={(e) => setDraft((d) => ({ ...d, actionType: e.target.value as Draft["actionType"], actionTarget: "" }))}>
                {ACTIONS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
              <small>{action.hint}</small>
            </label>
            {draft.actionType === "openLibrary" && (
              <label className="ntf-field">
                <span>Target</span>
                <select value={draft.actionTarget} onChange={(e) => set("actionTarget", e.target.value)}>
                  <option value="">The whole Library</option>
                  {COLLECTIONS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {error("actionTarget")}
              </label>
            )}
            {draft.actionType === "openCharm" && (
              <label className="ntf-field">
                <span>Charm ID</span>
                <input value={draft.actionTarget} placeholder="spiderMan" onChange={(e) => set("actionTarget", e.target.value)} />
                {error("actionTarget")}
              </label>
            )}
            {draft.actionType === "openUrl" && (
              <label className="ntf-field">
                <span>Link</span>
                <input value={draft.actionTarget} placeholder="https://www.sharancreatedthis.in/products/hangly" onChange={(e) => set("actionTarget", e.target.value)} />
                {error("actionTarget")}
              </label>
            )}
          </div>

          {draft.actionType !== "none" && (
            <label className="ntf-field">
              <span>Button label <em>optional · {action.button}</em></span>
              <input value={draft.actionLabel} maxLength={LIMITS.actionLabel + 5} placeholder={action.button ?? ""} onChange={(e) => set("actionLabel", e.target.value)} />
              {error("actionLabel")}
            </label>
          )}

          <div className="ntf-row">
            <fieldset className="ntf-field">
              <legend>Priority</legend>
              <div className="ntf-segment" role="radiogroup">
                {PRIORITIES.map((p) => (
                  <button key={p.value} type="button" role="radio" aria-checked={draft.priority === p.value}
                    className={draft.priority === p.value ? "on" : undefined} onClick={() => set("priority", p.value)}>{p.label}</button>
                ))}
              </div>
              <small>{priority.hint}</small>
            </fieldset>
            <fieldset className="ntf-field">
              <legend>Platforms</legend>
              <div className="ntf-checks">
                {(["mac", "windows"] as Platform[]).map((p) => (
                  <label key={p}>
                    <input type="checkbox" checked={draft.platforms.includes(p)}
                      onChange={(e) => set("platforms", e.target.checked ? [...draft.platforms, p] : draft.platforms.filter((x) => x !== p))} />
                    {p === "mac" ? "macOS" : "Windows"}
                  </label>
                ))}
              </div>
              {error("platforms")}
            </fieldset>
          </div>

          <div className="ntf-row three">
            <label className="ntf-field">
              <span>Start</span>
              <input type="datetime-local" value={draft.startAt} onChange={(e) => set("startAt", e.target.value)} />
              {error("startAt")}
            </label>
            <label className="ntf-field">
              <span>Expires</span>
              <input type="datetime-local" value={draft.expireAt} onChange={(e) => set("expireAt", e.target.value)} />
              {error("expireAt")}
            </label>
            <label className="ntf-field">
              <span>On screen <em>seconds</em></span>
              <input type="number" min={LIMITS.minDuration} max={LIMITS.maxDuration} value={draft.durationSeconds}
                onChange={(e) => set("durationSeconds", Math.round(Number(e.target.value)))} />
              {error("durationSeconds")}
            </label>
          </div>

          <label className="ntf-switch">
            <input type="checkbox" checked={draft.audience === "test"} onChange={(e) => set("audience", e.target.checked ? "test" : "all")} />
            <span>Testers only — shown just on installs marked as testers, to check it first.</span>
          </label>

          <div className="ntf-actions">
            <button type="button" className="adm-button" disabled={busy || (touched && !valid)} onClick={send}>
              {busy ? "Sending…" : draft.audience === "test" ? "Send to testers" : "Send to everyone"}
            </button>
            <button type="button" className="adm-link" onClick={() => { setDraft(emptyDraft()); setTouched(false); setStatus(null); }}>Clear</button>
          </div>
          {status && <p className={status.kind === "ok" ? "ntf-ok" : "adm-status"} role="status">{status.text}</p>}
          <p className="adm-muted ntf-note">
            Each install shows it once, under the charm, for its time on screen, then keeps it in its Notification Center.
            Running apps check every six hours; changes reach the endpoint within five minutes.
          </p>
        </section>

        <aside className="ntf-preview" aria-label="Preview">
          <p className="adm-caption">Preview</p>
          <CardPreview draft={draft} theme="dark" />
          <CardPreview draft={draft} theme="light" />
        </aside>
      </div>

      <h2 className="adm-h2">Sent</h2>
      {!rows ? <p className="adm-muted">Loading…</p> : rows.length === 0 ? <p className="adm-muted">Nothing yet.</p> : (
        <div className="adm-panel">
          <table className="adm-table ntf-table">
            <thead><tr><th>Notification</th><th>Status</th><th>Shows</th><th>Window</th><th /></tr></thead>
            <tbody>
              {rows.map((row) => {
                // Read against this moment, not the 30-second tick: "Expire now" sets the expiry to the present.
                const s = statusOf(row.data, Math.max(now, Date.now()));
                return (
                  <tr key={row.id}>
                    <td>
                      <strong>{row.data.title}</strong>
                      <div className="adm-muted">{row.data.message}</div>
                      <div className="mono adm-muted">{row.id}</div>
                    </td>
                    <td>
                      <span className={`ntf-chip ${s}`}>{s}</span>
                      {row.data.audience === "test" && <span className="ntf-chip test">testers</span>}
                    </td>
                    <td className="adm-muted">
                      {row.data.priority} · {row.data.platforms.map((p) => (p === "mac" ? "macOS" : "Windows")).join(", ")}
                      <br />{row.data.durationSeconds}s · {buttonTitle(row.data.actionType, row.data.actionLabel ?? "") ?? "no button"}
                      {row.data.actionTarget && <> → <span className="mono">{row.data.actionTarget}</span></>}
                    </td>
                    <td className="adm-muted">{when(row.data.startAt)}<br />→ {when(row.data.expireAt)}</td>
                    <td className="ntf-row-actions">
                      <button className="adm-link" onClick={() => { setDraft(draftFrom(row.data)); setTouched(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Duplicate</button>
                      {s !== "expired" && <button className="adm-link" onClick={() => expire(row)}>Expire now</button>}
                      <button className="adm-link danger" onClick={() => remove(row)}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}

const when = (t: Timestamp) => t.toDate().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

/** The card as the apps draw it: 296 points wide, 20-point corners, Hangly's indigo button. */
function CardPreview({ draft, theme }: { draft: Draft; theme: "dark" | "light" }) {
  const label = buttonTitle(draft.actionType, draft.actionLabel);
  const low = draft.priority === "low";
  return (
    <div className={`ntf-stage ${theme}`}>
      <div className="ntf-charm" aria-hidden />
      {low ? (
        <div className="ntf-bell"><span aria-hidden>🔔</span> 1</div>
      ) : (
        <div className="ntf-card">
          <p className="ntf-card-title">{draft.title.trim() || "Title"}</p>
          <p className="ntf-card-message">{draft.message.trim() || "Message"}</p>
          {label && <span className="ntf-card-button">{label}</span>}
        </div>
      )}
      <p className="ntf-stage-caption">{theme === "dark" ? "Dark" : "Light"}{low ? " · low priority: the bell only" : ` · ${draft.durationSeconds}s`}</p>
    </div>
  );
}
