# Verifying the apex → www redirect without breaking Sparkle

**Nothing here has been implemented.** The apex and `www` both answer 200 today,
and that is unchanged. This is the plan to follow when Vision is ready to be
tested against, and the reasoning for why it is not a five-minute job.

---

## Why this is delicate

Two feed URLs are compiled into software already installed on other people's
machines. They cannot be changed, and they do not agree on a host:

| Product | `SUFeedURL` compiled into every installed copy | Host |
|---|---|---|
| Hangly | `https://www.sharancreatedthis.in/products/hangly/appcast.xml` | **www** |
| Vision | `https://sharancreatedthis.in/products/vision/appcast.xml` | **apex** |

A redirect from the apex to `www` therefore moves Vision's feed and leaves
Hangly's alone. Sparkle follows redirects, so it *should* be transparent — and
"should" is the word that makes this worth testing rather than assuming.

Two specific things deserve checking rather than trust:

1. **The redirect must preserve the path.** A rule that sends
   `sharancreatedthis.in/*` to the `www` root instead of the same path turns
   every installed Vision into one that silently stops updating. It will not
   error; it will fetch an HTML page, fail to parse it as an appcast, and go
   quiet.
2. **The enclosure URL is followed separately from the feed.** The feed lives on
   the site; the archive lives on R2 at `downloads.sharancreatedthis.in`. That
   host is not affected by an apex rule, but the download step is a second
   request and should be confirmed end to end, not inferred from the first.

---

## The order to do it in

Each stage is reversible in seconds until stage 4, and stage 4 is reversible by
deleting one rule.

### Stage 0 — record what "working" looks like now

Before changing anything, capture the current behaviour so there is something to
compare against:

```sh
# Both feeds, as Sparkle would fetch them.
curl -sSI https://sharancreatedthis.in/products/vision/appcast.xml
curl -sSI https://www.sharancreatedthis.in/products/hangly/appcast.xml

# Byte-identical to the repository?
curl -sS https://sharancreatedthis.in/products/vision/appcast.xml \
  | diff - website/public/products/vision/appcast.xml && echo "vision feed matches"
curl -sS https://www.sharancreatedthis.in/products/hangly/appcast.xml \
  | diff - website/public/products/hangly/appcast.xml && echo "hangly feed matches"
```

Keep the output. A later comparison against "I think it looked fine" is not a
comparison.

### Stage 1 — prove the redirect with a path that is not a feed

Add the Cloudflare Redirect Rule, but test it somewhere harmless first.

**Cloudflare → Rules → Redirect Rules → Create rule**

- **If**: `Hostname equals sharancreatedthis.in`
- **Then**: Dynamic redirect
- **Expression**: `concat("https://www.sharancreatedthis.in", http.request.uri.path)`
- **Status**: 301
- **Preserve query string**: on

The expression is the part that matters. A static redirect to
`https://www.sharancreatedthis.in` drops the path and is the failure described
above. Use a *dynamic* redirect that concatenates the path.

Then:

```sh
# Path must survive.
curl -sSI https://sharancreatedthis.in/about | grep -i location
# expect: location: https://www.sharancreatedthis.in/about

# Query string must survive.
curl -sSI "https://sharancreatedthis.in/about?x=1" | grep -i location
# expect: ...?x=1

# Deep path must survive.
curl -sSI https://sharancreatedthis.in/products/vision/docs | grep -i location
```

If any of those lands on the bare root, **delete the rule and stop**. Nothing
below is safe until the path is preserved.

### Stage 2 — prove the feeds still resolve, through the redirect

```sh
# Vision's feed, following redirects as Sparkle does.
curl -sSL -o /tmp/vision.xml -w "%{http_code} %{content_type} redirects=%{num_redirects}\n" \
  https://sharancreatedthis.in/products/vision/appcast.xml

diff /tmp/vision.xml website/public/products/vision/appcast.xml \
  && echo "identical after redirect"

# Hangly's feed is on www and should not redirect at all.
curl -sSI https://www.sharancreatedthis.in/products/hangly/appcast.xml | head -1
# expect: 200, not 301
```

Both must serve as `application/xml`. A redirect that lands on an HTML 404 page
still returns 200 to `curl -L`, so **check the content type and diff the bytes** —
a status code alone will not catch it.

### Stage 3 — prove the download step, which is a separate request

```sh
# The enclosure URL, taken from the feed itself rather than typed.
ENCLOSURE=$(grep -o 'url="[^"]*\.dmg"' /tmp/vision.xml | head -1 | sed 's/url="//;s/"//')
echo "$ENCLOSURE"
curl -sSL -o /tmp/vision.dmg -w "%{http_code} %{size_download} bytes\n" "$ENCLOSURE"

# The signature covers the bytes, not the URL, so it must still match the feed.
sign_update /tmp/vision.dmg
grep -o 'sparkle:edSignature="[^"]*"' /tmp/vision.xml
```

The two signatures must be identical. If they are, the archive is byte-for-byte
what the feed promises and the redirect changed nothing about it.

### Stage 4 — the test that actually matters

Everything above tests the plumbing. This tests the product.

1. Install an **older** Vision build — one with a lower `CFBundleVersion` than
   the feed advertises
2. Launch it and let it check for updates, or use **Check for Updates** directly
3. It must find the update, download it, and install it

Do this on a machine that has never seen the new build, so nothing is cached.

**Repeat for Hangly**, even though its feed is on `www` and should be untouched.
The point of a regression test is the thing you did not expect to break.

### Stage 5 — watch, then stop watching

Leave the rule in place and check for a week:

- Cloudflare → Analytics → any spike in 404s under `/products/*/appcast.xml`
- The R2 bucket's request count should stay roughly flat; a sharp drop means
  updaters stopped reaching it

---

## Rolling back

Delete the Redirect Rule. It takes effect within seconds, needs no deploy, and
restores exactly the behaviour captured in stage 0. That is the entire reason
this is a Cloudflare rule rather than something in the repository.

---

## What this buys, and what it does not

**Buys:** the apex stops serving a duplicate copy of every page. Today both
hosts answer 200 with identical content, which is duplicate content in the
textbook sense.

**Does not buy:** as much as it sounds like. Every page already carries a
`<link rel="canonical">` naming the `www` URL, and Google honours canonical tags
for exactly this case. **The ranking problem is already solved.** The redirect
is tidiness and certainty, not a rescue.

Which is the honest argument for waiting until Vision can be tested properly:
the upside is small and the downside is every installed copy of a product
quietly never updating again.
