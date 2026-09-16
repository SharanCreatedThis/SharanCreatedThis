//
//  VaultProfileStore.swift
//  Vision
//
//  Data models and storage for Vision Vault protection profiles and authentication rules.
//

import Foundation
import Observation

public enum VaultAuthMode: String, Codable, CaseIterable, Identifiable, Sendable {
    case faceOnly = "Face Only"
    case touchIDOnly = "Touch ID Only"
    case faceAndTouchID = "Face + Touch ID (Multi-Factor)"
    case faceOrTouchID = "Face or Touch ID"

    public var id: String { rawValue }

    public var title: String { rawValue }
}

public struct VaultRule: Identifiable, Codable, Sendable {
    public var id: UUID
    public var name: String
    public var targetIdentifier: String // Bundle ID (e.g. "com.apple.Photos") or path
    public var isApp: Bool
    public var authMode: VaultAuthMode

    public init(id: UUID = UUID(), name: String, targetIdentifier: String, isApp: Bool, authMode: VaultAuthMode = .faceOnly) {
        self.id = id
        self.name = name
        self.targetIdentifier = targetIdentifier
        self.isApp = isApp
        self.authMode = authMode
    }
}

public struct VaultProfile: Identifiable, Codable, Sendable {
    public var id: UUID
    public var name: String
    public var iconName: String
    public var rules: [VaultRule]
    public var isEnabled: Bool

    public init(id: UUID = UUID(), name: String, iconName: String = "lock.shield", rules: [VaultRule] = [], isEnabled: Bool = true) {
        self.id = id
        self.name = name
        self.iconName = iconName
        self.rules = rules
        self.isEnabled = isEnabled
    }
}

@Observable
@MainActor
public final class VaultProfileStore {
    public static let shared = VaultProfileStore()
    private let storageKey = "VisionSettings.VaultProfiles"

    public private(set) var profiles: [VaultProfile] = []

    private init() {
        loadProfiles()
    }

    public func loadProfiles() {
        if let data = UserDefaults.standard.data(forKey: storageKey),
           let decoded = try? JSONDecoder().decode([VaultProfile].self, from: data) {
            profiles = decoded
        } else {
            // Default Profiles
            profiles = [
                VaultProfile(name: "Personal", iconName: "person.fill", rules: [
                    VaultRule(name: "Photos App", targetIdentifier: "com.apple.Photos", isApp: true, authMode: .faceOnly),
                    VaultRule(name: "Messages App", targetIdentifier: "com.apple.MobileSMS", isApp: true, authMode: .faceOnly)
                ]),
                VaultProfile(name: "Work & Projects", iconName: "briefcase.fill", rules: [
                    VaultRule(name: "Final Cut Pro", targetIdentifier: "com.apple.FinalCut", isApp: true, authMode: .faceOrTouchID)
                ])
            ]
            saveProfiles()
        }
    }

    public func saveProfiles() {
        if let encoded = try? JSONEncoder().encode(profiles) {
            UserDefaults.standard.set(encoded, forKey: storageKey)
        }
    }

    public func addProfile(_ profile: VaultProfile) {
        profiles.append(profile)
        saveProfiles()
    }

    public func updateProfile(_ profile: VaultProfile) {
        if let idx = profiles.firstIndex(where: { $0.id == profile.id }) {
            profiles[idx] = profile
            saveProfiles()
        }
    }

    public func deleteProfile(id: UUID) {
        profiles.removeAll { $0.id == id }
        saveProfiles()
    }
}
