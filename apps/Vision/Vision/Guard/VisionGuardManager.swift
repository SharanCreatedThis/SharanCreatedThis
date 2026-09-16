//
//  VisionGuardManager.swift
//  Vision
//
//  Central orchestration manager for Vision Guard auto-lock and return platform.
//

import Foundation
import Observation
import AppKit
import Vision

public enum GuardState: String, Sendable {
    case present = "User Present"
    case evaluatingAway = "Evaluating Absence"
    case awayPending = "Lock Pending"
    case locked = "Mac Locked"
    case returnDetecting = "User Returned"
}

@Observable
@MainActor
public final class VisionGuardManager {
    public static let shared = VisionGuardManager()

    public var isEnabled: Bool = false {
        didSet {
            if !isEnabled {
                reset()
            }
        }
    }

    public private(set) var currentState: GuardState = .present
    public private(set) var currentPresenceScore: Float = 1.0
    public private(set) var statusMessage: String = "Monitoring presence"

    public let presenceEngine = VisionPresenceEngine.shared
    public let awayDetector = VisionAwayDetector()
    public let returnDetector = VisionReturnDetector()
    public let safeguardProvider = PresenceSafeguardProvider.shared

    private init() {}

    /// Main loop tick called on new camera frame observations or timer ticks.
    public func processFrameObservation(faceObs: VNFaceObservation?, frameWidth: CGFloat, frameHeight: CGFloat) {
        guard isEnabled else { return }

        // 1. Evaluate presence sample
        let sample = presenceEngine.evaluatePresence(faceObs: faceObs, frameWidth: frameWidth, frameHeight: frameHeight)
        currentPresenceScore = sample.score

        // 2. State Machine Evaluation
        switch currentState {
        case .present:
            if sample.score < 0.25 {
                currentState = .evaluatingAway
                statusMessage = "Absence detected..."
            }

        case .evaluatingAway:
            if sample.score >= 0.6 {
                currentState = .present
                awayDetector.reset()
                statusMessage = "User present"
            } else {
                awayDetector.updateAbsenceState(currentPresenceScore: sample.score)
                if awayDetector.isAbsenceConfirmed {
                    // Check safeguards before proceeding to lock
                    let safeguard = safeguardProvider.isLockSafeguarded()
                    if safeguard.safeguarded {
                        statusMessage = "Lock paused: \(safeguard.reason ?? "Active media/call")"
                    } else {
                        currentState = .awayPending
                        executeMacLock()
                    }
                }
            }

        case .awayPending, .locked:
            returnDetector.evaluateReturnSignal(faceObs: faceObs, distanceRatio: sample.distanceRatio)
            if returnDetector.isReturnDetected {
                currentState = .returnDetecting
                statusMessage = "User return detected — triggering unlock..."
            }

        case .returnDetecting:
            // Unlock triggered by FaceUnlockCoordinator
            break
        }
    }

    /// Triggers macOS screen lock.
    public func executeMacLock() {
        currentState = .locked
        statusMessage = "Auto-locked Mac"
        
        // Dispatch macOS screen lock via SACLockScreenImmediate / CGSession lock
        let libHandle = dlopen("/System/Library/PrivateFrameworks/login.framework/Versions/Current/login", RTLD_LAZY)
        if let libHandle {
            let sym = dlsym(libHandle, "SACLockScreenImmediate")
            if let sym {
                typealias SACLockScreenImmediateFunc = @convention(c) () -> Void
                let lockFunc = unsafeBitCast(sym, to: SACLockScreenImmediateFunc.self)
                lockFunc()
            }
            dlclose(libHandle)
        }
    }

    public func reset() {
        currentState = .present
        currentPresenceScore = 1.0
        statusMessage = "Monitoring presence"
        presenceEngine.clearTimeline()
        awayDetector.reset()
        returnDetector.reset()
    }
}
