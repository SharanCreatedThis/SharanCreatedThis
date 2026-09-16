//
//  VisionAwayDetector.swift
//  Vision
//
//  Evaluates user absence thresholds and coordinates countdown timers for Vision Guard.
//

import Foundation
import Observation

public enum GuardAbsenceRule: TimeInterval, CaseIterable, Sendable {
    case seconds10 = 10.0
    case seconds30 = 30.0
    case minute1 = 60.0
    case minutes5 = 300.0

    public var title: String {
        switch self {
        case .seconds10: return "10 Seconds Away"
        case .seconds30: return "30 Seconds Away"
        case .minute1: return "1 Minute Away"
        case .minutes5: return "5 Minutes Away"
        }
    }
}

@Observable
@MainActor
public final class VisionAwayDetector {
    public var selectedRule: GuardAbsenceRule = .seconds30
    public private(set) var isAbsenceConfirmed: Bool = false
    public private(set) var absenceDurationSeconds: TimeInterval = 0.0
    private var absenceStartInstant: ContinuousClock.Instant?

    public init() {}

    /// Evaluates current presence score against absence threshold.
    public func updateAbsenceState(currentPresenceScore: Float) {
        if currentPresenceScore < 0.25 {
            if absenceStartInstant == nil {
                absenceStartInstant = .now
            }
            if let start = absenceStartInstant {
                let duration = ContinuousClock.now - start
                absenceDurationSeconds = Double(duration.components.seconds)
            }
            if absenceDurationSeconds >= selectedRule.rawValue {
                isAbsenceConfirmed = true
            }
        } else {
            reset()
        }
    }

    public func reset() {
        absenceStartInstant = nil
        absenceDurationSeconds = 0.0
        isAbsenceConfirmed = false
    }
}
