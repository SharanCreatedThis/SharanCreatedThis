//
//  AirDropService.swift
//  Hangly
//
//  Opens the native AirDrop picker for a file dropped on a charm.
//

import AppKit
import OSLog
import UniformTypeIdentifiers

/// AirDrop, and nothing else.
///
/// This is the whole surface between Hangly and AirDrop: one check to see whether
/// the file is something AirDrop can send, and one call to open the picker.
/// `NSSharingService(named: .sendViaAirDrop)` is the public API Apple intends for
/// this — it opens the same panel Finder does, letting the user pick the device.
///
/// No private APIs, no automation, no bypassing the picker.
@MainActor
enum AirDropService {
    /// Whether the file at `url` is something worth dropping on a charm.
    ///
    /// Accepts images, videos, PDFs, documents, archives and folders — anything
    /// represented by a file URL. Rejects text snippets, web URLs, and anything
    /// without a path on disk.
    static func isSupported(_ url: URL) -> Bool {
        guard url.isFileURL else { return false }

        // Folders are supported — AirDrop sends them as-is.
        var isDirectory: ObjCBool = false
        guard FileManager.default.fileExists(atPath: url.path, isDirectory: &isDirectory) else {
            return false
        }
        if isDirectory.boolValue { return true }

        // Anything with a recognised file type is accepted. The types below cover
        // images, video, PDF, documents, archives and anything else that is a
        // regular file. Text clippings and pasteboard items are not files and never
        // arrive as file URLs, so they are implicitly rejected.
        guard let type = UTType(filenameExtension: url.pathExtension) else {
            // Unknown extension — still a file, still worth trying.
            return true
        }

        // Explicitly reject types that are not meaningful to AirDrop.
        let rejected: [UTType] = [.url, .text, .plainText, .rtf]
        if rejected.contains(where: { type.conforms(to: $0) }) {
            return false
        }

        return true
    }

    /// Opens the native AirDrop picker for `url`.
    ///
    /// - Returns: `true` if the service was available and the picker was presented.
    ///   The user still chooses the destination device; a `true` return does not
    ///   mean the file was sent.
    @discardableResult
    static func send(_ url: URL) -> Bool {
        guard let service = NSSharingService(named: .sendViaAirDrop) else {
            Logger.overlay.warning("AirDrop sharing service unavailable.")
            return false
        }

        guard service.canPerform(withItems: [url]) else {
            Logger.overlay.warning("AirDrop cannot send this item.")
            return false
        }

        service.perform(withItems: [url])
        Logger.overlay.diagnostic("AirDrop picker opened for dropped file.")
        return true
    }

    /// A brief description of why a file was rejected, for the "Unsupported item"
    /// tooltip. Returns `nil` when the file is accepted.
    static func rejectionReason(for url: URL) -> String? {
        guard !isSupported(url) else { return nil }
        return "Unsupported item"
    }
}
