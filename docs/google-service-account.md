# Connecting Search Console and GA4

One service account covers both. Roughly fifteen minutes, almost all of it
clicking through consoles.

**Check your progress at any point:**

```sh
cd website && npm run google:doctor
```

It checks seven things in the order they have to be done and stops at the first
one that is wrong, with the single instruction that fixes it. Google answers
`403` for at least four unrelated situations — API not enabled, account never
added, permission too low, wrong property id — and the code is identical while
the fix is not. Run it after every step below; it is faster than reading ahead.

---

## Why a service account and not "Sign in with Google"

OAuth needs a browser and a person at it. A script that runs from a terminal, or
from cron at four in the morning, has neither. A service account is a credential
the machine holds and uses without anyone present.

The part that makes it safe: **a service account starts with access to nothing.**
It is an identity, not a permission. It can read your Search Console data only
after you add its email address as a user in Search Console, and your analytics
only after you add it in GA4 — two deliberate, separate acts. Revoking either is
done in that product and does not touch the key.

Both scopes granted here are the `.readonly` ones. Nothing in `website/scripts/`
can change a property, a sitemap, or a report.

---

## Step 1 — a Google Cloud project

A project is just a container for the two APIs. An existing one is fine.

1. Open <https://console.cloud.google.com/projectcreate>
2. **Project name**: `sharancreatedthis-seo`
3. **Create**, then make sure it is the selected project in the top bar

No billing is needed. Both APIs have free quotas far above anything this uses.

---

## Step 2 — enable the three APIs

All three, or the account authenticates successfully and then gets `403` on
every call — which is the confusing failure the doctor exists to name.

1. <https://console.cloud.google.com/apis/library/searchconsole.googleapis.com>
   → **Enable**
2. <https://console.cloud.google.com/apis/library/analyticsdata.googleapis.com>
   → **Enable**
3. <https://console.cloud.google.com/apis/library/analyticsadmin.googleapis.com>
   → **Enable**

The third is optional in the sense that every report works without it. What it
buys is confirmation that the numeric property id you configured belongs to the
property you think it does, rather than to someone else's — worth thirty
seconds, given the id is a bare number with nothing self-describing about it.

Check the project name in the top bar before clicking. Enabling an API on the
wrong project is the most common way to end up stuck here.

Give it a minute to propagate.

### Which scope covers what

Three APIs, two scopes, both read-only:

| Scope | Unlocks |
|---|---|
| `webmasters.readonly` | Search Console: sites, sitemaps, search analytics, URL Inspection |
| `analytics.readonly` | **Both** the GA4 Data API and the GA4 Admin API's read methods |

The Admin API needs no scope of its own for reads, which is why there is no
third entry. The writable siblings are deliberately absent: `webmasters`
without the suffix would allow submitting and deleting sitemaps, and
`analytics.edit` would allow reshaping your reporting. Nothing here needs
either.

## Step 3 — create the service account

1. <https://console.cloud.google.com/iam-admin/serviceaccounts>
2. **Create service account**
   - **Name**: `seo-reader`
   - **Description**: `Read-only Search Console and GA4 access for the terminal`
3. **Create and continue**
4. **Grant this service account access to project** — **skip it**. Click
   **Continue**.

   This is worth doing deliberately. Project roles are about Google Cloud
   resources and grant nothing in Search Console or GA4; adding one here would
   widen what the key can do inside your Cloud project while doing nothing at
   all for what you actually want. The access that matters is granted in steps
   5 and 6, inside each product.
5. **Grant users access to this service account** — skip. **Done**.

**Copy the email address it was given.** It looks like:

```
seo-reader@sharancreatedthis-seo.iam.gserviceaccount.com
```

Steps 5 and 6 both need it.

---

## Step 4 — download the key

1. Click the service account → **Keys** tab
2. **Add key → Create new key → JSON → Create**
3. The file downloads. Move it somewhere outside the repository:

```sh
mkdir -p ~/.config/gcloud
mv ~/Downloads/sharancreatedthis-seo-*.json ~/.config/gcloud/sharancreatedthis-seo.json
chmod 600 ~/.config/gcloud/sharancreatedthis-seo.json
```

**This file is the credential.** Anyone holding it becomes the service account.
It is `chmod 600` so only your user can read it, and it is kept out of the
repository so it cannot be committed, even by accident.

Then point the tooling at it:

```sh
cd website
cp .env.integrations.example .env.local   # if you have not already
```

Edit `.env.local`:

```
GOOGLE_SERVICE_ACCOUNT_JSON=/Users/sharan/.config/gcloud/sharancreatedthis-seo.json
```

A path rather than the JSON itself, so the key never enters a shell history or
appears in a process listing.

