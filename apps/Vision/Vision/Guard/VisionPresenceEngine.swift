//
//  VisionPresenceEngine.swift
//  Vision
//
//  Multi-signal presence engine for Vision Guard.
//  Combines face confidence, camera distance ratio, head pose attention tracking,
//  micro-movement delta, and hardware input idle time into a normalized presence score.
//

import Foundation
import CoreGraphics
import Vision

public struct PresenceSample: Sendable {
    public let timestamp: Date
    public let score: Float           // Normalized 0.0 (completely absent) to 1.0 (actively present)
    public let distanceRatio: Float   // Face bounding box width relative to camera frame width
    public let yawAngle: Float        // Head yaw in radians
    public let pitchAngle: Float      // Head pitch in radians
    public let isFacingScreen: Bool   // True if user attention is directed at display
    public let isHardwareIdle: Bool   // True if keyboard/mouse idle time exceeds threshold
}

@MainActor
public final class VisionPresenceEngine {
    public static let shared = VisionPresenceEngine()

    /// Rolling presence history timeline (up to 60 seconds)
    private var sampleTimeline: [PresenceSample] = []
    private let maxTimelineDuration: TimeInterval = 60.0

    /// Hardware idle time threshold before input activity is considered stale (e.g. 5 seconds)
    private let hardwareIdleThresholdSeconds: TimeInterval = 5.0

    private init() {}

    /// Evaluates current frame observations and system state to produce a composite PresenceSample.
    public func evaluatePresence(
        faceObs: VNFaceObservation?,
        frameWidth: CGFloat,
        frameHeight: CGFloat
    ) -> PresenceSample {
        let now = Date()

        // 1. Hardware Input Idle Signal
        let idleSeconds = getSystemHardwareIdleSeconds()
        let isHardwareIdle = idleSeconds > hardwareIdleThresholdSeconds

        guard let face = faceObs, frameWidth > 0 else {
            // No face detected in frame
            let sample = PresenceSample(
                timestamp: now,
                score: isHardwareIdle ? 0.0 : 0.4, // Recent mouse/keyboard input prevents instant 0
                distanceRatio: 0.0,
                yawAngle: 0.0,
                pitchAngle: 0.0,
                isFacingScreen: false,
                isHardwareIdle: isHardwareIdle
            )
            recordSample(sample)
            return sample
        }

        // 2. Distance Estimation (Face width ratio to frame width)
        let distanceRatio = Float(face.boundingBox.width)

        // 3. Head Pose & Attention Tracking
        let yaw = face.yaw?.floatValue ?? 0.0
        let pitch = face.pitch?.floatValue ?? 0.0
        let isFacingScreen = abs(yaw) < 0.35 && abs(pitch) < 0.30

        // 4. Calculate Weighted Score
        var score: Float = 0.5

        // Face Confidence (+0.3)
        score += Float(face.confidence) * 0.3

        // Attention Bonus (+0.2 if looking directly at display)
        if isFacingScreen {
            score += 0.2
        }

        // Distance Check (Bonus if within comfortable viewing distance > 0.15 width)
        if distanceRatio > 0.15 {
            score += 0.1
        }

        // Hardware Activity Bonus (+0.2 if active mouse/keyboard)
        if !isHardwareIdle {
            score += 0.2
        }

        let finalScore = min(max(score, 0.0), 1.0)

        let sample = PresenceSample(
            timestamp: now,
            score: finalScore,
            distanceRatio: distanceRatio,
            yawAngle: yaw,
            pitchAngle: pitch,
            isFacingScreen: isFacingScreen,
            isHardwareIdle: isHardwareIdle
        )
        recordSample(sample)
        return sample
    }

    /// Queries macOS system event source for elapsed seconds since last hardware mouse or keyboard event.
    public func getSystemHardwareIdleSeconds() -> TimeInterval {
        let idleTime = CGEventSource.secondsSinceLastEventType(.hidSystemState, eventType: CGEventType(rawValue: UInt32.max)!)
        return idleTime
    }

    private func recordSample(_ sample: PresenceSample) {
        sampleTimeline.append(sample)
        let cutoff = Date().addingTimeInterval(-maxTimelineDuration)
        sampleTimeline.removeAll { $0.timestamp < cutoff }
    }

    /// Calculates moving average score over the last N seconds.
    public func averagePresenceScore(overWindow windowSeconds: TimeInterval) -> Float {
        let cutoff = Date().addingTimeInterval(-windowSeconds)
        let recent = sampleTimeline.filter { $0.timestamp >= cutoff }
        guard !recent.isEmpty else { return 0.0 }
        let total = recent.reduce(0.0) { $0 + $1.score }
        return total / Float(recent.count)
    }

    public func clearTimeline() {
        sampleTimeline.removeAll()
    }
}
