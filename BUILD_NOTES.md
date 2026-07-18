# My Music (MusicClone) — Build & Maintenance Notes

This repo is a **ready-to-build** React Native 0.74.5 project. The scaffolding,
native wiring, background-audio capability, app name, bundle id, and all
TypeScript were prepared and verified on Linux. Everything that requires macOS
(CocoaPods, the Xcode build, code signing, installing to the iPhone) is done on
your Mac using the steps below.

- **App name on the home screen:** My Music (`CFBundleDisplayName`)
- **Bundle identifier:** `com.iqbal.mymusic`
- **Internal Xcode target / RN module name:** `MusicClone` (unchanged — matches
  `AppDelegate`, `app.json`, `index.js`, and the bridging header)

---

## What is already done (so you can skip SETUP.md steps 3–7)

- ✅ RN 0.74.5 project scaffolded (old architecture — the 0.74 default).
- ✅ `package.json` deps installed & **pinned** (see the versions section below).
- ✅ Native modules `FolderBookmark.swift/.m` + `MetadataReader.swift/.m` added to
  the **MusicClone** Xcode target's *Compile Sources* build phase.
- ✅ `SWIFT_OBJC_BRIDGING_HEADER = MusicClone/MusicClone-Bridging-Header.h`,
  `ALWAYS_EMBED_SWIFT_STANDARD_LIBRARIES = YES`, `SWIFT_VERSION = 5.0`.
- ✅ `UIBackgroundModes = [audio]` in `Info.plist` (lock-screen / background playback).
- ✅ `PRODUCT_BUNDLE_IDENTIFIER = com.iqbal.mymusic`, automatic signing (no team set).
- ✅ `npx tsc --noEmit` passes with **0 errors**; the JS release bundle builds cleanly.

What is **not** done here (needs your Mac): `pod install`, the Xcode compile, picking
your signing **Team**, and installing to the device.

---

## Build to your iPhone (on your Mac)

Prerequisites: macOS + Xcode, CocoaPods (`brew install cocoapods`), your paid Apple
Developer account, and the iPhone 14 Pro Max.

```bash
git clone <this-repo-url>
cd my-music
git checkout claude/tarana-app-files-upload-ykqqw7   # this branch

npm install                 # restores node_modules from the committed package-lock.json
cd ios && pod install && cd ..
open ios/MusicClone.xcworkspace   # ALWAYS the .xcworkspace, never the .xcodeproj
```

In Xcode:
1. Select the **MusicClone** target → **Signing & Capabilities** → choose your **Team**
   (Automatically manage signing is already on). Bundle id is already `com.iqbal.mymusic`.
2. **Product → Scheme → Edit Scheme… → Run → Build Configuration → Release.**
   This bundles the JS into the app so it runs offline/standalone — **no Metro, no Mac
   needed after install.** (Never use the Debug scheme for the phone you carry around.)
3. Connect + unlock the iPhone, **Trust** the Mac, select it as the run destination.
4. **Product → Run (⌘R).**
5. First launch on device: **Settings → General → VPN & Device Management** → trust your
   developer certificate if prompted.

You should land on the **Choose Music Folder** screen.

---

## First run inside the app

1. Tap **Choose Music Folder** → *On My iPhone → music* → **Open**.
2. Wait for the first scan (hundreds of folders can take a few minutes — artwork is
   extracted once and cached; later rescans are much faster).
3. Library / Songs / Artists / Albums / Folders / Search all work offline after that.

---

## Rescan workflow — when you add new MP3s

You picked the folder **once**; a security-scoped bookmark keeps permanent access, so
you never re-pick after adding files. To index newly added songs:

- Open the app → **Settings → Rescan Library.**

Rescans are incremental-feeling because artwork is cached and song ids are stable
(`${fileSize}_${fileName}`), so your Favorites and Playlists survive every rescan.

Same file in two folders? The library shows it once. **Settings → Merge Duplicates**
deletes the extra copies from disk (it asks for confirmation first).

---

## Rebuild after you change code

- **JS/TS-only change** (anything under `src/` or `index.js`): just **Product → Run**
  again in Xcode with the Release scheme — the build phase re-bundles the JS.
- **Changed a native Swift/ObjC file** (`ios/MusicClone/*.swift/.m`): Clean Build Folder
  (**⇧⌘K**) then Run.
- **Added/removed an npm dependency:** `npm install` → `cd ios && pod install` → rebuild.
- Sanity-check JS before building: `npx tsc --noEmit` (should stay at 0 errors).

---

## Pinned dependency versions (known-good on RN 0.74.5)

| Package | Version |
|---|---|
| react-native | 0.74.5 |
| react | 18.2.0 |
| @react-navigation/native | 6.1.18 |
| @react-navigation/native-stack | 6.11.0 |
| @react-navigation/bottom-tabs | 6.6.1 |
| react-native-screens | 3.34.0 |
| react-native-safe-area-context | 4.11.1 |
| react-native-track-player | 4.1.1 |
| react-native-quick-sqlite | 8.2.7 |
| react-native-fs | 2.20.0 |
| @react-native-community/slider | 4.5.5 |
| zustand | 4.5.5 |

`react-native-track-player` is intentionally **v4** — the player code uses v4-only APIs
(`useActiveTrack`, `getActiveTrackIndex`, object-shaped `usePlaybackState`,
`AppKilledPlaybackBehavior`). Do not downgrade to v3.

---

## If the native modules aren't wired (fallback)

The 4 native files were added to the target by editing `project.pbxproj`
programmatically (`scripts/wire-native.js`). If the app crashes at launch with
**"Native module FolderBookmark is null"**, the target membership didn't take. Fix it
the manual way (SETUP.md step 5):

1. Open `ios/MusicClone.xcworkspace`.
2. In the Project Navigator, select each of `FolderBookmark.swift`, `FolderBookmark.m`,
   `MetadataReader.swift`, `MetadataReader.m` (they live in `ios/MusicClone/`).
3. Open the **File Inspector** (right panel) → under **Target Membership**, check
   **MusicClone**.
4. Confirm **Build Settings → Swift Compiler - General → Objective-C Bridging Header** is
   `MusicClone/MusicClone-Bridging-Header.h`.
5. Clean (**⇧⌘K**) and Run.

---

## Troubleshooting

- **"No bundle URL present"** → you ran a **Debug** build without Metro. Use the Release
  scheme (build step 2), or run `npx react-native start` while developing.
- **No lock-screen / AirPods controls** → confirm **Background Modes → Audio** is on
  (already set in `Info.plist` as `UIBackgroundModes=[audio]`; the capability shows under
  Signing & Capabilities).
- **`pod install` fails** → `brew install cocoapods` (or `sudo gem install cocoapods`),
  then retry. If pods get into a bad state: `cd ios && rm -rf Pods Podfile.lock && pod install`.
- **quick-sqlite build error about new architecture** → this project is old-architecture
  (RN 0.74 default); don't enable Fabric/New Arch.
- **Signing errors** → make sure your Team is selected and the bundle id `com.iqbal.mymusic`
  is unique to your account.
