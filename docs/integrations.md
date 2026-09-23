# Connecting the ecosystem to the terminal

What Claude Code — or you, or a cron job — can reach directly, how the
credentials work, and what has to stay manual.

Run this first. It works before anything is configured:

```sh
cd website && npm run integrations:check
```

It reports four states, and the difference between the middle two is the point
of the whole thing:

| | Meaning |
|---|---|
| `✓` | Configured **and the service answered**. The only state worth trusting |
| `·` | Not set up yet. Not a failure, and does not fail the command |
| `✗` | Configured and **rejected** — a wrong, expired or under-scoped credential |
| `!` | Accepted, but the service or the site is unhappy about something |

`✓` never means "a variable is set". Every check does something real against the
service, because a token that exists and a token that is accepted are different
facts and only the second one matters.

---

## Architecture

```
                         ┌──────────────────────────────┐
   your terminal ──────▶ │  npm run integrations:check  │
   (Claude Code)         └──────────────┬───────────────┘
                                        │
         ┌──────────────────────────────┼──────────────────────────────┐
         │                              │                              │
   ── already authenticated ──    ── .env.local ──            ── no credential ──
         │                              │                              │
    ┌────┴─────┐                 ┌──────┴───────┐                ┌─────┴──────┐
    │ wrangler │ Cloudflare      │ service acct │ Search Console │ live site  │
    │   (OAuth │  Pages,         │   (JWT →     │  GA4 Data API  │  HTTP only │
    │ keychain)│  deployments    │  access tok) │                │            │
    ├──────────┤                 ├──────────────┤                └────────────┘
    │   gh     │ GitHub repos,   │ CLARITY_API_ │ Clarity
    │  (OAuth  │  releases,      │    TOKEN     │  Data Export
    │ keychain)│  issues, PRs    ├──────────────┤
    └──────────┘                 │ BING_WEB…KEY │ Bing Webmaster
                                 ├──────────────┤
                                 │ CLOUDFLARE_  │ DNS + zone only
                                 │  API_TOKEN   │  (optional)
                                 └──────────────┘
```

Two credential stores, chosen deliberately:

- **The macOS keychain**, via `wrangler` and `gh`. Encrypted at rest, unlocked
  with the login session, and the token never exists in a file that can be
  copied, backed up or committed. Where a CLI already holds a grant, nothing
  new is minted.
- **`.env.local`**, for the four services with no CLI. Gitignored, never
  `NEXT_PUBLIC_`, never deployed.

Anything that needed neither — the live site itself — is checked over plain HTTP
with no credential at all, which is why that section always runs.

---

## Authentication flow

### Google (Search Console + GA4) — service account, not OAuth

OAuth needs a browser and a person, which makes it useless to a script that has
to run unattended. A service account is a credential the machine holds:

```
  key file (RSA private key)
        │
        ▼  sign a JWT:  { iss: service-account, scope: …readonly, aud: token endpoint }
  POST https://oauth2.googleapis.com/token
        │  grant_type = urn:ietf:params:oauth:grant-type:jwt-bearer
        ▼
  access token, one hour
        │
        ├──▶ searchconsole.googleapis.com/webmasters/v3/…
        └──▶ analyticsdata.googleapis.com/v1beta/properties/…
```

The JWT is assembled with node's own `crypto` — three base64url segments and a
signature. A library for that would be more surface area than code.

**The account can read nothing until you share a property with it.** That is the
security model, not an inconvenience: the key on this machine is inert until
someone deliberately grants it access inside each product, and revoking is done
per product without touching the key.

### Cloudflare and GitHub — reuse what is already granted

Both CLIs hold an OAuth token in the keychain from an interactive login. The
checks shell out to them. No second credential, no rotation to remember, no
permission set to get wrong.

`CLOUDFLARE_API_TOKEN` is the one exception, and only for DNS and zone
settings — `wrangler`'s OAuth scopes cover Pages and Workers but not zone reads.

### Clarity and Bing — plain bearer keys

No OAuth offered. Generated in each dashboard, pasted into `.env.local`.

---

## Setup, in the order that makes each step verifiable

Nothing here is required. Do the ones you want; the rest keep reporting `·`.

### Already done — nothing to do

```sh
gh auth status                 # keychain, scopes: repo, workflow, read:org, gist
npx wrangler whoami            # OAuth, account visible
```

### 1. Google service account (unlocks Search Console **and** GA4)

