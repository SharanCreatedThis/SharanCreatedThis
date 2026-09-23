/**
 * Microsoft Clarity, through its Data Export API.
 *
 * Worth knowing before relying on this: Clarity's API returns *aggregates* —
 * traffic, popular pages, browsers, and the counts behind its dead-click and
 * rage-click signals. It does not return recordings or heatmap images, and no
 * official API does. Those stay in the dashboard, which is a product decision
 * rather than a missing endpoint, and no amount of scripting changes it.
 *
 * The API is also rate limited to a small number of requests per project per
 * day, so this is a health check and a reporting tool, not something to poll.
 */

import { STATUS, request, result } from "./lib.mjs";

export async function check() {
  const token = process.env.CLARITY_API_TOKEN;
  const project = process.env.NEXT_PUBLIC_CLARITY_ID;
  if (!token) {
    return [result("Clarity · Data Export API", STATUS.unconfigured,
      "needs CLARITY_API_TOKEN — Clarity → Settings → Data export → generate an API token")];
  }

  const response = await request(
    "https://www.clarity.ms/export-data/api/v1/project-live-insights?numOfDays=3",
    { headers: { authorization: `Bearer ${token}` } },
  );

  if (response.status === 401 || response.status === 403) {
    return [result("Clarity · Data Export API", STATUS.denied,
      `token rejected (${response.status}) — tokens are per project; check it was generated for ymfvvjj5ij`)];
  }
  if (response.status === 429) {
    return [result("Clarity · Data Export API", STATUS.error,
      "rate limited — Clarity allows only a handful of exports per project per day")];
  }
  if (!response.ok) {
    return [result("Clarity · Data Export API", STATUS.error, `${response.status}: ${response.text.slice(0, 140)}`)];
  }

  const sets = Array.isArray(response.json) ? response.json : [];
  const traffic = sets.find((s) => s.metricName === "Traffic");
  const sessions = traffic?.information?.[0]?.totalSessionCount;
  // A Clarity token is scoped to one project, so a token that works is itself
  // the project check — there is no separate "is this project alive" endpoint.
  return [result(`Clarity · project ${project ?? "(id unknown)"}`, STATUS.ok,
    sets.length
      ? `${sets.length} metric sets over 3 days${sessions ? `, ${sessions} sessions` : ""}`
      : "connected, no data in the window yet",
    { metrics: sets.map((s) => s.metricName) })];
}
