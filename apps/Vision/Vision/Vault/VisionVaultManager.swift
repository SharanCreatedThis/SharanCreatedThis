//
//  VisionVaultManager.swift
//  Vision
//
//  Central orchestration manager for Vision Vault platform.
//

import Foundation
import Observation
import LocalAuthentication
import AppKit

@Observable
@MainActor
public final class VisionVaultManager {
    public static let shared = VisionVaultManager()

    public var isEnabled: Bool = false {
        didSet {
            if isEnabled {
                startVaultMonitoring()
            } else {
                stopVaultMonitoring()
            }
        }
    }

    public let profileStore = VaultProfileStore.shared
    public let appLockManager = VaultAppLockManager.shared
    public let fileManager = VaultFileProtectionManager.shared
    public let auditLogger = VaultAuditLogger.shared

    public private(set) var isAuthenticating: Bool = false
    public private(set) var statusMessage: String = "Vault active"

    // Retry state — observable so the shield overlay can show progress.
    // Settable by FaceUnlockCoordinator which drives the real scan loop.
    public var faceRetryCount: Int = 0
    public var maxFaceRetries: Int = 5
    public var retryStatusMessage: String = ""
    public var isFallingBackToTouchID: Bool = false

    private var retryTimer: Timer?

    private init() {}

    public func startVaultMonitoring() {
        var protectedApps: Set<String> = []
        for profile in profileStore.profiles where profile.isEnabled {
            for rule in profile.rules where rule.isApp {
                protectedApps.insert(rule.targetIdentifier)
            }
        }
        appLockManager.startMonitoring(protectedBundleIDs: protectedApps)
        statusMessage = "Monitoring \(protectedApps.count) protected applications"
    }

    public func stopVaultMonitoring() {
        appLockManager.stopMonitoring()
        statusMessage = "Vault disarmed"
    }

    /// Evaluates biometric authentication for a given Vault rule requirement.
    /// For face-based modes, if the initial verification fails, retries every 2 seconds
    /// up to 5 times. If all retries exhaust, falls back to Touch ID (fingerprint).
    public func authenticateAccess(
        targetName: String,
        mode: VaultAuthMode,
        faceVerified: Bool = false,
        completion: @escaping (Bool, String?) -> Void
    ) {
        isAuthenticating = true
        resetRetryState()

        switch mode {
        case .faceOnly:
            if faceVerified {
                auditLogger.logAccess(targetName: targetName, authMode: mode.rawValue, success: true)
                finishAuth()
                completion(true, nil)
            } else {
                // Face failed — start retry loop, then fall back to Touch ID
                startFaceRetryLoop(targetName: targetName, mode: mode) { [weak self] retrySuccess in
                    guard let self else { return }
                    if retrySuccess {
                        self.auditLogger.logAccess(targetName: targetName, authMode: mode.rawValue, success: true)
                        self.finishAuth()
                        completion(true, nil)
                    } else {
                        // All retries exhausted — fall back to Touch ID
                        self.fallBackToTouchID(targetName: targetName, mode: mode, completion: completion)
                    }
                }
            }

        case .touchIDOnly:
            authenticateTouchID(reason: "Unlock \(targetName)") { [weak self] success, err in
                self?.auditLogger.logAccess(targetName: targetName, authMode: mode.rawValue, success: success, failureReason: err)
                self?.finishAuth()
                completion(success, err)
            }

        case .faceOrTouchID:
            if faceVerified {
                auditLogger.logAccess(targetName: targetName, authMode: mode.rawValue, success: true)
                finishAuth()
                completion(true, nil)
            } else {
                // Face failed — start retry loop, then fall back to Touch ID
                startFaceRetryLoop(targetName: targetName, mode: mode) { [weak self] retrySuccess in
                    guard let self else { return }
                    if retrySuccess {
                        self.auditLogger.logAccess(targetName: targetName, authMode: mode.rawValue, success: true)
                        self.finishAuth()
                        completion(true, nil)
                    } else {
                        self.fallBackToTouchID(targetName: targetName, mode: mode, completion: completion)
                    }
                }
            }

        case .faceAndTouchID:
            guard faceVerified else {
                // Face factor failed — start retry loop, then fall back to Touch ID
                startFaceRetryLoop(targetName: targetName, mode: mode) { [weak self] retrySuccess in
                    guard let self else { return }
                    if retrySuccess {
                        // Face passed on retry — still need Touch ID second factor
                        self.retryStatusMessage = "Face verified — confirm with fingerprint"
                        self.authenticateTouchID(reason: "Second Factor Authentication for \(targetName)") { [weak self] success, err in
                            self?.auditLogger.logAccess(targetName: targetName, authMode: mode.rawValue, success: success, failureReason: err)
                            self?.finishAuth()
                            completion(success, err)
                        }
                    } else {
                        self.fallBackToTouchID(targetName: targetName, mode: mode, completion: completion)
                    }
                }
                return
            }
            authenticateTouchID(reason: "Second Factor Authentication for \(targetName)") { [weak self] success, err in
                self?.auditLogger.logAccess(targetName: targetName, authMode: mode.rawValue, success: success, failureReason: err)
                self?.finishAuth()
                completion(success, err)
            }
        }
    }