**Full console walkthrough: [google-service-account.md](./google-service-account.md).**
`npm run google:doctor` checks each step and stops at the first one that is
wrong. The condensed version, if you have `gcloud`:

```sh
# Pick or create a project, then enable both APIs.
gcloud projects create sharancreatedthis-seo          # or use an existing one
gcloud config set project sharancreatedthis-seo
gcloud services enable searchconsole.googleapis.com analyticsdata.googleapis.com

# One account for both.
gcloud iam service-accounts create seo-reader \
  --display-name="Read-only SEO and analytics"

# The key. Keep it outside the repository.
mkdir -p ~/.config/gcloud
gcloud iam service-accounts keys create ~/.config/gcloud/sharancreatedthis-seo.json \
  --iam-account=seo-reader@sharancreatedthis-seo.iam.gserviceaccount.com
chmod 600 ~/.config/gcloud/sharancreatedthis-seo.json
```

No `gcloud`? Do the same in the console: **APIs & Services → Credentials →
Create credentials → Service account**, then **Keys → Add key → JSON**.

Then grant it access, which is two separate acts in two separate products:

1. **Search Console → Settings → Users and permissions → Add user** —
   the `seo-reader@….iam.gserviceaccount.com` address, permission **Full** or
   **Restricted**. Restricted is enough for everything here.
2. **GA4 → Admin → Property access management → Add users** — same address,
   role **Viewer**. Also copy the **numeric property id** from
   **Admin → Property details** while you are there. It is not the `G-` id.

```sh
cd website
cp .env.integrations.example .env.local
# set GOOGLE_SERVICE_ACCOUNT_JSON and GA4_PROPERTY_ID
npm run integrations:check google
```

### 2. Microsoft Clarity

**Clarity → Settings → Data export → Generate new API token.** Per project;
generate it against `ymfvvjj5ij`.

```sh
# CLARITY_API_TOKEN=… in .env.local
npm run integrations:check clarity
```

### 3. Bing Webmaster Tools

**Bing Webmaster Tools → Settings → API access → API key.**

```sh
# BING_WEBMASTER_API_KEY=… in .env.local
npm run integrations:check bing
```

### 4. Cloudflare DNS (optional)

**dash.cloudflare.com → My Profile → API Tokens → Create Token → Custom token**

| Permission | Level | Scope |
|---|---|---|
| Zone → Zone | **Read** | `sharancreatedthis.in` |
| Zone → DNS | **Read** | `sharancreatedthis.in` |
| Zone → Zone WAF | **Read** | only to list redirect rules |

All Read, deliberately. Nothing in this repository writes DNS.

---

## Security review

**What each credential can do, in the worst case.**

| Credential | Worst case if leaked | Blast radius |
|---|---|---|
| `gh` keychain token | `repo`, `workflow` — can push and alter CI | **High.** Scoped by GitHub; revoke at github.com/settings/tokens |
| `wrangler` OAuth | Deploy Pages, write Workers/KV/D1 | **High.** Revoke at dash.cloudflare.com → API Tokens |
| Google service account | **Read only** — Search Console and GA4 data | **Low.** Cannot write, cannot spend, cannot touch the site |
| `CLOUDFLARE_API_TOKEN` | **Read only** as specified above | **Low** |
| `CLARITY_API_TOKEN` | Read aggregate analytics | **Low** |
| `BING_WEBMASTER_API_KEY` | **Can submit URLs**, not only read | **Medium.** The only write-capable key in `.env.local` |

**Decisions worth stating:**

- **Read-only by default.** Every credential that could be read-only is. Bing's
  is the exception because Bing does not offer a read-only key — worth knowing
  when deciding where that one lives.
- **Keychain over file** wherever a CLI already offers it. Two of the six
  highest-privilege grants are therefore not in any file on disk.
- **No secret is `NEXT_PUBLIC_`.** Nothing here reaches the browser or the
  deployment. The values that *are* public — the GA measurement id, the Clarity
  id, the IndexNow key — live in `.env.production` and are committed, because
  they ship in the page source regardless and hiding them from you hides them
  from nobody else.
- **`.env.local` is gitignored**, verified: `git check-ignore` matches it
  against `.env*.local`.
- **Keys belong outside the repository.** The example points
  `GOOGLE_SERVICE_ACCOUNT_JSON` at `~/.config/gcloud/`, `chmod 600`, and takes a
  path rather than inline JSON so the key never enters a shell history or a
  process listing.

