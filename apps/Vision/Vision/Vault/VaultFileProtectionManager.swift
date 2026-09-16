//
//  VaultFileProtectionManager.swift
//  Vision
//
//  AES-256-GCM encryption container (.vvault) engine for file & folder protection.
//

import Foundation
import CryptoKit

public enum VaultFileError: LocalizedError {
    case fileNotFound
    case encryptionFailed
    case decryptionFailed
    case invalidHeader

    public var errorDescription: String? {
        switch self {
        case .fileNotFound: return "Target file not found."
        case .encryptionFailed: return "AES-256-GCM encryption failed."
        case .decryptionFailed: return "AES-256-GCM decryption failed or biometric auth invalid."
        case .invalidHeader: return "Invalid .vvault file header format."
        }
    }
}

public final class VaultFileProtectionManager: Sendable {
    public static let shared = VaultFileProtectionManager()

    private let vvaultMagicHeader = Data([0x56, 0x56, 0x41, 0x55, 0x4C, 0x54]) // "VVAULT"

    private init() {}

    /// Encrypts input file into a AES-256-GCM encrypted `.vvault` container.
    public func encryptFile(at sourceURL: URL, destinationURL: URL, key: SymmetricKey) throws {
        let fm = FileManager.default
        guard fm.fileExists(atPath: sourceURL.path) else { throw VaultFileError.fileNotFound }

        let plaintext = try Data(contentsOf: sourceURL)
        let sealedBox = try AES.GCM.seal(plaintext, using: key)

        guard let combined = sealedBox.combined else { throw VaultFileError.encryptionFailed }

        var payload = vvaultMagicHeader
        payload.append(combined)

        try payload.write(to: destinationURL, options: .atomic)
    }

    /// Decrypts a `.vvault` container using key.
    public func decryptFile(at containerURL: URL, destinationURL: URL, key: SymmetricKey) throws {
        let fm = FileManager.default
        guard fm.fileExists(atPath: containerURL.path) else { throw VaultFileError.fileNotFound }

        let payload = try Data(contentsOf: containerURL)
        guard payload.count > vvaultMagicHeader.count, payload.prefix(vvaultMagicHeader.count) == vvaultMagicHeader else {
            throw VaultFileError.invalidHeader
        }

        let combined = payload.dropFirst(vvaultMagicHeader.count)
        let sealedBox = try AES.GCM.SealedBox(combined: combined)
        let plaintext = try AES.GCM.open(sealedBox, using: key)

        try plaintext.write(to: destinationURL, options: .atomic)
    }
}
