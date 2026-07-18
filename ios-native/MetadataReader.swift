import Foundation
import AVFoundation
import UIKit
import CryptoKit

@objc(MetadataReader)
class MetadataReader: NSObject {

  @objc static func requiresMainQueueSetup() -> Bool { return false }

  // Run on a background queue — metadata loading is blocking work
  @objc var methodQueue: DispatchQueue {
    return DispatchQueue(label: "metadata.reader.queue", qos: .userInitiated)
  }

  private func firstString(_ items: [AVMetadataItem]) -> String? {
    for item in items {
      if let s = item.stringValue, !s.trimmingCharacters(in: .whitespaces).isEmpty {
        return s.trimmingCharacters(in: .whitespaces)
      }
    }
    return nil
  }

  private func firstData(_ items: [AVMetadataItem]) -> Data? {
    for item in items {
      if let d = item.dataValue { return d }
      if let d = item.value as? Data { return d }
    }
    return nil
  }

  private func sha1(_ s: String) -> String {
    let digest = Insecure.SHA1.hash(data: Data(s.utf8))
    return digest.map { String(format: "%02x", $0) }.joined()
  }

  /// Reads tags for one audio file.
  /// Returns { title, artist, album, genre, duration (sec), artworkPath }
  @objc func read(_ path: String,
                  artworkDir: String,
                  resolver resolve: @escaping RCTPromiseResolveBlock,
                  rejecter reject: @escaping RCTPromiseRejectBlock) {

    let url = URL(fileURLWithPath: path)
    let asset = AVURLAsset(url: url, options: [AVURLAssetPreferPreciseDurationAndTimingKey: false])

    let keys = ["duration", "commonMetadata", "metadata"]
    let semaphore = DispatchSemaphore(value: 0)
    asset.loadValuesAsynchronously(forKeys: keys) { semaphore.signal() }
    _ = semaphore.wait(timeout: .now() + 15)

    var result: [String: Any] = [:]

    // Duration
    let dur = CMTimeGetSeconds(asset.duration)
    result["duration"] = (dur.isFinite && dur > 0) ? dur : 0

    let common = asset.commonMetadata
    result["title"]  = firstString(AVMetadataItem.metadataItems(from: common, filteredByIdentifier: .commonIdentifierTitle)) ?? NSNull()
    result["artist"] = firstString(AVMetadataItem.metadataItems(from: common, filteredByIdentifier: .commonIdentifierArtist)) ?? NSNull()
    result["album"]  = firstString(AVMetadataItem.metadataItems(from: common, filteredByIdentifier: .commonIdentifierAlbumName)) ?? NSNull()

    // Genre: try ID3 TCON, then iTunes genre
    var genre = firstString(AVMetadataItem.metadataItems(from: asset.metadata, filteredByIdentifier: .id3MetadataContentType))
    if genre == nil {
      genre = firstString(AVMetadataItem.metadataItems(from: asset.metadata, filteredByIdentifier: .iTunesMetadataUserGenre))
    }
    result["genre"] = genre ?? NSNull()

    // Artwork -> save as JPG once per (artist|album|filename) key
    if let artData = firstData(AVMetadataItem.metadataItems(from: common, filteredByIdentifier: .commonIdentifierArtwork)),
       let image = UIImage(data: artData) {
      let artistKey = (result["artist"] as? String) ?? ""
      let albumKey = (result["album"] as? String) ?? url.lastPathComponent
      let name = sha1(artistKey + "|" + albumKey) + ".jpg"
      let dirURL = URL(fileURLWithPath: artworkDir, isDirectory: true)
      try? FileManager.default.createDirectory(at: dirURL, withIntermediateDirectories: true)
      let fileURL = dirURL.appendingPathComponent(name)
      if !FileManager.default.fileExists(atPath: fileURL.path) {
        // Downscale to max 600px to keep the library light
        let maxSide: CGFloat = 600
        var final = image
        let side = max(image.size.width, image.size.height)
        if side > maxSide {
          let scale = maxSide / side
          let newSize = CGSize(width: image.size.width * scale, height: image.size.height * scale)
          UIGraphicsBeginImageContextWithOptions(newSize, true, 1)
          image.draw(in: CGRect(origin: .zero, size: newSize))
          final = UIGraphicsGetImageFromCurrentImageContext() ?? image
          UIGraphicsEndImageContext()
        }
        if let jpg = final.jpegData(compressionQuality: 0.85) {
          try? jpg.write(to: fileURL)
        }
      }
      result["artworkPath"] = fileURL.path
    } else {
      result["artworkPath"] = NSNull()
    }

    resolve(result)
  }
}