**If something leaks:** revoke first, rotate second, and check
`git log -p -- '*.env*'` for anything that was ever committed. A key removed in
a later commit is still in the history and still valid.

---

## What Claude Code cannot reach, and why

| Wanted | Possible? | Why |
|---|---|---|
| Clarity **recordings** and **heatmap images** | **No** | Clarity's Data Export API returns aggregates only — traffic, popular pages, browsers, dead-click and rage-click counts. Recordings and heatmaps exist solely in the dashboard. No API, official or otherwise |
| GSC **"Couldn't fetch"** for a specific sitemap | **Partly** | The API returns `lastDownloaded`, `errors` and `warnings`, which is enough to tell whether Google ever fetched it. The UI's wording is not exposed |
| **Forcing** Google to recrawl | **No** | The Indexing API is restricted to `JobPosting` and `BroadcastEvent`. Using it for ordinary pages is against the terms. IndexNow covers Bing and Yandex; Google has no equivalent |
| **Interactive OAuth** for MCP servers | **No** | The flow needs a browser and a person. Claude Code cannot complete it, which is why the Google integration uses a service account |
| GA4 **configuration** — key events, custom dimensions | **No** | The Admin API can, but it needs write scope and edit rights. Deliberately not granted: nothing here should be able to reshape your analytics |
| Cloudflare **cache purge**, DNS **writes** | Possible, not granted | The token above is Read. Add `Cache Purge` or `DNS:Edit` if you want it, knowing what that widens |
| **Apple Search / Siri** data | **No** | No API exists. Applebot is allowed in `robots.txt`; that is the whole of the available surface |

---

## Recommended MCP servers

MCP servers give Claude a tool interface rather than a shell. They need an
**interactive** OAuth login, which cannot happen inside a Claude Code run — add
them from a terminal you are sitting at.

| Platform | Server | Worth it? |
|---|---|---|
| Cloudflare | `plugin:cloudflare:cloudflare` (already installed, needs auth) | **Yes.** Covers Workers, Pages, DNS, analytics and logs through one grant. Run `/mcp` in an interactive session and authorise |
| GitHub | `github/github-mcp-server` | **Marginal.** `gh` already does everything here and is authenticated. Worth it if you want issue and PR work without shelling out |
| Google Analytics | `googleanalytics/google-analytics-mcp` | **Maybe.** The service account above already covers reporting. An MCP server is nicer for ad-hoc questions |
| Search Console | community servers only | **No.** Nothing official; the scripts here use the documented API directly |
| Clarity, Bing | none exist | Use the scripts |

The rule worth applying: **an MCP server that duplicates an authenticated CLI
adds a credential without adding a capability.** Cloudflare's is the one that
genuinely widens what is reachable.

---

## Automated monitoring worth setting up

Each of these is a real failure that is currently silent.

| Watch for | How | Why it matters |
|---|---|---|
| A deploy that broke an endpoint | `npm run integrations:check` in CI after deploy; non-zero exit fails it | Catches a 404 on the sitemap or a download route before a user does |
| The sitemap never being fetched | `lastDownloaded` from the Search Console check | This is exactly the "Couldn't fetch" you saw, visible as data rather than a dashboard string |
| Download events stopping | GA4 `download` count over 7 days | A tracking regression looks identical to nobody downloading. Only a baseline tells them apart |
| The IndexNow key drifting | Already enforced — `check-seo.mjs` fails the build | A mismatched key means every submission is refused, visible only to whoever runs `ping` |
| A Hangly Windows release not reaching the site | `gh release list` newest tag vs the tag in `public/_redirects` | The download button would quietly serve an old build |
| Certificate or DNS change | Cloudflare DNS check diffed against a stored copy | A record edited by accident is otherwise noticed by users first |

A reasonable first automation, once the credentials are in:

```sh
# Daily, and after every deploy.
cd website && npm run integrations:check || notify "integrations degraded"
```

`--json` gives machine-readable output. Use `--silent`, or call node directly,
so npm's banner does not end up in front of the JSON:

```sh
npm run --silent integrations:json | jq '.[] | select(.rows[].status == "denied")'
node scripts/integrations/check.mjs --json | jq .
```

A single service can be checked on its own, which is the fast loop while
setting one up:

```sh
npm run integrations:check google
npm run integrations:check clarity
```
