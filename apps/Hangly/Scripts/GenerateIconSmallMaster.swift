//
//  GenerateIconSmallMaster.swift
//  Hangly
//
//  Builds the small-size master for the app icon from the scene master.
//  Run via Scripts/generate-app-icon.sh, which regenerates it before slicing.
//

import CoreGraphics
import Foundation
import ImageIO
import UniformTypeIdentifiers

/// The 16, 32 and 64 pixel slots get their own artwork, and this draws it.
///
/// The scene master — a nazar hanging on a cord in front of a sunlit wall — is a
/// picture, and a picture does not survive being shrunk to sixteen pixels: the
/// charm ends up five pixels across with a skyline competing for the other eleven.
/// RC1 measured that and it is the icon's one real defect.
///
/// So the small sizes take one subject, very large, on a plain ground. The subject
/// is lifted out of the scene master rather than drawn again, so the small icon is
/// the same object in the same light as the large one — a crop, not a second
/// design. The ground is the scene master's own silhouette filled with the wall's
/// colour, so the two icons share an outline exactly and cannot drift apart when
/// the artwork is replaced.
@main
struct GenerateIconSmallMaster {
    /// The nazar's disc inside the 1254-pixel scene master, measured from it: the
    /// glass and its gold rim, without the bail, the beads or the cord.
    ///
    /// A fraction of the master's width rather than a pixel count, so a master
    /// re-exported at another resolution still cuts in the right place.
    static let discCentre = CGPoint(x: 0.49362, y: 0.62759)
    static let discRadius = CGSize(width: 0.16109, height: 0.15391)

    /// How much of the icon's shape the disc fills, across.
    ///
    /// The scene gives it 0.32. Legibility at sixteen pixels is almost entirely a
    /// question of how many of them the subject gets, and this is as large as the
    /// disc goes before its rim starts to touch the shape's corners.
    static let discFill = 0.78

    /// The output canvas, and Apple's grid inside it — the same 824 of 1024 the
    /// slicer uses, so the two masters hand it artwork of the same proportions.
    static let canvas = 1024
    static let shapeSpan = 824.0

    /// The wall, top to bottom, sampled from the scene master away from the window
    /// light. Deliberately darker than the nazar's glass: the disc has to read as a
    /// disc at sixteen pixels, and it does that on its edge.
    static let groundTop = CGColor(srgbRed: 0.129, green: 0.180, blue: 0.408, alpha: 1)
    static let groundBottom = CGColor(srgbRed: 0.016, green: 0.055, blue: 0.239, alpha: 1)

    static func main() throws {
        let arguments = Array(CommandLine.arguments.dropFirst())
        guard arguments.count >= 2 else {
            FileHandle.standardError.write(Data("usage: smallmaster <scene-master.png> <out.png>\n".utf8))
            exit(2)
        }
        let sceneURL = URL(fileURLWithPath: arguments[0])
        let outputURL = URL(fileURLWithPath: arguments[1])

        guard let source = CGImageSourceCreateWithURL(sceneURL as CFURL, nil),
              let scene = CGImageSourceCreateImageAtIndex(source, 0, nil) else {
            FileHandle.standardError.write(Data("error: could not read \(sceneURL.path)\n".utf8))
            exit(1)
        }

        let disc = try cutDisc(from: scene)
        let ground = try fillSilhouette(of: scene)
        let image = try compose(ground: ground, disc: disc)
        try write(image, to: outputURL)

        print("scene   \(scene.width)×\(scene.height)")
        print("disc    \(disc.width)×\(disc.height) lifted from the scene")
        print(String(format: "        drawn at %.0f%% of the icon's shape", discFill * 100))
        print("wrote   \(outputURL.lastPathComponent) at \(canvas)×\(canvas)")
    }

    // MARK: - The subject

    /// The nazar's disc, cut out of the scene on a transparent ground.
    ///
    /// The cut is an ellipse with a one-pixel feather, because the disc is a sphere
    /// photographed slightly off-axis rather than a circle, and a hard edge on a
    /// round subject shows as a staircase the moment anything scales it.
    static func cutDisc(from scene: CGImage) throws -> CGImage {
        let width = Double(scene.width), height = Double(scene.height)
        let centre = CGPoint(x: discCentre.x * width, y: discCentre.y * height)
        let radius = CGSize(width: discRadius.width * width, height: discRadius.height * height)

        let side = Int((max(radius.width, radius.height) * 2).rounded(.up))
        guard let context = makeContext(side: side) else { throw CocoaError(.fileWriteUnknown) }

        // The scene is y-down as measured; CoreGraphics is y-up.
        let originX = centre.x - Double(side) / 2
        let originY = (height - centre.y) - Double(side) / 2

        let inset = CGRect(
            x: (Double(side) / 2) - radius.width,
            y: (Double(side) / 2) - radius.height,
            width: radius.width * 2,
            height: radius.height * 2
        ).insetBy(dx: 1, dy: 1)

        context.saveGState()
        context.addEllipse(in: inset)
        context.clip()
        context.interpolationQuality = .high
        context.draw(scene, in: CGRect(x: -originX, y: -originY, width: width, height: height))
        context.restoreGState()

        guard let image = context.makeImage() else { throw CocoaError(.fileWriteUnknown) }
        return image
    }

    // MARK: - The ground

