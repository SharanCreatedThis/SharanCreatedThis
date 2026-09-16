//
//  AuditRemote.swift
//  Hangly
//
//  Opening and closing Customize from a script, for the memory audit.
//

#if !HANGLY_PRODUCTION

import Darwin
import Foundation
import OSLog

/// Lets `Scripts/measure-memory.sh` walk the app through Customize.
///
/// The memory audit has to open each page, hold it, close the window and read the
/// footprint at six points. Driving that through the accessibility API needs the
/// app to become the active application, which a script cannot always arrange —
/// macOS refuses activation to a background app in plenty of ordinary situations,
/// and the audit then measures a window that never opened.
///
/// So the app listens for Darwin notifications instead. `notifyutil -p` posts one,
/// the app acts on it, and the script reads `phys_footprint` — no focus, no
/// synthetic clicks, nothing that can silently fail.
///
/// Compiled out of the Production configuration entirely, along with the rest of
/// the development surfaces. A notification is unauthenticated — any process on the
/// machine can post one — which is exactly why a shipped build must not be
/// listening: nothing about this is a security boundary, so there must not be one
/// to cross.
@MainActor
final class AuditRemote {
    /// Prefix for every notification this listens on. The suffix is a page name —
    /// `library`, `create`, `appearance`, `about` — or `close`.
    static let prefix = "com.hangly.audit."

    /// The listener, for the C callback to find. Darwin notification callbacks are
    /// bare function pointers with no context, so there is nowhere to put `self`.
    /// Weak, and there is only ever one: the composition root builds one of these.
    private static weak var current: AuditRemote?

    private let customize: CustomizeWindowController

    init(customize: CustomizeWindowController) {
        self.customize = customize
    }

    /// Starts listening. Called from `bootstrap()` in development builds only.
    func start() {
        Self.current = self
        let center = CFNotificationCenterGetDarwinNotifyCenter()
        for name in CustomizeSection.allCases.map(\.rawValue) + ["close", "shots"] {
            CFNotificationCenterAddObserver(
                center,
                Unmanaged.passUnretained(self).toOpaque(),
                { _, _, name, _, _ in
                    guard let name = name?.rawValue as String? else { return }
                    Task { @MainActor in AuditRemote.handle(name) }
                },
                (Self.prefix + name) as CFString,
                nil,
                .deliverImmediately
            )
        }
        Logger.app.diagnostic("Audit remote listening on \(Self.prefix)*.")
    }

    func stop() {
        CFNotificationCenterRemoveEveryObserver(
            CFNotificationCenterGetDarwinNotifyCenter(),
            Unmanaged.passUnretained(self).toOpaque()
        )
        Self.current = nil
    }

    private static func handle(_ name: String) {
        guard let remote = current else { return }
        let suffix = String(name.dropFirst(prefix.count))
        if suffix == "shots" {
            guard let environment = remote.customize.environment else { return }
            LibraryShotmaker.writeAll(environment: environment)
        } else if suffix == "close" {
            remote.customize.close()
        } else if let section = CustomizeSection(rawValue: suffix) {
            remote.customize.present(section)
        }
        Logger.app.diagnostic("Audit remote handled \(suffix).")
    }
}

#endif
