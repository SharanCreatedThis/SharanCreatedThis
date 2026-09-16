//
//  AnalyticsBackend.swift
//  Vision
//
//  Decoupled backend protocol for privacy-preserving event analytics.
//  Zero collection of biometric data, face vectors, camera frames, or passwords.
//

import Foundation

/// Protocol for pluggable analytics backends (Local Journal, PostHog, etc.)
public protocol AnalyticsBackend: Sendable {
    func track(event: String, properties: [String: Any])
}

/// Lightweight, in-memory and UserDefaults-backed ring buffer of recent local events.
/// Never sends any data over the network.
public final class LocalAnalyticsBackend: AnalyticsBackend, @unchecked Sendable {
    public static let shared = LocalAnalyticsBackend()

    private let maxStoredEvents = 100
    private let storageKey = "VisionAnalytics.localEventsJournal"
    private let lock = NSLock()

    public struct StoredEvent: Codable, Identifiable, Sendable {
        public let id: UUID
        public let event: String
        public let timestamp: Date
        public let properties: [String: String]

        public init(id: UUID = UUID(), event: String, timestamp: Date = Date(), properties: [String: String]) {
            self.id = id
            self.event = event
            self.timestamp = timestamp
            self.properties = properties
        }
    }

    private var events: [StoredEvent] = []

    public init() {
        loadEvents()
    }

    public func track(event: String, properties: [String: Any]) {
        lock.lock()
        defer { lock.unlock() }

        // Sanitize properties to string map for safe local persistence
        var sanitized: [String: String] = [:]
        for (k, v) in properties {
            sanitized[k] = String(describing: v)
        }

        let item = StoredEvent(event: event, properties: sanitized)
        events.append(item)
        if events.count > maxStoredEvents {
            events.removeFirst(events.count - maxStoredEvents)
        }
        persistEvents()
    }

    public func getRecentEvents() -> [StoredEvent] {
        lock.lock()
        defer { lock.unlock() }
        return events
    }

    public func clear() {
        lock.lock()
        defer { lock.unlock() }
        events.removeAll()
        UserDefaults.standard.removeObject(forKey: storageKey)
    }

    private func persistEvents() {
        if let data = try? JSONEncoder().encode(events) {
            UserDefaults.standard.set(data, forKey: storageKey)
        }
    }

    private func loadEvents() {
        guard let data = UserDefaults.standard.data(forKey: storageKey),
              let decoded = try? JSONDecoder().decode([StoredEvent].self, from: data) else {
            return
        }
        self.events = decoded
    }
}

/// PostHog backend stub designed for future zero-code activation.
/// Conforms to PostHog capture format without requiring external dependencies today.
public final class PostHogAnalyticsBackend: AnalyticsBackend, @unchecked Sendable {
    public static let shared = PostHogAnalyticsBackend()

    private let lock = NSLock()
    private var apiKey: String?
    private var host: URL = URL(string: "https://app.posthog.com")!
    private var isEnabled: Bool = false

    public init() {}

    /// Configure PostHog credentials when ready for remote telemetry.
    public func configure(apiKey: String, host: URL = URL(string: "https://app.posthog.com")!) {
        lock.lock()
        defer { lock.unlock() }
        self.apiKey = apiKey
        self.host = host
        self.isEnabled = true
    }

    public func track(event: String, properties: [String: Any]) {
        lock.lock()
        let active = isEnabled && apiKey != nil
        lock.unlock()

        guard active else { return }

        // Strict privacy assertion: never transmit biometric templates or personal identifiers
        let forbiddenKeys = ["face", "vector", "embedding", "password", "image", "frame", "name"]
        for key in forbiddenKeys {
            if properties.keys.contains(where: { $0.lowercased().contains(key) }) {
                assertionFailure("Privacy violation: attempted to log forbidden key '\(key)' to PostHog")
                return
            }
        }

        // Ready for URLSession / PostHog capture batching
    }
}
