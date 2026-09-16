//
//  BrandMigrationManager.swift
//  Vision
//
//  Handles zero-data-loss background migration from Vision (legacy) to Vision (v1.0+).
//  Migrates UserDefaults keys, Keychain credentials, and Application Support file stores.
//

import Foundation
import Security

enum BrandMigrationManager {
    private static let userDefaultsMigrationKey = "VisionSettings.hasMigratedFromVision"
    private static let keychainMigrationKey = "VisionSettings.hasMigratedKeychain"
    private static let storageMigrationKey = "VisionSettings.hasMigratedFileStorage"

    /// Runs all brand migrations safely on app startup before settings or credentials are loaded.
    static func runAllMigrationsIfNeeded() {
        migrateUserDefaultsIfNeeded()
        migrateKeychainIfNeeded()
        migrateFileStorageIfNeeded()
    }

    // MARK: - 1. UserDefaults Migration
    static func migrateUserDefaultsIfNeeded() {
        let defaults = UserDefaults.standard
        guard !defaults.bool(forKey: userDefaultsMigrationKey) else { return }

        let oldPrefix = "VisionSettings."
        let newPrefix = "VisionSettings."
        let keysToMigrate = [
            "isFaceUnlockEnabled", "matchThreshold", "livenessChecksEnabled",
            "livenessMode", "minimumFaceWidth", "unlockAnimationStyle",
            "showUnlockAnimation", "playUnlockAnimation", "unlockTriggers",
            "retryOnHover", "faceDetectionSeconds", "autoRetryOnce",
            "hapticFeedbackEnabled", "preferredDisplayID", "preferredDisplayName",
            "autoLockIntervalDays", "defaultCameraID", "builtInDisplayCameraID",
            "externalDisplayCameraID", "hasCompletedOnboarding",
            "onboardingResumeStep", "hasAcknowledgedSecurityNotice"
        ]

        for key in keysToMigrate {
            let oldKey = oldPrefix + key
            let newKey = newPrefix + key
            if let value = defaults.object(forKey: oldKey), defaults.object(forKey: newKey) == nil {
                defaults.set(value, forKey: newKey)
            }
        }
        defaults.set(true, forKey: userDefaultsMigrationKey)
    }

    // MARK: - 2. Keychain Migration
    static func migrateKeychainIfNeeded() {
        let defaults = UserDefaults.standard
        guard !defaults.bool(forKey: keychainMigrationKey) else { return }

        let oldService = "com.sharan.vision"
        let newService = "com.sharan.vision"
        let accounts = ["sessionKey", "encryptedPassword"]

        for account in accounts {
            let oldQuery: [String: Any] = [
                kSecClass as String: kSecClassGenericPassword,
                kSecAttrService as String: oldService,
                kSecAttrAccount as String: account,
                kSecReturnData as String: true,
                kSecMatchLimit as String: kSecMatchLimitOne
            ]
            var item: CFTypeRef?
            let status = SecItemCopyMatching(oldQuery as CFDictionary, &item)
            if status == errSecSuccess, let data = item as? Data {
                let addQuery: [String: Any] = [
                    kSecClass as String: kSecClassGenericPassword,
                    kSecAttrService as String: newService,
                    kSecAttrAccount as String: account,
                    kSecValueData as String: data,
                    kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly
                ]
                SecItemDelete(addQuery as CFDictionary)
                let saveStatus = SecItemAdd(addQuery as CFDictionary, nil)
                if saveStatus == errSecSuccess {
                    let deleteQuery: [String: Any] = [
                        kSecClass as String: kSecClassGenericPassword,
                        kSecAttrService as String: oldService,
                        kSecAttrAccount as String: account
                    ]
                    SecItemDelete(deleteQuery as CFDictionary)
                }
            }
        }
        defaults.set(true, forKey: keychainMigrationKey)
    }

    // MARK: - 3. File Storage Migration
    static func migrateFileStorageIfNeeded() {
        let fm = FileManager.default
        guard let appSupport = fm.urls(for: .applicationSupportDirectory, in: .userDomainMask).first else { return }
        let oldDir = appSupport.appendingPathComponent("vision", isDirectory: true)
        let newDir = appSupport.appendingPathComponent("Vision", isDirectory: true)

        if fm.fileExists(atPath: oldDir.path) {
            try? fm.createDirectory(at: newDir, withIntermediateDirectories: true)
            if let files = try? fm.contentsOfDirectory(at: oldDir, includingPropertiesForKeys: nil) {
                for file in files {
                    let destination = newDir.appendingPathComponent(file.lastPathComponent)
                    if !fm.fileExists(atPath: destination.path) {
                        do {
                            try fm.copyItem(at: file, to: destination)
                            if fm.fileExists(atPath: destination.path) {
                                try fm.removeItem(at: file)
                            }
                        } catch {
                            print("[BrandMigration] Failed to migrate file \(file.lastPathComponent): \(error)")
                        }
                    }
                }
            }
            if (try? fm.contentsOfDirectory(atPath: oldDir.path).isEmpty) == true {
                try? fm.removeItem(at: oldDir)
            }
        }
    }
}