    // MARK: - Face Retry Loop

    /// Retries face verification every 2 seconds up to `maxFaceRetries` times.
    /// Posts a notification each attempt so the face recognition engine rescans.
    /// Calls `completion(true)` if any attempt succeeds, `completion(false)` after all fail.
    private func startFaceRetryLoop(
        targetName: String,
        mode: VaultAuthMode,
        completion: @escaping (Bool) -> Void
    ) {
        faceRetryCount = 0
        retryStatusMessage = "Face not recognized — retrying…"

        retryTimer?.invalidate()
        retryTimer = Timer.scheduledTimer(withTimeInterval: 2.0, repeats: true) { [weak self] timer in
            Task { @MainActor [weak self] in
                guard let self else {
                    timer.invalidate()
                    return
                }

                self.faceRetryCount += 1
                self.retryStatusMessage = "Retry \(self.faceRetryCount) of \(self.maxFaceRetries)…"

                // Request the face recognition engine to perform a new scan
                NotificationCenter.default.post(
                    name: Notification.Name("VisionVaultRetryFaceScan"),
                    object: nil,
                    userInfo: ["attempt": self.faceRetryCount, "targetName": targetName]
                )

                // Check if face was verified by the recognition engine
                // The recognition callback will post VisionVaultFaceScanResult
                // For now, we listen synchronously — the real integration would
                // check the face engine's last result. We give a brief window
                // (0.5s) for the engine to respond.
                try? await Task.sleep(nanoseconds: 500_000_000)

                // Check if face was verified during this retry window
                let verified = self.checkFaceVerificationResult()

                if verified {
                    timer.invalidate()
                    self.retryTimer = nil
                    self.retryStatusMessage = "Face recognized ✓"
                    self.auditLogger.logAccess(targetName: targetName, authMode: mode.rawValue, success: true)
                    completion(true)
                    return
                }

                if self.faceRetryCount >= self.maxFaceRetries {
                    timer.invalidate()
                    self.retryTimer = nil
                    self.retryStatusMessage = "Face not recognized — switching to fingerprint"
                    self.auditLogger.logAccess(
                        targetName: targetName,
                        authMode: mode.rawValue,
                        success: false,
                        failureReason: "Face verification failed after \(self.maxFaceRetries) retries"
                    )
                    completion(false)
                }
            }
        }
    }

    /// Checks whether the face recognition engine has produced a positive result.
    /// The actual retry scanning is handled by FaceUnlockCoordinator.runVaultScanCycle,
    /// which posts a notification when a face is recognized during a retry window.
    /// This property is set externally by the coordinator.
    public var lastFaceScanSuccess: Bool = false

    private func checkFaceVerificationResult() -> Bool {
        return lastFaceScanSuccess
    }

    // MARK: - Touch ID Fallback

    private func fallBackToTouchID(
        targetName: String,
        mode: VaultAuthMode,
        completion: @escaping (Bool, String?) -> Void
    ) {
        isFallingBackToTouchID = true
        retryStatusMessage = "Use fingerprint to unlock"

        authenticateTouchID(reason: "Face verification failed. Unlock \(targetName) with fingerprint") { [weak self] success, err in
            guard let self else { return }
            let logMode = "\(mode.rawValue) → Touch ID fallback"
            self.auditLogger.logAccess(targetName: targetName, authMode: logMode, success: success, failureReason: err)
            self.finishAuth()
            completion(success, err)
        }
    }

    // MARK: - Helpers

    private func resetRetryState() {
        faceRetryCount = 0
        retryStatusMessage = ""
        isFallingBackToTouchID = false
        retryTimer?.invalidate()
        retryTimer = nil
    }

    private func finishAuth() {
        isAuthenticating = false
        resetRetryState()
    }

    private func authenticateTouchID(reason: String, completion: @escaping (Bool, String?) -> Void) {
        let context = LAContext()
        context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: reason) { success, error in
            Task { @MainActor in
                if success {
                    completion(true, nil)
                } else {
                    let msg = error?.localizedDescription ?? "Touch ID failed"
                    completion(false, msg)
                }
            }
        }
    }
}
