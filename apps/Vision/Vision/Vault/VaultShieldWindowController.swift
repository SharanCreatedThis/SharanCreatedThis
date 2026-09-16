//
//  VaultShieldWindowController.swift
//  Vision
//
//  Full-screen biometric shield window overlay.
//  Blocks application window interaction and presents "Unlock with Face ID to view app".
//

import SwiftUI
import AppKit

@MainActor
public final class VaultShieldWindowController: NSObject {
    public static let shared = VaultShieldWindowController()

    private var shieldWindow: NSWindow?
    private var activeAppName: String = ""
    private var activeApp: NSRunningApplication?

    private override init() {
        super.init()
    }

    public func showShield(for app: NSRunningApplication, appName: String) {
        self.activeApp = app
        self.activeAppName = appName

        let targetScreen = NSScreen.main ?? NSScreen.screens.first

        if shieldWindow == nil, let screen = targetScreen {
            let window = NSWindow(
                contentRect: screen.frame,
                styleMask: [.borderless, .fullSizeContentView],
                backing: .buffered,
                defer: false
            )
            window.level = NSWindow.Level(Int(CGWindowLevelForKey(.modalPanelWindow)))
            window.isOpaque = false
            window.backgroundColor = NSColor.clear
            window.hasShadow = false
            window.ignoresMouseEvents = false
            window.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary]

            let hostingView = NSHostingView(
                rootView: VaultShieldOverlayView(
                    appName: appName,
                    onCancel: { [weak self] in
                        self?.cancelLock(app: app)
                    }
                )
            )
            window.contentView = hostingView
            self.shieldWindow = window
        } else if let hostingView = shieldWindow?.contentView as? NSHostingView<VaultShieldOverlayView> {
            hostingView.rootView = VaultShieldOverlayView(
                appName: appName,
                onCancel: { [weak self] in
                    self?.cancelLock(app: app)
                }
            )
        }

        if let screen = targetScreen {
            shieldWindow?.setFrame(screen.frame, display: true)
        }
        shieldWindow?.makeKeyAndOrderFront(nil)
        shieldWindow?.orderFrontRegardless()
    }

    public func dismissShield() {
        guard let window = shieldWindow else { return }
        NSAnimationContext.runAnimationGroup { context in
            context.duration = 0.25
            window.animator().alphaValue = 0
        } completionHandler: { [weak self] in
            Task { @MainActor [weak self] in
                self?.shieldWindow?.orderOut(nil)
                self?.shieldWindow?.alphaValue = 1.0
                self?.shieldWindow = nil
                self?.activeApp = nil
            }
        }
    }

    private func cancelLock(app: NSRunningApplication) {
        app.hide()
        dismissShield()
    }
}

struct VaultShieldOverlayView: View {
    let appName: String
    let onCancel: () -> Void

    @State private var isPulsing = false

    // Observe retry state from VisionVaultManager
    private var vaultManager: VisionVaultManager { VisionVaultManager.shared }

