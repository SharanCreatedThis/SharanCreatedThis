//
//  FirstUnlockCelebrationController.swift
//  Vision
//
//  Lightweight, non-intrusive celebration HUD displayed once after the first successful face unlock.
//

import AppKit
import SwiftUI

@MainActor
public final class FirstUnlockCelebrationController {
    public static let shared = FirstUnlockCelebrationController()

    private var window: NSPanel?
    private var dismissTask: Task<Void, Never>?

    private init() {
        NotificationCenter.default.addObserver(
            forName: .visionFirstUnlockSucceeded,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            Task { @MainActor [weak self] in
                self?.handleFirstUnlock()
            }
        }
    }

    /// Public initialization hook to ensure the observer is listening
    public func startObserving() {
        // singleton init registers observer
    }

    private func handleFirstUnlock() {
        guard !VisionSettings.shared.hasShownFirstUnlockCelebration else { return }

        Task {
            // Wait until screen is actually unlocked and visible
            for _ in 0..<20 {
                if !LockMonitor.isScreenActuallyLocked() { break }
                try? await Task.sleep(nanoseconds: 200_000_000)
            }
            // Settle delay on desktop
            try? await Task.sleep(nanoseconds: 600_000_000)

            guard !VisionSettings.shared.hasShownFirstUnlockCelebration else { return }
            VisionSettings.shared.hasShownFirstUnlockCelebration = true
            presentCelebration()
        }
    }

    public func presentCelebration() {
        dismissTask?.cancel()

        VisionAnalytics.shared.track(.firstUnlockCelebrationShown)

        let celebrationView = FirstUnlockCelebrationView { [weak self] in
            self?.dismiss()
        }

        let hostingView = NSHostingView(rootView: celebrationView)
        let size = CGSize(width: 340, height: 72)
        hostingView.frame = NSRect(origin: .zero, size: size)

        let panel = NSPanel(
            contentRect: NSRect(origin: .zero, size: size),
            styleMask: [.borderless, .nonactivatingPanel],
            backing: .buffered,
            defer: false
        )
        panel.isOpaque = false
        panel.backgroundColor = .clear
        panel.hasShadow = true
        panel.level = .floating
        panel.ignoresMouseEvents = false
        panel.isReleasedWhenClosed = false
        panel.contentView = hostingView

        // Position at top center of main screen below menu bar / notch
        if let screen = NSScreen.main {
            let screenFrame = screen.visibleFrame
            let x = screenFrame.midX - (size.width / 2.0)
            let y = screenFrame.maxY - size.height - 18
            panel.setFrameOrigin(NSPoint(x: x, y: y))
        }

        self.window = panel
        panel.orderFront(nil)

        dismissTask = Task {
            try? await Task.sleep(nanoseconds: 3_800_000_000)
            dismiss()
        }
    }

    public func dismiss() {
        guard let win = window else { return }
        NSAnimationContext.runAnimationGroup({ context in
            context.duration = 0.35
            win.animator().alphaValue = 0.0
        }, completionHandler: { [weak self] in
            self?.window?.close()
            self?.window = nil
        })
    }
}

private struct FirstUnlockCelebrationView: View {
    let onDismiss: () -> Void
    @State private var appeared = false
    @State private var sparkleScale: CGFloat = 0.8

    var body: some View {
        HStack(spacing: 14) {
            ZStack {
                Circle()
                    .fill(
                        LinearGradient(
                            colors: [Color.accentColor.opacity(0.3), Color.accentColor.opacity(0.1)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 44, height: 44)

                Image(systemName: "faceid")
                    .font(.system(size: 22, weight: .medium))
                    .foregroundStyle(Color.accentColor)

                Text("✨")
                    .font(.system(size: 13))
                    .offset(x: 14, y: -12)
                    .scaleEffect(sparkleScale)
            }

            VStack(alignment: .leading, spacing: 2) {
                Text("Face ID Ready ✨")
                    .font(.system(size: 14, weight: .bold, design: .rounded))
                    .foregroundStyle(Color.white)

                Text("Vision successfully unlocked your Mac.")
                    .font(.system(size: 11.5, weight: .medium))
                    .foregroundStyle(Color.white.opacity(0.75))
            }

            Spacer(minLength: 4)

            Button(action: onDismiss) {
                Image(systemName: "xmark.circle.fill")
                    .font(.system(size: 15))
                    .foregroundStyle(Color.white.opacity(0.4))
            }
            .buttonStyle(.plain)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .frame(width: 340, height: 72)
        .background(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .fill(Color(nsColor: .windowBackgroundColor).opacity(0.92))
                .background(.ultraThinMaterial)
                .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 18, style: .continuous)
                        .strokeBorder(Color.white.opacity(0.15), lineWidth: 1)
                )
                .shadow(color: Color.black.opacity(0.3), radius: 14, y: 6)
        )
        .scaleEffect(appeared ? 1.0 : 0.85)
        .opacity(appeared ? 1.0 : 0.0)
        .onAppear {
            withAnimation(.spring(response: 0.45, dampingFraction: 0.75)) {
                appeared = true
            }
            withAnimation(.easeInOut(duration: 0.8).repeatForever(autoreverses: true)) {
                sparkleScale = 1.15
            }
        }
    }
}
