/**
 * Shared plumbing for the integration checks.
 *
 * Every service reports the same three-part result — reachable, authenticated,
 * and what it actually returned — so that "configured" never gets confused with
 * "working". A token that exists and a token that is accepted are different
 * facts, and the second one is the only one worth knowing.
 */

import { execFileSync } from "node:child_process";
import "../load-env.mjs";

export const SITE = "https://www.sharancreatedthis.in";
/** Search Console wants the property exactly as it was verified. */
export const GSC_PROPERTY = process.env.GSC_SITE_URL ?? "sc-domain:sharancreatedthis.in";

export const STATUS = {
  ok: "ok",
  /** Reachable, but nothing is configured yet. Not a failure. */
  unconfigured: "unconfigured",
  /** Configured but rejected — a wrong or expired credential. */
  denied: "denied",
  /** Configured, accepted, and the service itself is unhappy. */
  error: "error",
};

export function result(name, status, detail, extra = {}) {
  return { name, status, detail, ...extra };
}

/** A fetch that never throws: a network failure is a result, not a crash. */
export async function request(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(options.timeoutMs ?? 20_000),
    });
    const text = await response.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {
      /* Not every API answers in JSON, and an error page never does. */
    }
    return { ok: response.ok, status: response.status, json, text };
  } catch (error) {
    return { ok: false, status: 0, json: null, text: String(error.message ?? error) };
  }
}

/** Runs a CLI that is already authenticated, rather than minting a new token. */
export function cli(command, args) {
  try {
    return {
      ok: true,
      out: execFileSync(command, args, {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        timeout: 60_000,
      }),
    };
  } catch (error) {
    return { ok: false, out: `${error.stderr ?? ""}${error.stdout ?? ""}` || String(error.message) };
  }
}

/**
 * A Google access token from a service-account key, signed here.
 *
 * Service account rather than OAuth on purpose: OAuth needs a browser and a
 * human, which makes it useless to a script that has to run unattended. A
 * service account is a credential the machine holds, and it is read-only
 * everywhere it is used — see docs/integrations.md for the scopes.
 *
 * The JWT is assembled with node's own crypto rather than a dependency,
 * because the whole of it is three base64url segments and a signature, and a
 * library here would be more surface area than code.
 */
export async function googleAccessToken(scopes) {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) return { token: null, reason: "GOOGLE_SERVICE_ACCOUNT_JSON is not set" };

  let key;
  try {
    // Accept either the JSON itself or a path to the downloaded key file.
    key = raw.trim().startsWith("{")
      ? JSON.parse(raw)
      : JSON.parse((await import("node:fs")).readFileSync(raw.trim(), "utf8"));
  } catch (error) {
    return { token: null, reason: `could not read the key: ${error.message}` };
  }
  if (!key.client_email || !key.private_key) {
    return { token: null, reason: "the key has no client_email or private_key" };
  }

  const { createSign } = await import("node:crypto");
  const b64 = (value) =>
    Buffer.from(typeof value === "string" ? value : JSON.stringify(value))
      .toString("base64url");

  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: key.client_email,
    scope: scopes.join(" "),
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };
  const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64(claim)}`;
  const signature = createSign("RSA-SHA256").update(unsigned).sign(key.private_key, "base64url");

  const response = await request("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${signature}`,
    }),
  });

  if (!response.ok) {
    return {
      token: null,
      reason: `Google refused the assertion (${response.status}): ${
        response.json?.error_description ?? response.text.slice(0, 160)
      }`,
      serviceAccount: key.client_email,
    };
  }
  return { token: response.json.access_token, serviceAccount: key.client_email };
}
