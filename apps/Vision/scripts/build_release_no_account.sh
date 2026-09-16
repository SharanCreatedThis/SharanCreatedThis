#!/bin/bash
set -e

APP_NAME="Vision"
BUILD_DIR="./build"
DERIVED_DATA_DIR="$BUILD_DIR/DerivedData"

mkdir -p "$BUILD_DIR"

echo "==> 1. Building Vision App (Ad-Hoc Signing)..."
xcodebuild -scheme "$APP_NAME" \
           -configuration Release \
           -derivedDataPath "$DERIVED_DATA_DIR" \
           CODE_SIGN_IDENTITY="" \
           CODE_SIGNING_REQUIRED=NO \
           CODE_SIGNING_ALLOWED=NO \
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

echo "==> 3. Signing DMG with Sparkle Ed25519 Key..."
if command -v sign_update >/dev/null 2>&1; then
    SIGNATURE_OUTPUT=$(sign_update "$DMG_PATH")
    echo "$SIGNATURE_OUTPUT"
    echo ""
    echo "==> COPY THE ABOVE ATTR STRING INTO appcast.xml!"
else
    echo "Warning: sign_update CLI tool not found in PATH."
    echo "Run: brew install sparkle"
fi
