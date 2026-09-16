//
//  VisionReturnDetector.swift
//  Vision
//
//  Detects when a user approaches or returns to the Mac and triggers return unlock.
//

import Foundation
import Observation
import Vision

@Observable
@MainActor
public final class VisionReturnDetector {
    public private(set) var isReturnDetected: Bool = false
    public private(set) var returnConfidence: Float = 0.0

    public init() {}

    /// Evaluates if an approaching face indicates user return after absence.
    public func evaluateReturnSignal(faceObs: VNFaceObservation?, distanceRatio: Float) {
        guard let face = faceObs else {
            isReturnDetected = false
            returnConfidence = 0.0
            return
        }

        // Return requires a face with high confidence and positive distance approach ratio
        if face.confidence > 0.8 && distanceRatio > 0.12 {
            isReturnDetected = true
            returnConfidence = Float(face.confidence)
        } else {
            isReturnDetected = false
            returnConfidence = 0.0
        }
    }

    public func reset() {
        isReturnDetected = false
        returnConfidence = 0.0
    }
}
