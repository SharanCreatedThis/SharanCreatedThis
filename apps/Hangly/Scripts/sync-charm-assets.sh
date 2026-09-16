#!/bin/bash
# Syncs the designer's SVGs in Assets/Charms into the asset catalog as
# vector-preserving imagesets. Re-run whenever an SVG changes, then
# Scripts/generate-charm-previews.sh to refresh the previews.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BUILD="$(mktemp -d)"
SDK="$(xcrun --show-sdk-path --sdk macosx)"

xcrun swiftc -target "$(uname -m)-apple-macos14.0" -sdk "$SDK" -swift-version 6 -parse-as-library \
  -o "$BUILD/sync" \
  "$ROOT"/Hangly/Models/Charm.swift \
  "$ROOT"/Hangly/Models/CharmKind.swift \
  "$ROOT"/Hangly/Physics/RopeBead.swift \
  "$ROOT"/Hangly/Utilities/CGPoint+Vector.swift \
  "$ROOT"/Hangly/Models/CharmSound.swift \
  "$ROOT"/Hangly/Models/SVGArtworkSource.swift \
  "$ROOT"/Hangly/Models/Charms/*.swift \
  "$ROOT"/Hangly/Utilities/Comparable+Clamped.swift \
  "$ROOT"/Hangly/Models/ArtworkUsage.swift \
  "$ROOT"/Hangly/Utilities/VectorImage.swift \
  "$ROOT"/Hangly/Utilities/VectorImage+Render.swift \
  "$ROOT"/Hangly/Utilities/VectorTint.swift \
  "$ROOT"/Hangly/Models/WeatherCondition.swift \
  "$ROOT"/Hangly/Models/WeatherMood.swift \
  "$ROOT"/Hangly/Utilities/RGBABitmap+Weather.swift \
  "$ROOT"/Hangly/Utilities/RGBABitmap.swift \
  "$ROOT"/Hangly/Utilities/CharmArtworkSplitter.swift \
  "$ROOT"/Scripts/SyncCharmAssets.swift

"$BUILD/sync" "$ROOT/Assets/Charms" "$ROOT/Hangly/Assets/Assets.xcassets/CharmArtwork"
rm -rf "$BUILD"
