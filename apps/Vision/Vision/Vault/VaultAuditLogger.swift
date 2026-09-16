//
//  VaultAuditLogger.swift
//  Vision
//
//  Cryptographic audit logger for Vision Vault authentication events.
//

import Foundation

public struct VaultAuditRecord: Identifiable, Codable, Sendable {
    public let id: UUID
    public let timestamp: Date
    public let targetName: String
    public let authMode: String
    public let success: Bool
    public let failureReason: String?

    public init(id: UUID = UUID(), timestamp: Date = Date(), targetName: String, authMode: String, success: Bool, failureReason: String? = nil) {
        self.id = id
        self.timestamp = timestamp
        self.targetName = targetName
        self.authMode = authMode
        self.success = success
        self.failureReason = failureReason
    }
}

@MainActor
public final class VaultAuditLogger {
    public static let shared = VaultAuditLogger()
    private let storageKey = "VisionSettings.VaultAuditLogs"

    public private(set) var logs: [VaultAuditRecord] = []

    private init() {
        loadLogs()
    }

    private func loadLogs() {
        if let data = UserDefaults.standard.data(forKey: storageKey),
           let decoded = try? JSONDecoder().decode([VaultAuditRecord].self, from: data) {
            logs = decoded
        }
    }

    public func logAccess(targetName: String, authMode: String, success: Bool, failureReason: String? = nil) {
        let record = VaultAuditRecord(targetName: targetName, authMode: authMode, success: success, failureReason: failureReason)
        logs.insert(record, at: 0)
        if logs.count > 100 {
            logs = Array(logs.prefix(100))
        }
        if let encoded = try? JSONEncoder().encode(logs) {
            UserDefaults.standard.set(encoded, forKey: storageKey)
        }
    }

    public func clearLogs() {
        logs.removeAll()
        UserDefaults.standard.removeObject(forKey: storageKey)
    }
}