    /// The scene master's own silhouette, filled with the wall.
    ///
    /// Using the master's alpha rather than a rounded rectangle of our own is what
    /// guarantees the two icons are the same shape. Apple's macOS icon is a
    /// squircle, not a rounded rectangle, and drawing one by hand next to a real one
    /// is visible in the Dock.
    static func fillSilhouette(of scene: CGImage) throws -> CGImage {
        guard let context = makeContext(side: scene.width) else { throw CocoaError(.fileWriteUnknown) }
        let bounds = CGRect(x: 0, y: 0, width: scene.width, height: scene.height)

        let space = CGColorSpace(name: CGColorSpace.sRGB) ?? CGColorSpaceCreateDeviceRGB()
        guard let gradient = CGGradient(
            colorsSpace: space,
            colors: [groundTop, groundBottom] as CFArray,
            locations: [0, 1]
        ) else { throw CocoaError(.fileWriteUnknown) }

        // Clip to the artwork, then lay the wall through it.
        context.saveGState()
        context.clip(to: bounds, mask: scene)
        context.drawLinearGradient(
            gradient,
            start: CGPoint(x: 0, y: bounds.maxY),
            end: CGPoint(x: 0, y: bounds.minY),
            options: [.drawsBeforeStartLocation, .drawsAfterEndLocation]
        )
        context.restoreGState()

        guard let image = context.makeImage() else { throw CocoaError(.fileWriteUnknown) }
        return image
    }

    // MARK: - Composition

    /// The ground at Apple's proportions with the disc centred on it.
    static func compose(ground: CGImage, disc: CGImage) throws -> CGImage {
        guard let context = makeContext(side: canvas) else { throw CocoaError(.fileWriteUnknown) }
        context.interpolationQuality = .high

        // The ground carries the scene's transparent margin, so it is scaled by its
        // opaque bounds the same way the slicer scales the scene itself.
        guard let bounds = opaqueBounds(ground) else { throw CocoaError(.fileWriteUnknown) }
        let scale = shapeSpan / max(bounds.width, bounds.height)
        let originX = (Double(canvas) - (bounds.width * scale)) / 2 - (bounds.minX * scale)
        let flippedMinY = Double(ground.height) - bounds.maxY
        let originY = (Double(canvas) - (bounds.height * scale)) / 2 - (flippedMinY * scale)
        context.draw(ground, in: CGRect(
            x: originX,
            y: originY,
            width: Double(ground.width) * scale,
            height: Double(ground.height) * scale
        ))

        // The disc, centred, with a soft contact shadow so it sits in front of the
        // wall rather than on it. The shadow is worth nothing at sixteen pixels and
        // everything at sixty-four.
        let side = shapeSpan * discFill
        let target = CGRect(
            x: (Double(canvas) - side) / 2,
            y: (Double(canvas) - side) / 2,
            width: side,
            height: side
        )
        context.saveGState()
        context.setShadow(
            offset: CGSize(width: 0, height: -side * 0.035),
            blur: side * 0.075,
            color: CGColor(srgbRed: 0, green: 0, blue: 0, alpha: 0.45)
        )
        context.draw(disc, in: target)
        context.restoreGState()

        guard let image = context.makeImage() else { throw CocoaError(.fileWriteUnknown) }
        return image
    }

    // MARK: - Plumbing

    static func makeContext(side: Int) -> CGContext? {
        CGContext(
            data: nil,
            width: side,
            height: side,
            bitsPerComponent: 8,
            bytesPerRow: 0,
            space: CGColorSpace(name: CGColorSpace.sRGB) ?? CGColorSpaceCreateDeviceRGB(),
            bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
        )
    }

    /// The artwork's own bounds inside a canvas, ignoring transparent margin.
    static func opaqueBounds(_ image: CGImage) -> CGRect? {
        let width = image.width, height = image.height
        var pixels = [UInt8](repeating: 0, count: width * height * 4)
        let drawn = pixels.withUnsafeMutableBytes { raw -> Bool in
            guard let base = raw.baseAddress,
                  let context = CGContext(
                      data: base, width: width, height: height, bitsPerComponent: 8,
                      bytesPerRow: width * 4,
                      space: CGColorSpace(name: CGColorSpace.sRGB) ?? CGColorSpaceCreateDeviceRGB(),
                      bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
                  ) else { return false }
            context.draw(image, in: CGRect(x: 0, y: 0, width: width, height: height))
            return true
        }
        guard drawn else { return nil }

        var minX = width, maxX = -1, minY = height, maxY = -1
        for y in 0..<height {
            for x in 0..<width where pixels[((y * width) + x) * 4 + 3] > 12 {
                minX = min(minX, x); maxX = max(maxX, x)
                minY = min(minY, y); maxY = max(maxY, y)
            }
        }
        guard maxX >= minX, maxY >= minY else { return nil }
        return CGRect(x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1)
    }

    static func write(_ image: CGImage, to url: URL) throws {
        guard let destination = CGImageDestinationCreateWithURL(
            url as CFURL, UTType.png.identifier as CFString, 1, nil
        ) else { throw CocoaError(.fileWriteUnknown) }
        CGImageDestinationAddImage(destination, image, nil)
        guard CGImageDestinationFinalize(destination) else { throw CocoaError(.fileWriteUnknown) }
    }
}
