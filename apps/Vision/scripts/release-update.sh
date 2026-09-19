#!/bin/bash
#
# Publishes a Vision release to the Sparkle feed.
#
#   ./scripts/release-update.sh                # build, sign, upload, regenerate the feed
#   ./scripts/release-update.sh --skip-build   # reuse the DMG already in build/
#   ./scripts/release-update.sh --skip-upload  # leave R2 alone; upload it yourself
#
# What it produces:
#
#   releases/Vision/Vision-<version>.dmg              the archive, git-ignored
#   website/public/products/vision/appcast.xml        the signed feed, committed
#
# The archive goes to R2 and the feed is written straight into the website, which
# is in this same repository — so publishing a Vision release is this command and
# a push. Hangly needs a copy step between two repositories; Vision does not.
#
#   https://www.sharancreatedthis.in/products/vision/appcast.xml
#   https://downloads.sharancreatedthis.in/Vision-<version>.dmg
#
# **No signature is ever typed.** The predecessor of this script printed a
# sign_update line and said "COPY THE ABOVE ATTR STRING INTO appcast.xml", and
# that hand-copy is how the published feed came to carry a signature that did not
# verify against the DMG it pointed at: an update Sparkle would download and then
# refuse to install. generate_appcast signs the archive and writes the feed in one
# step, from the same bytes, so the two cannot disagree.
#
# Signing uses the EdDSA private key in the login keychain — the same key Hangly
# signs with, and the one in SUPublicEDKey. It is never read from this repo and
# must never be committed to it.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
APP_ROOT="$(cd "$HERE/.." && pwd)"
ROOT="$(cd "$APP_ROOT/../.." && pwd)"

APP_NAME="Vision"

# Where the feed is published. Fixed forever: it is SUFeedURL in every copy ever
# shipped, and a copy that cannot reach it never updates again.
FEED_BASE="https://www.sharancreatedthis.in/products/vision"
PRODUCT_LINK="https://www.sharancreatedthis.in/products/vision"

# Where the archives are served from, which is the R2 bucket behind this domain.
# Changing the prefix does not invalidate anything: an EdDSA signature covers the
# file's bytes, not its address.
DOWNLOADS_BASE="https://downloads.sharancreatedthis.in"
R2_BUCKET="sharancreatedthis-downloads"

ARCHIVES="$ROOT/releases/Vision"
APPCAST="$ROOT/website/public/products/vision/appcast.xml"
BUILD_DIR="$APP_ROOT/build"

SKIP_BUILD=0
SKIP_UPLOAD=0
for arg in "$@"; do
  case "$arg" in
    --skip-build) SKIP_BUILD=1 ;;
    --skip-upload) SKIP_UPLOAD=1 ;;
    *) echo "error: unknown argument $arg" >&2; exit 1 ;;
  esac
done

# ---------------------------------------------------------------------------
# Sparkle's command line tools.
#
# They ship inside the Sparkle package's binary artifact, which SwiftPM unpacks
# into DerivedData when the project resolves. If that copy is not there — a clean
# machine, or a CI runner — the same tools are fetched from the Sparkle release
# that Package.resolved pins, and cached.
# ---------------------------------------------------------------------------
find_tools() {
  local hit
  hit="$(find "$HOME/Library/Developer/Xcode/DerivedData" \
           -maxdepth 6 -type d -path "*/artifacts/sparkle/Sparkle/bin" 2>/dev/null | head -1)"
  [ -n "$hit" ] && [ -x "$hit/generate_appcast" ] && echo "$hit"
}

download_tools() {
  local version cache tarball
  version="$(/usr/bin/python3 -c '
import json, sys
pins = json.load(open(sys.argv[1]))["pins"]
print(next(p["state"]["version"] for p in pins if p["identity"] == "sparkle"))
' "$APP_ROOT/Vision.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/Package.resolved")"
  cache="$HOME/Library/Caches/sparkle-tools/$version"
  if [ ! -x "$cache/bin/generate_appcast" ]; then
    echo "==> Fetching the Sparkle $version tools" >&2
    mkdir -p "$cache"
    tarball="$cache/Sparkle.tar.xz"
    curl -fsSL -o "$tarball" \
      "https://github.com/sparkle-project/Sparkle/releases/download/$version/Sparkle-$version.tar.xz"
    tar -xJf "$tarball" -C "$cache"
    rm -f "$tarball"
  fi
  echo "$cache/bin"
}

BIN="$(find_tools || true)"
if [ -z "${BIN:-}" ]; then
  BIN="$(download_tools)"
fi
echo "==> Sparkle tools: $BIN"

# The public half of this key is SUPublicEDKey in Info.plist. If the two ever
# disagree, every installed copy rejects the update as unsigned.
KEYCHAIN_KEY="$("$BIN/generate_keys" -p 2>/dev/null || true)"
if [ -z "$KEYCHAIN_KEY" ]; then
  echo "error: no EdDSA signing key in the keychain. Create one with:" >&2
  echo "         $BIN/generate_keys" >&2
  echo "       then put the printed public key in Vision/Info.plist (SUPublicEDKey)." >&2
  exit 1
fi
PLIST_KEY="$(/usr/libexec/PlistBuddy -c "Print :SUPublicEDKey" "$APP_ROOT/Vision/Info.plist")"
if [ "$KEYCHAIN_KEY" != "$PLIST_KEY" ]; then
  echo "error: the signing key does not match the one the app trusts." >&2
  echo "       keychain:    $KEYCHAIN_KEY" >&2
  echo "       Info.plist:  $PLIST_KEY" >&2
  exit 1
fi

# ---------------------------------------------------------------------------
# The build.
# ---------------------------------------------------------------------------
if [ "$SKIP_BUILD" -eq 0 ]; then
  "$HERE/build_release_no_account.sh"
