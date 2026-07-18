import Foundation
import UIKit
import UniformTypeIdentifiers
import React

@objc(FolderBookmark)
class FolderBookmark: NSObject, UIDocumentPickerDelegate {

  static let bookmarkKey = "musicFolderBookmark"
  private var pickResolve: RCTPromiseResolveBlock?
  private var pickReject: RCTPromiseRejectBlock?
  private static var accessedURL: URL?

  @objc static func requiresMainQueueSetup() -> Bool { return true }

  // MARK: - Pick a folder with the system picker, then persist a bookmark
  @objc func pickFolder(_ resolve: @escaping RCTPromiseResolveBlock,
                        rejecter reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      self.pickResolve = resolve
      self.pickReject = reject
      let picker = UIDocumentPickerViewController(forOpeningContentTypes: [UTType.folder])
      picker.delegate = self
      picker.allowsMultipleSelection = false
      picker.shouldShowFileExtensions = true
      guard let root = RCTPresentedViewController() else {
        reject("no_vc", "No root view controller", nil)
        return
      }
      root.present(picker, animated: true, completion: nil)
    }
  }

  func documentPicker(_ controller: UIDocumentPickerViewController,
                      didPickDocumentsAt urls: [URL]) {
    guard let url = urls.first else {
      pickReject?("cancelled", "No folder selected", nil)
      cleanup(); return
    }
    // Stop access to any previously held folder
    FolderBookmark.accessedURL?.stopAccessingSecurityScopedResource()

    let ok = url.startAccessingSecurityScopedResource()
    do {
      let data = try url.bookmarkData(options: [],
                                      includingResourceValuesForKeys: nil,
                                      relativeTo: nil)
      UserDefaults.standard.set(data, forKey: FolderBookmark.bookmarkKey)
      FolderBookmark.accessedURL = url
      pickResolve?(["path": url.path, "accessGranted": ok])
    } catch {
      pickReject?("bookmark_failed", "Could not save folder permission: \(error.localizedDescription)", error)
    }
    cleanup()
  }

  func documentPickerWasCancelled(_ controller: UIDocumentPickerViewController) {
    pickReject?("cancelled", "Folder selection cancelled", nil)
    cleanup()
  }

  private func cleanup() {
    pickResolve = nil
    pickReject = nil
  }

  // MARK: - Restore access on app launch (returns path or null)
  @objc func restoreAccess(_ resolve: @escaping RCTPromiseResolveBlock,
                           rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard let data = UserDefaults.standard.data(forKey: FolderBookmark.bookmarkKey) else {
      resolve(nil); return
    }
    var isStale = false
    do {
      let url = try URL(resolvingBookmarkData: data,
                        options: [],
                        relativeTo: nil,
                        bookmarkDataIsStale: &isStale)
      let ok = url.startAccessingSecurityScopedResource()
      if isStale {
        if let fresh = try? url.bookmarkData(options: [],
                                             includingResourceValuesForKeys: nil,
                                             relativeTo: nil) {
          UserDefaults.standard.set(fresh, forKey: FolderBookmark.bookmarkKey)
        }
      }
      FolderBookmark.accessedURL = url
      resolve(ok ? url.path : nil)
    } catch {
      resolve(nil)
    }
  }

  @objc func hasFolder(_ resolve: @escaping RCTPromiseResolveBlock,
                       rejecter reject: @escaping RCTPromiseRejectBlock) {
    resolve(UserDefaults.standard.data(forKey: FolderBookmark.bookmarkKey) != nil)
  }

  @objc func clearFolder(_ resolve: @escaping RCTPromiseResolveBlock,
                         rejecter reject: @escaping RCTPromiseRejectBlock) {
    FolderBookmark.accessedURL?.stopAccessingSecurityScopedResource()
    FolderBookmark.accessedURL = nil
    UserDefaults.standard.removeObject(forKey: FolderBookmark.bookmarkKey)
    resolve(true)
  }

  // Delete a file inside the secured folder (used by Merge Duplicates)
  @objc func deleteFile(_ path: String,
                        resolver resolve: @escaping RCTPromiseResolveBlock,
                        rejecter reject: @escaping RCTPromiseRejectBlock) {
    do {
      try FileManager.default.removeItem(atPath: path)
      resolve(true)
    } catch {
      reject("delete_failed", "Could not delete: \(error.localizedDescription)", error)
    }
  }
}
