#!/bin/bash
# Rebuilds Assets.xcassets/AppIcon.appiconset from the master artwork.
#
# Two masters. The scene — Assets/Branding/AppIcon-master.png — carries 128 px and
# up. The small master is derived from it by GenerateIconSmallMaster and carries
# 16, 32 and 64, where a scene is illegible. Re-run after replacing the scene.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BUILD="$(mktemp -d)"
trap 'rm -rf "$BUILD"' EXIT
SDK="$(xcrun --show-sdk-path --sdk macosx)"

SCENE="$ROOT/Assets/Branding/AppIcon-master.png"
SMALL="$ROOT/Assets/Branding/AppIcon-small-master.png"

compile() {
  xcrun swiftc -target "$(uname -m)-apple-macos14.0" -sdk "$SDK" -swift-version 6 -O -parse-as-library \
    -o "$BUILD/$1" "$ROOT/Scripts/$2"
}

compile smallmaster GenerateIconSmallMaster.swift
compile appicon GenerateAppIcon.swift

echo "— small master"
"$BUILD/smallmaster" "$SCENE" "$SMALL"
echo "— icon set"
"$BUILD/appicon" "$SCENE" "$SMALL" "$ROOT/Hangly/Assets/Assets.xcassets/AppIcon.appiconset"
