//
//  SettingsTab.swift
//  vision
//
//  The tab bar's tab list. Debug-only Face Lab — the remaining live test
//  harness, kept for ongoing tuning — is appended only once revealed.
//

import SwiftUI

enum SettingsTab: String, CaseIterable, Identifiable, Hashable {
    case general
    case yourFace
    case security
    case camera
    case recognition
    case guard_
    case vault
    case about
    case debugFaceLab

    var id: String { rawValue }

    var title: String {
        switch self {
        case .general: return "General"
        case .yourFace: return "Face"
        case .security: return "Security"
        case .camera: return "Camera"
        case .recognition: return "Unlock"
        case .guard_: return "Guard"
        case .vault: return "Vault"
        case .about: return "About"
        case .debugFaceLab: return "Face Lab"
        }
    }

    var subtitle: String {
        switch self {
        case .general: return "Startup, triggers & animations"
        case .yourFace: return "Enrolled identities & capture quality"
        case .security: return "Password, encryption & auto-lock"
        case .camera: return "Camera source & live diagnostics"
        case .recognition: return "Confidence, distance & liveness"
        case .guard_: return "Absence detection & auto-lock"
        case .vault: return "Biometric app & file protection"
        case .about: return "Vision updates & developer info"
        case .debugFaceLab: return "Live testing & diagnostics"
        }
    }

    var icon: SettingsTabIcon {
        switch self {
        case .general: return .system("gearshape.fill")
        case .yourFace: return .system("faceid")
        case .security: return .system("lock.shield.fill")
        case .camera: return .system("video.fill")
        case .recognition: return .system("sparkle")
        case .guard_: return .system("shield.lefthalf.filled")
        case .vault: return .system("lock.circle.fill")
        case .about: return .system("info.circle.fill")
        case .debugFaceLab: return .system("flask.fill")
        }
    }

    /// Tabs in sidebar order, minus `.debugFaceLab` unless revealed.
    static func visibleTabs(includingDebug: Bool) -> [SettingsTab] {
        includingDebug ? allCases : allCases.filter { $0 != .debugFaceLab }
    }
}

