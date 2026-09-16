//
//  VectorImage+Render.swift
//  Hangly
//
//  Drawing a vector asset, or one region of it, into a bitmap.
//

import AppKit
import CoreGraphics
import Foundation

/// The rasterising half of `VectorImage`, kept out of the type's own file.
///
/// Nothing here touches the cache or the lock — it is a pure function from an
/// image, a region and a pixel size to a bitmap, which is what makes it safe to
/// call from whichever thread SwiftUI hands the renderer.
extension VectorImage {
    /// Blur radius used for a shadow of artwork this size, in pixels.
    static func blurRadius(forPixelSide side: Int) -> Int {
        max(1, Int((Double(side) * 0.06).rounded()))
    }

    /// How far a shadow spreads beyond its artwork, as a fraction of the artwork's
    /// shorter side. Lets the caller size the rectangle it draws into.
    static func shadowSpread(forPixelSide side: Int) -> Double {
        guard side > 0 else { return 0 }
        return Double(RGBABitmap.padding(forBlurRadius: blurRadius(forPixelSide: side))) / Double(side)
    }

    static func render(
        _ image: NSImage,
        region: CGRect,
        pixelWidth: Int,
        pixelHeight: Int,
        dark: Bool
    ) -> CGImage? {
        guard let context = RGBABitmap.makeContext(data: nil, width: pixelWidth, height: pixelHeight) else {
            return nil
        }
        context.interpolationQuality = .high

        // Where the artwork sits in the unit square, then where that square sits in
        // the requested region, then where the region sits in the bitmap.
        let size = image.size
        let longest = max(size.width, size.height)
        let content = CGRect(
            x: (1 - (size.width / longest)) / 2,
            y: (1 - (size.height / longest)) / 2,
            width: size.width / longest,
            height: size.height / longest
        )

        let scaleX = Double(pixelWidth) / region.width
        let scaleY = Double(pixelHeight) / region.height
        let width = content.width * scaleX
        let height = content.height * scaleY
        let left = (content.minX - region.minX) * scaleX
        let top = (content.minY - region.minY) * scaleY
        // The context's origin is bottom left; regions are measured from the top.
        let target = CGRect(x: left, y: Double(pixelHeight) - top - height, width: width, height: height)

        let draw = {
            NSGraphicsContext.saveGraphicsState()
            NSGraphicsContext.current = NSGraphicsContext(cgContext: context, flipped: false)
            image.draw(
                in: target,
                from: .zero,
                operation: .sourceOver,
                fraction: 1,
                respectFlipped: true,
                hints: [.interpolation: NSImageInterpolation.high]
            )
            NSGraphicsContext.restoreGraphicsState()
        }

        // Asset-catalog images pick their appearance from the current drawing
        // appearance, which is how a dark variant is honoured when present.
        if dark, let appearance = NSAppearance(named: .darkAqua) {
            appearance.performAsCurrentDrawingAppearance(draw)
        } else {
            draw()
        }
        return context.makeImage()
    }
}
