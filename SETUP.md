# MusicClone — Apple Music-style local player (iOS, React Native CLI)

Plays your MP3 folders from the Files app with the Apple Music experience:
Songs / Artists / Albums / Folders / Playlists / Favorites / Search / Now Playing,
background playback + lock-screen controls, duplicate merge utility.

You pick your `music` folder ONCE with the system folder picker; a security-scoped
bookmark keeps permanent access across launches — no copying files anywhere.

---

## 1. Create the RN project (on your Mac)

```bash
npx @react-native-community/cli@latest init MusicClone --version 0.74.5
cd MusicClone
```

> RN 0.74.x is used deliberately: react-native-track-player and
> react-native-quick-sqlite are stable on it (old architecture, default in 0.74).

## 2. Drop in this code

From this zip, copy into the freshly created project (overwrite when asked):

- `src/`        → `MusicClone/src/`
- `index.js`    → `MusicClone/index.js`  (replace the template one)
- `ios-native/` → keep it next to the project for step 5

Delete the template `App.tsx` in the project ROOT if it exists (ours lives in `src/App.tsx`).

## 3. Install JS dependencies

```bash
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs \
  react-native-screens react-native-safe-area-context \
  react-native-track-player react-native-quick-sqlite react-native-fs \
  @react-native-community/slider zustand
```

## 4. iOS pods

```bash
cd ios && pod install && cd ..
```

## 5. Add the native Swift modules (one-time, in Xcode)

1. Open `ios/MusicClone.xcworkspace` in Xcode.
2. Drag these 4 files from `ios-native/` into the **MusicClone** group
   (the yellow folder that contains `AppDelegate`):
   - `FolderBookmark.swift`
   - `FolderBookmark.m`
   - `MetadataReader.swift`
   - `MetadataReader.m`
   Check **"Copy items if needed"** and target **MusicClone**.
3. Xcode asks *"Create Bridging Header?"* → click **Create Bridging Header**.
4. Open the created `MusicClone-Bridging-Header.h` and paste:
   ```objc
   #import <React/RCTBridgeModule.h>
   #import <React/RCTUtils.h>
   ```
   (same content as `ios-native/MusicClone-Bridging-Header.h`).

## 6. Info.plist — background audio

In Xcode: target **MusicClone → Signing & Capabilities → + Capability →
Background Modes** → check **Audio, AirPlay, and Picture in Picture**.

(Or add to `ios/MusicClone/Info.plist`:)
```xml
<key>UIBackgroundModes</key>
<array><string>audio</string></array>
```

## 7. Signing (your paid developer account)

Target **MusicClone → Signing & Capabilities**:
- Team: your Apple Developer team
- Bundle identifier: something unique, e.g. `com.iqbal.musicclone`
- Automatically manage signing: ON

## 8. Build to your iPhone — OFFLINE / standalone (no Metro, no Mac needed after install)

1. Connect iPhone 14 Pro Max by USB, unlock, **Trust** the Mac.
2. In Xcode select your iPhone as the run destination.
3. **Product → Scheme → Edit Scheme… → Run → Build Configuration → Release** ← this is the offline part.
4. Product → Run (⌘R).
5. First launch on device: Settings → General → VPN & Device Management → trust your developer certificate (only if prompted).

Release build bundles the JS inside the app — it runs forever without your Mac,
signed for ~1 year with a paid account. Rebuild only when you change code.

## 9. First run inside the app

1. Tap **Choose Music Folder** → navigate to *On My iPhone → music* → **Open**.
2. Wait for the scan (300+ folders takes a few minutes the first time — artwork
   is extracted once and cached; rescans are much faster).
3. Done. Library, Artists, Albums, Folders, Search all work offline.

## Daily use notes

- Long-press any song → Play Next / Add to Queue / Favorite / Add to a Playlist.
- Favorites appear as the pinned **Favorite Songs** smart playlist in Playlists.
- Added new MP3s to the folder? → Settings → **Rescan Library**.
- Same file in two folders? Library shows it once; Settings → **Merge Duplicates**
  deletes the extra copies from disk (asks for confirmation first).

## Troubleshooting

- **"No bundle URL present"** → you ran a Debug build without Metro. Use Release
  scheme (step 8.3) or run `npx react-native start` for development.
- **Native module `FolderBookmark` is null** → the 4 native files aren't in the
  Xcode target. Re-do step 5, confirm Target Membership, clean build (⇧⌘K).
- **Songs play but no lock-screen controls** → Background Modes capability
  missing (step 6).
- **`pod install` fails** → `sudo gem install cocoapods` or `brew install cocoapods`,
  then retry.
- **Quick-SQLite build error on new architecture** → make sure you initialized
  RN 0.74.5 as in step 1 (old architecture is default there).