```sh
npm run google:doctor     # steps 1 and 2 should now pass
```

---

## Step 5 — share Search Console with it

The account can see nothing until this is done.

1. <https://search.google.com/search-console> → select
   `sharancreatedthis.in`
2. **Settings → Users and permissions → Add user**
3. **Email**: the `seo-reader@…iam.gserviceaccount.com` address
4. **Permission**: **Restricted**

   Restricted covers every read in this repository. **Full** would additionally
   allow submitting sitemaps and changing settings, which nothing here needs.

```sh
npm run google:doctor     # steps 3 and 4 should now pass
```

If step 4 fails saying it can see other properties, `GSC_SITE_URL` is wrong. A
domain property verified by DNS — which yours is — is written:

```
GSC_SITE_URL=sc-domain:sharancreatedthis.in
```

Not a URL. The doctor prints the exact strings it can see; copy one.

---

## Step 6 — share GA4 with it

1. <https://analytics.google.com> → **Admin**
2. **Property access management** → **+** → **Add users**
3. **Email**: the same address
4. **Role**: **Viewer**. Uncheck *Notify new users by email* — a service
   account has no inbox.

While in Admin, get the property id:

**Admin → Property details** → the **Property ID**, a number like `483920174`.

**This is not the `G-P36BKMQ2NG` measurement id.** They are different
identifiers for different things, and the Data API only accepts the numeric one.

```
GA4_PROPERTY_ID=483920174
```

```sh
npm run google:doctor     # all seven should pass, plus 6b for the Admin API
```

---

## Step 7 — register the custom dimensions

Step 7 of the doctor warns rather than fails, because download tracking works
without this. What does not work is *reporting* on it.

GA4 receives `platform`, `source` and `reason` on every download event, but
**will not let anything query a custom parameter until it is registered** —
including the API. Until then the events are a bare count.

**GA4 → Admin → Custom definitions → Create custom dimension**, three times:

| Dimension name | Scope | Event parameter |
|---|---|---|
| `platform` | Event | `platform` |
| `source` | Event | `source` |
| `reason` | Event | `reason` |

**Not retroactive.** Data that arrives before the dimension exists is never
backfilled, so this is worth doing before the traffic you care about.

---

## What you can ask for once it works

```sh
cd website
npm run google -- <command>
```

| Command | Answers |
|---|---|
| `indexed` | Which sitemap URLs Google has actually indexed, and when each was last crawled |
| `sitemaps` | Submission status, and **`lastDownloaded`** — whether Google ever fetched it |
| `errors` | Crawl problems, per sitemap and per URL |
| `pages` | Clicks, impressions, CTR and position by page |
| `queries` | What people searched before arriving |
| `countries` | Impressions by country **and** visitors by country, side by side |
| `realtime` | Who is on the site right now |
| `downloads` | `download` and `download_intent` broken down by platform and source |
| `all` | Every one of the above |

```sh
DAYS=90 npm run google -- queries    # widen the window; default is 28
```

### Two things about the data itself

**Search Console lags two to three days.** The date range asked for ends three
days ago on purpose; asking for today returns nothing and looks like a fault.

**`countries` prints two tables, from two sources.** Search Console says which
countries *see* the site in results; GA4 says which actually arrived. A country
high in one and absent from the other is the interesting case — impressions
without visits means the listing is being passed over. The two use different
notations (ISO alpha-3 codes versus country names) and are printed as each
returns them, because a mapping that silently mislabels a country is worse than
two columns that need reading side by side.

**`indexed` inspects one URL at a time** because Search Console has no API for
the Index Coverage report — the list of indexed pages is not exposed, only
per-URL status. Quota is 2000 inspections a day, which nine URLs will not
trouble.

---

## The answer to "Couldn't fetch"

```sh
npm run google -- sitemaps
```

The `downloaded` column is what the Search Console UI is reporting on. `NEVER`
means Google has not fetched it yet — which is a queue position, not an error,
and is almost certainly what you are looking at. A date means it fetched
successfully and any problem is in the `errors` column instead.

---

## If something goes wrong later

| Symptom | Cause |
|---|---|
| `403` with *"has not been used"* | An API was disabled, or the project changed |
| `403` on one product only | That product's sharing was removed |
| `Invalid grant: account not found` | The service account or its project was deleted |
| `Invalid JWT` | Truncated `private_key`, or the machine clock is well out |
| `404` on GA4 | `GA4_PROPERTY_ID` is wrong, or is the `G-` id |
| Empty results, no error | Usually the reporting lag, not a fault |

**To revoke everything:** delete the key in the Cloud console. The account stops
working immediately, everywhere, with nothing else to change. To revoke one
product, remove the user from that product instead.
