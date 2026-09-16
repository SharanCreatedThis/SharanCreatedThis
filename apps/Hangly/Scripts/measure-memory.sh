#!/bin/bash
#
# Walks Hangly through Customize and reports its memory at each state.
#
#   ./Scripts/measure-memory.sh                 # Release, built fresh
#   ./Scripts/measure-memory.sh /path/Hangly.app
#
# Memory is `phys_footprint` — the number Activity Monitor's "Memory" column shows
# and the one the audits quote. `ps -o rss` counts shared framework pages and reads
# about three times higher; it is not what any figure here means.
#
# The pages are opened by posting Darwin notifications, which `AuditRemote` listens
# for in development builds. That is deliberate: driving the window through the
# accessibility API needs the app to become the active application, and when macOS
# declines that — which it does in plenty of ordinary situations — the script
# measures a window that never opened and reports it as a saving.
#
# The Production configuration compiles `AuditRemote` out, so this cannot drive it.
# Compare the two by their idle figure, which needs no driving at all.
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP="${1:-}"

if [ -z "$APP" ]; then
  DERIVED="$(mktemp -d)"
  trap 'rm -rf "$DERIVED"' EXIT
  echo "==> Building Release"
  xcodebuild -project "$ROOT/Hangly.xcodeproj" -scheme Hangly -configuration Release \
    -derivedDataPath "$DERIVED" build 2>&1 | grep -E "error:|^\*\* BUILD" || true
  APP="$DERIVED/Build/Products/Release/Hangly.app"
fi

if [ ! -d "$APP" ]; then
  echo "error: no app at $APP" >&2
  exit 1
fi

# How long the rope is left to settle before the first reading. It takes about
# forty-four seconds to come to rest after the launch swing, and a reading taken
# inside that measures the swing.
SETTLE=${SETTLE:-50}
# How long a page is held open before it is read.
HOLD=${HOLD:-12}

footprint() {
  /usr/bin/vmmap --summary "$1" 2>/dev/null \
    | awk -F: '/Physical footprint:/ { gsub(/ /, "", $2); print $2; exit }'
}

pkill -x Hangly 2>/dev/null
sleep 2

echo "app      $APP"
echo "version  $(defaults read "$APP/Contents/Info" CFBundleShortVersionString) ($(defaults read "$APP/Contents/Info" CFBundleVersion))"

open -a "$APP"
sleep 6
PID="$(pgrep -x Hangly | head -1)"
if [ -z "$PID" ]; then echo "error: Hangly did not start" >&2; exit 1; fi
echo "pid      $PID"
echo

report() { printf '%-22s %s\n' "$1" "$(footprint "$PID")"; }

sleep "$SETTLE"
report "Idle"

for page in library create about appearance; do
  notifyutil -p "com.hangly.audit.$page" >/dev/null
  sleep "$HOLD"
  report "$(printf '%s' "$page" | tr '[:lower:]' '[:upper:]' | cut -c1)$(printf '%s' "$page" | cut -c2-) open"
done

notifyutil -p com.hangly.audit.close >/dev/null
sleep 5
report "Just after close"

sleep 55
report "60 s after close"

sleep 240
report "300 s after close"

echo
echo "peak     $(/usr/bin/vmmap --summary "$PID" 2>/dev/null | awk -F: '/Physical footprint \(peak\)/ { gsub(/ /,"",$2); print $2 }')"
