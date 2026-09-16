//
//  LaunchAtLogin.swift
//  vision
//
//  Thin wrapper around SMAppService.mainApp. Not persisted via VisionSettings — SMAppService's own status is already the source of truth.
//

import Foundation
import ServiceManagement

enum LaunchAtLogin {
    private static let hasConfiguredDefaultKey = "LaunchAtLogin.hasConfiguredDefault"

    static var isEnabled: Bool {
        SMAppService.mainApp.status == .enabled
    }

    /// Sets Launch at Login to enabled on initial run if not explicitly configured before.
    static func ensureDefaultLaunchAtLogin() {
        guard !UserDefaults.standard.bool(forKey: hasConfiguredDefaultKey) else { return }
        UserDefaults.standard.set(true, forKey: hasConfiguredDefaultKey)
        if SMAppService.mainApp.status != .enabled {
            try? SMAppService.mainApp.register()
        }
    }

    static func setEnabled(_ enabled: Bool) throws {
        UserDefaults.standard.set(true, forKey: hasConfiguredDefaultKey)
        if enabled {
            guard SMAppService.mainApp.status != .enabled else { return }
            try SMAppService.mainApp.register()
        } else {
            guard SMAppService.mainApp.status == .enabled else { return }
            try SMAppService.mainApp.unregister()
        }
    }
}