fi

DMG="$(ls -t "$BUILD_DIR/$APP_NAME"-*.dmg 2>/dev/null | head -1 || true)"
if [ -z "${DMG:-}" ] || [ ! -f "$DMG" ]; then
  echo "error: no $APP_NAME-*.dmg in $BUILD_DIR. Run without --skip-build." >&2
  exit 1
fi

# The version is read out of the app inside the archive, not out of the project
# file, because Xcode injects it at build time and because the archive is the
# thing whose bytes are about to be signed. What is published and what it claims
# to be then come from one place.
MOUNT="$(mktemp -d)"
cleanup() {
  hdiutil detach "$MOUNT" -quiet 2>/dev/null || true
  rmdir "$MOUNT" 2>/dev/null || true
  rm -f "${SERVED:-}"
}
trap cleanup EXIT
hdiutil attach "$DMG" -nobrowse -quiet -mountpoint "$MOUNT"
SHORT_VERSION="$(/usr/libexec/PlistBuddy -c "Print :CFBundleShortVersionString" "$MOUNT/$APP_NAME.app/Contents/Info.plist")"
BUILD_VERSION="$(/usr/libexec/PlistBuddy -c "Print :CFBundleVersion" "$MOUNT/$APP_NAME.app/Contents/Info.plist")"
hdiutil detach "$MOUNT" -quiet
rmdir "$MOUNT"

echo "==> Publishing $APP_NAME $SHORT_VERSION (build $BUILD_VERSION)"
mkdir -p "$ARCHIVES"
cp "$DMG" "$ARCHIVES/$APP_NAME-$SHORT_VERSION.dmg"

NOTES="$ARCHIVES/$APP_NAME-$SHORT_VERSION.html"
if [ -f "$NOTES" ]; then
  echo "    release notes: $(basename "$NOTES")"
else
  echo "note: no $(basename "$NOTES") beside the archive, so this item ships without"
  echo "      release notes. Write that file as an HTML fragment and re-run to add them."
fi

# ---------------------------------------------------------------------------
# The feed.
#
# generate_appcast reads every archive in the directory, pulls the version and
# the minimum OS out of the app inside each one, signs them with the keychain key
# and rewrites the feed. Nothing in appcast.xml is written by hand.
# ---------------------------------------------------------------------------
echo "==> Signing and regenerating the appcast"
"$BIN/generate_appcast" \
  --download-url-prefix "$DOWNLOADS_BASE/" \
  --link "$PRODUCT_LINK" \
  -o "$APPCAST" \
  "$ARCHIVES"

# ---------------------------------------------------------------------------
# The archive goes to R2.
#
# After the feed is written rather than before, so that what is uploaded is the
# same file the feed was signed against — the two cannot drift apart within a run.
#
# Wrangler authenticates against the login it already holds; `wrangler login` or a
# CLOUDFLARE_API_TOKEN with Object Read & Write on this bucket is the prerequisite.
# ---------------------------------------------------------------------------
ARCHIVE="$ARCHIVES/$APP_NAME-$SHORT_VERSION.dmg"
OBJECT="$APP_NAME-$SHORT_VERSION.dmg"

if [ "$SKIP_UPLOAD" -eq 0 ]; then
  echo "==> Uploading the archive to R2"
  npx --yes wrangler@latest r2 object put "$R2_BUCKET/$OBJECT" \
    --file "$ARCHIVE" \
    --content-type application/x-apple-diskimage \
    --remote

  # What the feed promises, checked against what the world can actually fetch.
  # A signature mismatch here means Sparkle would download the update and refuse
  # to install it — which is exactly what the hand-copied signature this script
  # replaces had done to the published feed.
  echo "==> Verifying the upload"
  SERVED="$(mktemp)"
  if ! curl -fsSL -o "$SERVED" "$DOWNLOADS_BASE/$OBJECT"; then
    echo "error: $DOWNLOADS_BASE/$OBJECT did not download. The feed now points at" >&2
    echo "       an address that does not serve; fix before telling anyone." >&2
    exit 1
  fi

  LOCAL_SUM="$(shasum -a 256 "$ARCHIVE" | cut -d' ' -f1)"
  SERVED_SUM="$(shasum -a 256 "$SERVED" | cut -d' ' -f1)"
  if [ "$LOCAL_SUM" != "$SERVED_SUM" ]; then
    echo "error: the bytes served are not the bytes signed." >&2
    echo "       local:  $LOCAL_SUM" >&2
    echo "       served: $SERVED_SUM" >&2
    exit 1
  fi

  FEED_SIGNATURE="$(sed -n 's/.*sparkle:edSignature="\([^"]*\)".*/\1/p' "$APPCAST" | head -1)"
  SERVED_SIGNATURE="$("$BIN/sign_update" "$SERVED" | sed -n 's/.*sparkle:edSignature="\([^"]*\)".*/\1/p')"
  if [ "$FEED_SIGNATURE" != "$SERVED_SIGNATURE" ]; then
    echo "error: the signature in the feed does not verify against the file R2 serves." >&2
    echo "       Sparkle would download this update and refuse to install it." >&2
    exit 1
  fi
  echo "    $OBJECT: $SERVED_SUM"
  echo "    signature in the feed matches the file as served"
else
  echo "note: --skip-upload, so R2 still has to be given $OBJECT by hand, or the"
  echo "      feed points at something that is not there."
fi

printf '\n'
echo "==> Done. The feed is already in the website:"
echo "    $APPCAST"
echo "      -> $FEED_BASE/appcast.xml"
echo
echo "    The archive is already in R2 at"
echo "      $DOWNLOADS_BASE/$OBJECT"
echo
echo "    Commit the appcast and push; Cloudflare Pages publishes it."
