//
//  RGBABitmap+Weather.swift
//  Hangly
//
//  Redrawing artwork as the weather would leave it.
//

import CoreGraphics
import Foundation

/// The weather's only contact with a charm's artwork.
///
/// Kept apart from the rest of the bitmap work because it is the one pass that has
/// an opinion: everything else here measures or moves pixels, and this decides what
/// they should look like. The rule it follows is that every adjustment must act on
/// the shading the artist already drew — which is what keeps a charm recognisably
/// itself in all five kinds of weather, and what stops any of it reading as a layer
/// laid over the top.
extension RGBABitmap {
    /// Redraws an image as the weather would leave it.
    ///
    /// Four adjustments and an edge, all of them acting on the shading the artist
    /// already drew rather than on top of it — which is the whole reason none of
    /// this reads as a sticker. Saturation and warmth change what colour the light
    /// is; sheen exaggerates the highlights that are already there, because sun on
    /// gold and water on enamel both do exactly that; damp pulls the mid-tones down,
    /// which is most of why a wet thing looks wet. The rim is the only addition, and
    /// it follows the artwork's own silhouette, so frost collects where frost would.
    ///
    /// Run once per size per condition and cached by `VectorImage`, never per frame.
    static func weathered(_ image: CGImage, mood: WeatherMood) -> CGImage? {
        guard !mood.isNeutral, var bitmap = RGBABitmap(image: image) else { return nil }
        let rim = mood.rim.map { (color: $0, mask: bitmap.innerEdgeMask()) }

        for index in stride(from: 0, to: bitmap.pixels.count, by: bytesPerPixel) {
            let alpha = Double(bitmap.pixels[index + 3])
            guard alpha > 0 else { continue }

            // Premultiplied, so undo that before judging anything about the colour.
            var channels = (
                red: Double(bitmap.pixels[index]) / alpha,
                green: Double(bitmap.pixels[index + 1]) / alpha,
                blue: Double(bitmap.pixels[index + 2]) / alpha
            )
            let luminance = ((channels.red * 0.2126) + (channels.green * 0.7152)
                + (channels.blue * 0.0722)).clamped(to: 0...1)

            // Colour of the light.
            channels.red = luminance + ((channels.red - luminance) * mood.saturation)
            channels.green = luminance + ((channels.green - luminance) * mood.saturation)
            channels.blue = luminance + ((channels.blue - luminance) * mood.saturation)
            channels.red += mood.warmth
            channels.blue -= mood.warmth

            // The highlights the artwork already has, pushed further toward white.
            let highlight = max(0, (luminance - highlightKnee) / (1 - highlightKnee))
            let lift = mood.sheen * highlight
            if lift != 0 {
                channels.red += (1 - channels.red) * lift
                channels.green += (1 - channels.green) * lift
                channels.blue += (1 - channels.blue) * lift
            }

            // And the mid-tones pulled down. Peaks in the middle and reaches neither
            // end, so a wet charm keeps both its black and its white.
            let midtone = 1 - (abs(luminance - 0.5) * 2)
            let shade = 1 - (mood.damp * max(0, midtone))
            channels.red *= shade
            channels.green *= shade
            channels.blue *= shade

            if let rim {
                let amount = mood.rimStrength * (Double(rim.mask[index / bytesPerPixel]) / 255)
                if amount > 0 {
                    channels.red += (rim.color.red - channels.red) * amount
                    channels.green += (rim.color.green - channels.green) * amount
                    channels.blue += (rim.color.blue - channels.blue) * amount
                }
            }

            bitmap.pixels[index] = premultiplied(channels.red, alpha)
            bitmap.pixels[index + 1] = premultiplied(channels.green, alpha)
            bitmap.pixels[index + 2] = premultiplied(channels.blue, alpha)
        }

        return bitmap.makeImage()
    }

    /// Where the luminance ramp stops being a mid-tone and starts being a highlight.
    static let highlightKnee = 0.62

    static func premultiplied(_ channel: Double, _ alpha: Double) -> UInt8 {
        UInt8((channel.clamped(to: 0...1) * alpha).rounded().clamped(to: 0...255))
    }

    /// A soft band just inside the silhouette, as a mask.
    ///
    /// The artwork's own alpha, minus a blurred copy of it: inside the shape the two
    /// agree and cancel, and near the edge the blur has already fallen away while
    /// the alpha has not. An outer glow would be the same subtraction the other way
    /// round, and would look stuck on; this one is part of the shape.
    fileprivate func innerEdgeMask() -> [UInt8] {
        let radius = max(1, Int((Double(min(width, height)) * 0.05).rounded()))
        var alpha = [Double](repeating: 0, count: width * height)
        for index in alpha.indices {
            alpha[index] = Double(pixels[(index * Self.bytesPerPixel) + 3])
        }

        var blurred = alpha
        var scratch = [Double](repeating: 0, count: width * height)
        for _ in 0..<2 {
            Self.boxBlur(&blurred, into: &scratch, width: width, height: height, radius: radius)
        }

        return alpha.indices.map { index in
            // Scaled so the band reaches full strength rather than peaking faint.
            let band = (alpha[index] - blurred[index]) * 2
            return UInt8(band.rounded().clamped(to: 0...255))
        }
    }
}
