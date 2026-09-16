//
//  CharmGrabShape.swift
//  Hangly
//
//  Hit region for grabbing the charm.
//

import SwiftUI

/// The only part of the overlay that accepts the mouse.
///
/// Used as the canvas's `contentShape`, so SwiftUI hit-tests a disc around each
/// charm and ignores every other pixel. That keeps the overlay click-through
/// everywhere the rope is not, which is the behaviour the charm has to coexist with.
///
/// One disc per charm on the rope: with three charms the region is three discs and
/// the cord between them stays click-through, so the desktop underneath is still
/// reachable through the gaps.
struct CharmGrabShape: Shape {
    struct Disc: Equatable {
        var center: CGPoint
        var radius: Double
    }

    let discs: [Disc]

    init(discs: [Disc]) {
        self.discs = discs
    }

    init(center: CGPoint, radius: Double) {
        self.init(discs: [Disc(center: center, radius: radius)])
    }

    func path(in rect: CGRect) -> Path {
        var path = Path()
        for disc in discs where disc.radius > 0 {
            path.addEllipse(in: CGRect(
                x: disc.center.x - disc.radius,
                y: disc.center.y - disc.radius,
                width: disc.radius * 2,
                height: disc.radius * 2
            ))
        }
        return path
    }
}
