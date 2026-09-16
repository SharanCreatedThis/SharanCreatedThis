//
//  RopeStyleLayer.swift
//  Hangly
//
//  One cord style as it should be drawn this frame.
//

/// A rope style plus how far through a change it is.
///
/// Changing style draws two layers for a quarter of a second: the outgoing texture
/// fading out and the incoming one fading in, over a single cord body whose colour
/// and thickness are blended between the two. Splitting it that way is what makes a
/// twist become a chain without either of them popping — you cannot interpolate a
/// dash pattern into a different dash pattern, but you can cross-fade one over the
/// other, and the body underneath carries the colour change continuously.
///
/// The renderer has no idea a transition is happening; it draws what it is given.
struct RopeStyleLayer: Equatable {
    let style: RopeStyle

    /// Zero to one.
    let opacity: Double
}
