//
//  SettingsWindowView.swift
//  Vision
//
//  Redesigned Settings 2.0 window root layout.
//  Permanent left sidebar (205px) + dashboard content area (535px) with global header.
//

import SwiftUI

/// Lets one page publish a trailing action into the shared header.
struct HeaderAction: Equatable {
    private let id = UUID()
    let perform: () -> Void

    static func == (lhs: HeaderAction, rhs: HeaderAction) -> Bool { lhs.id == rhs.id }
}

struct HeaderTrailingActionKey: PreferenceKey {
    static var defaultValue: HeaderAction? { nil }
    static func reduce(value: inout HeaderAction?, nextValue: () -> HeaderAction?) {
        value = nextValue() ?? value
    }
}

struct SettingsWindowView: View {
    let environment: AppEnvironment
    @State private var selection: SettingsTab = .general
    @State private var headerTrailingAction: HeaderAction?
    @Environment(\.dismissWindow) private var dismissWindow

    var body: some View {
        if VisionSettings.shared.hasCompletedOnboarding {
            settingsContent
        } else {
            Color.clear
                .onAppear { dismissWindow(id: "settings") }
        }
    }

    private var settingsContent: some View {
        HStack(spacing: 0) {
            // MARK: - Permanent Left Sidebar
            SettingsSidebarView(
                selection: $selection,
                environment: environment
            )

            // Vertical subtle border
            Rectangle()
                .fill(Color.white.opacity(0.08))
                .frame(width: 1)
                .ignoresSafeArea()

            // MARK: - Main Content Area
            VStack(alignment: .leading, spacing: 0) {
                // Global Header
                SettingsPageHeader(
                    tab: selection,
                    pocController: environment.pocController,
                    trailingAction: headerTrailingAction
                )

                Divider()
                    .background(Color.white.opacity(0.06))

                // Scrollable Page Content (fits without scroll on standard displays)
                ScrollView(.vertical, showsIndicators: false) {
                    pageBody
                        .padding(.horizontal, 24)
                        .padding(.top, 18)
                        .padding(.bottom, 24)
                        .frame(maxWidth: .infinity, alignment: .topLeading)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(
                ZStack {
                    VisualEffectView()
                    SettingsMetrics.windowTintColor
                }
            )
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .ignoresSafeArea()
        .background(WindowConfigurator())
        .tint(VisionTheme.accent)
        .onPreferenceChange(HeaderTrailingActionKey.self) { headerTrailingAction = $0 }
        .onDisappear { selection = .general }
    }

    @ViewBuilder
    private var pageBody: some View {
        switch selection {
        case .general:
            GeneralSettingsPage(coordinator: environment.faceUnlockCoordinator)
        case .yourFace:
            YourFaceSettingsPage(environment: environment)
        case .security:
            SecuritySettingsPage(pocController: environment.pocController)
        case .camera:
            CameraSettingsPage(pocController: environment.pocController)
        case .recognition:
            RecognitionSettingsPage(
                coordinator: environment.faceUnlockCoordinator,
                pocController: environment.pocController
            )
        case .guard_:
            GuardSettingsPage()
        case .vault:
            VaultSettingsPage()
        case .about:
            AboutSettingsPage(updater: environment.updater, environment: environment)
        case .debugFaceLab:
            FaceLabView(controller: environment.faceLabController)
        }
    }
}