    var body: some View {
        ZStack {
            // Fullscreen Dark Glass Background
            VisualEffectBlur(material: .hudWindow, blendingMode: .withinWindow)
                .ignoresSafeArea()

            Color.black.opacity(0.65)
                .ignoresSafeArea()

            VStack(spacing: 24) {
                // Biometric Lock Icon Card — switches between face and fingerprint
                ZStack {
                    Circle()
                        .fill(iconAccentColor.opacity(0.15))
                        .frame(width: 96, height: 96)
                        .scaleEffect(isPulsing ? 1.08 : 0.95)
                        .animation(.easeInOut(duration: 1.2).repeatForever(autoreverses: true), value: isPulsing)

                    Circle()
                        .stroke(iconAccentColor.opacity(0.4), lineWidth: 2)
                        .frame(width: 80, height: 80)

                    Image(systemName: vaultManager.isFallingBackToTouchID ? "touchid" : "lock.shield.fill")
                        .font(.system(size: 38, weight: .semibold))
                        .foregroundStyle(iconAccentColor)
                        .contentTransition(.symbolEffect(.replace.magic(fallback: .replace)))
                }

                VStack(spacing: 8) {
                    Text("\(appName) is Locked")
                        .font(.system(size: 22, weight: .bold, design: .rounded))
                        .foregroundStyle(.white)

                    Text(statusSubtitle)
                        .font(.system(size: 14, weight: .medium))
                        .foregroundStyle(Color.white.opacity(0.75))
                        .animation(.smooth(duration: 0.3), value: vaultManager.retryStatusMessage)
                }

                // Status capsule — shows scan/retry/fallback state
                HStack(spacing: 8) {
                    if vaultManager.isFallingBackToTouchID {
                        Image(systemName: "touchid")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundStyle(Color.orange)
                    } else {
                        ProgressView()
                            .controlSize(.small)
                            .tint(VisionTheme.accent)
                    }

                    Text(statusCapsuleText)
                        .font(.system(size: 12, weight: .medium, design: .monospaced))
                        .foregroundStyle(vaultManager.isFallingBackToTouchID ? Color.orange : VisionTheme.accent)
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(
                    Capsule()
                        .fill(Color.white.opacity(0.08))
                        .overlay(
                            Capsule().stroke(
                                (vaultManager.isFallingBackToTouchID ? Color.orange : VisionTheme.accent).opacity(0.3),
                                lineWidth: 1
                            )
                        )
                )
                .animation(.smooth(duration: 0.3), value: vaultManager.isFallingBackToTouchID)

                // Retry progress dots
                if vaultManager.faceRetryCount > 0 && !vaultManager.isFallingBackToTouchID {
                    HStack(spacing: 6) {
                        ForEach(1...vaultManager.maxFaceRetries, id: \.self) { attempt in
                            Circle()
                                .fill(attempt <= vaultManager.faceRetryCount ? Color.red.opacity(0.8) : Color.white.opacity(0.2))
                                .frame(width: 6, height: 6)
                                .animation(.spring(response: 0.3), value: vaultManager.faceRetryCount)
                        }
                    }
                }

                Button(action: onCancel) {
                    Text("Hide App")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundStyle(Color.white.opacity(0.6))
                        .padding(.horizontal, 20)
                        .padding(.vertical, 8)
                        .background(
                            RoundedRectangle(cornerRadius: 8)
                                .fill(Color.white.opacity(0.1))
                        )
                }
                .buttonStyle(.plain)
                .padding(.top, 12)
            }
            .padding(40)
            .background(
                RoundedRectangle(cornerRadius: 24, style: .continuous)
                    .fill(Color(nsColor: .windowBackgroundColor).opacity(0.85))
                    .shadow(color: Color.black.opacity(0.5), radius: 30, x: 0, y: 15)
                    .overlay(
                        RoundedRectangle(cornerRadius: 24, style: .continuous)
                            .stroke(Color.white.opacity(0.15), lineWidth: 1)
                    )
            )
            .frame(maxWidth: 420)
        }
        .onAppear {
            isPulsing = true
        }
    }

    // MARK: - Computed Display Properties

    private var iconAccentColor: Color {
        vaultManager.isFallingBackToTouchID ? .orange : VisionTheme.accent
    }

    private var statusSubtitle: String {
        if vaultManager.isFallingBackToTouchID {
            return "Place your finger on Touch ID to unlock"
        } else if vaultManager.faceRetryCount > 0 {
            return "Face not recognized — retrying (\(vaultManager.faceRetryCount)/\(vaultManager.maxFaceRetries))"
        } else {
            return "Unlock with Face ID to view app"
        }
    }

    private var statusCapsuleText: String {
        if !vaultManager.retryStatusMessage.isEmpty {
            return vaultManager.retryStatusMessage
        }
        return "Scanning face…"
    }
}

struct VisualEffectBlur: NSViewRepresentable {
    var material: NSVisualEffectView.Material
    var blendingMode: NSVisualEffectView.BlendingMode

    func makeNSView(context: Context) -> NSVisualEffectView {
        let view = NSVisualEffectView()
        view.material = material
        view.blendingMode = blendingMode
        view.state = .active
        return view
    }

    func updateNSView(_ nsView: NSVisualEffectView, context: Context) {
        nsView.material = material
        nsView.blendingMode = blendingMode
    }
}
