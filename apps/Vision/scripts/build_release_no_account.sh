#!/bin/bash
set -e

APP_NAME="Vision"
BUILD_DIR="./build"
DERIVED_DATA_DIR="$BUILD_DIR/DerivedData"

mkdir -p "$BUILD_DIR"

# Ad-hoc signed, which the name always claimed and the flags never did: signing
# was switched off entirely, leaving the app linker-signed. Sparkle's
# generate_appcast refuses to publish an app that is not properly signed, which is
# why this release used to be assembled by hand from a sign_update line. Signing
# ad-hoc is what lets the feed be generated instead of typed.
#
# The hardened runtime is on and Sparkle ships as an embedded framework, so the
# app also needs com.apple.security.cs.disable-library-validation to launch under
# an ad-hoc signature — see Vision/Vision.entitlements.
echo "==> 1. Building Vision App (Ad-Hoc Signing)..."
xcodebuild -scheme "$APP_NAME" \
           -configuration Release \
           -derivedDataPath "$DERIVED_DATA_DIR" \
           CODE_SIGN_IDENTITY="-" \
           CODE_SIGN_STYLE=Manual \
           DEVELOPMENT_TEAM="" \
           CODE_SIGNING_REQUIRED=YES \
           CODE_SIGNING_ALLOWED=YES \
           build

APP_PATH=$(find "$DERIVED_DATA_DIR" -name "Vision.app" -type d | head -n 1)

if [ -z "$APP_PATH" ] || [ ! -d "$APP_PATH" ]; then
    echo "Error: Vision.app build output not found at path: $APP_PATH"
    exit 1
fi

INFO_PLIST="$APP_PATH/Contents/Info.plist"

if [ ! -f "$INFO_PLIST" ]; then
    echo "Error: Info.plist not found at path: $INFO_PLIST"
    exit 1
fi

VERSION=$(/usr/libexec/PlistBuddy -c "Print :CFBundleShortVersionString" "$INFO_PLIST" 2>/dev/null || true)
BUILD_NUM=$(/usr/libexec/PlistBuddy -c "Print :CFBundleVersion" "$INFO_PLIST" 2>/dev/null || true)

if [ -z "$VERSION" ]; then
    echo "Error: Could not extract CFBundleShortVersionString from $INFO_PLIST"
    exit 1
fi

if [ -z "$BUILD_NUM" ]; then
    echo "Error: Could not extract CFBundleVersion from $INFO_PLIST"
    exit 1
fi

echo "==> APP_PATH: $APP_PATH"
echo "==> INFO_PLIST: $INFO_PLIST"
echo "==> VERSION: $VERSION"
echo "==> BUILD_NUM: $BUILD_NUM"

DMG_PATH="$BUILD_DIR/Vision-$VERSION.dmg"

echo "==> 2. Packaging DMG to $DMG_PATH..."
hdiutil create -volname "Vision $VERSION" -srcfolder "$APP_PATH" -ov -format UDZO "$DMG_PATH"

echo "==> Built $DMG_PATH"
echo ""
echo "    This script only builds. Signing, the appcast and the upload are"
echo "    scripts/release-update.sh, which signs the archive and writes the feed"
echo "    from the same bytes in one step — no signature is ever copied by hand."
