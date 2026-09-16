//
//  CharmKind.swift
//  Hangly
//
//  The closed set of charms that ship in the app.
//

import Foundation

/// Identity of a built-in charm.
enum CharmKind: String, CaseIterable, Codable, Sendable, Identifiable {
    // The classics.
    case circle
    case camera
    case star
    case heart
    case diamond

    // The Hangly collection.
    case nazar
    case hamsa
    case nimbuMirchi
    case ghanta
    case drishtiBommai
    case panchangJie
    case daruma
    case manekiNeko
    case horseshoe
    case scarab
    case himmeli

    // The seasonal packs.
    case snowflake
    case bell
    case candyCane
    case pumpkin
    case ghost
    case bat
    case diya
    case lotus
    case lantern
    case firework
    case luckyCoin

    // The Marvel collection.
    case spiderMan
    case captainAmericaShield
    case ironManHelmet
    case thorHammer
    case hulkFist

    // The DC collection.
    case batmanSymbol
    case supermanShield
    case wonderWomanEmblem
    case shazamLightning
    case greenLanternRing

    // The Tamil Spiritual collection.
    case vel
    case vinayagarCoin
    case omSymbol
    case karuppuStatue
    case templeBell

    // The BTS collection.
    case btsMemberOne
    case btsMemberTwo
    case btsMemberThree
    case btsMemberFour
    case btsMemberFive
    case btsMemberSix
    case btsMemberSeven

    var id: String { rawValue }

    /// Must match the `name` in `CharmLibrary.json`; a test enforces it.
    var displayName: String {
        switch self {
        case .circle: "Bead"
        case .camera: "Camera"
        case .star: "Star"
        case .heart: "Heart"
        case .diamond: "Diamond"
        case .nazar: "Nazar boncuğu"
        case .hamsa: "Hamsa"
        case .nimbuMirchi: "Nimbu-mirchi"
        case .ghanta: "Ghanta"
        case .drishtiBommai: "Drishti bommai"
        case .panchangJie: "Pánchángjié"
        case .daruma: "Daruma"
        case .manekiNeko: "Maneki-neko"
        case .horseshoe: "Horseshoe"
        case .scarab: "Scarab"
        case .himmeli: "Himmeli"
        case .snowflake: "Snowflake"
        case .bell: "Bell"
        case .candyCane: "Candy Cane"
        case .pumpkin: "Pumpkin"
        case .ghost: "Ghost"
        case .bat: "Bat"
        case .diya: "Diya"
        case .lotus: "Lotus"
        case .lantern: "Lantern"
        case .firework: "Firework"
        case .luckyCoin: "Lucky Coin"
        case .spiderMan: "Spider-Man"
        case .captainAmericaShield: "Captain America Shield"
        case .ironManHelmet: "Iron Man Helmet"
        case .thorHammer: "Thor Hammer"
        case .hulkFist: "Hulk Fist"
        case .batmanSymbol: "Batman Symbol"
        case .supermanShield: "Superman Shield"
        case .wonderWomanEmblem: "Wonder Woman Emblem"
        case .shazamLightning: "Shazam Lightning"
        case .greenLanternRing: "Green Lantern Ring"
        case .vel: "Vel"
        case .vinayagarCoin: "Vinayagar Coin"
        case .omSymbol: "OM Symbol"
        case .karuppuStatue: "Karuppu Statue"
        case .templeBell: "Temple Bell"
        case .btsMemberOne: "BTS Member 1"
        case .btsMemberTwo: "BTS Member 2"
        case .btsMemberThree: "BTS Member 3"
        case .btsMemberFour: "BTS Member 4"
        case .btsMemberFive: "BTS Member 5"
        case .btsMemberSix: "BTS Member 6"
        case .btsMemberSeven: "BTS Member 7"
        }
    }

    /// SF Symbol used for the menu bar item.
    var symbolName: String {
        switch self {
        case .circle: "circle.fill"
        case .camera: "camera.fill"
        case .star: "star.fill"
        case .heart: "heart.fill"
        case .diamond: "diamond.fill"
        case .nazar: "eye.fill"
        case .hamsa: "hand.raised.fill"
        case .nimbuMirchi: "leaf.fill"
        case .ghanta: "bell.fill"
        case .drishtiBommai: "theatermasks.fill"
        case .panchangJie: "seal.fill"
        case .daruma: "face.smiling.fill"
        case .manekiNeko: "cat.fill"
        case .horseshoe: "u.circle.fill"
        case .scarab: "ant.fill"
        case .himmeli: "pyramid.fill"
        case .snowflake: "snowflake"
        case .bell: "bell.and.waves.left.and.right.fill"
        case .candyCane: "figure.walk.motion"
        case .pumpkin: "carrot.fill"
        case .ghost: "figure.stand"
        case .bat: "bolt.horizontal.fill"
        case .diya: "flame.fill"
        case .lotus: "camera.macro"
        case .lantern: "lightbulb.fill"
        case .firework: "sparkles"
        case .luckyCoin: "centsign.circle.fill"
        case .spiderMan: "figure.climbing"
        case .captainAmericaShield: "shield.fill"
        case .ironManHelmet: "faceid"
        case .thorHammer: "hammer.fill"
        case .hulkFist: "hand.raised.fill"
        case .batmanSymbol: "moon.fill"
        case .supermanShield: "diamond.fill"
        case .wonderWomanEmblem: "seal.fill"
        case .shazamLightning: "bolt.fill"
        case .greenLanternRing: "circle.circle.fill"
        case .vel: "location.north.fill"
        case .vinayagarCoin: "centsign.circle.fill"
        case .omSymbol: "circle.hexagonpath.fill"
        case .karuppuStatue: "figure.stand"
        case .templeBell: "bell.circle.fill"
        case .btsMemberOne: "1.circle.fill"
        case .btsMemberTwo: "2.circle.fill"
        case .btsMemberThree: "3.circle.fill"
        case .btsMemberFour: "4.circle.fill"
        case .btsMemberFive: "5.circle.fill"
        case .btsMemberSix: "6.circle.fill"
        case .btsMemberSeven: "7.circle.fill"
        }
    }
}
