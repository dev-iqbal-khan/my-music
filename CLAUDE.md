# MusicClone — context for Claude Code

Apple Music clone (UI + behavior) for playing LOCAL files from a user-picked
Files-app folder on iOS. React Native CLI 0.74.5, TypeScript, personal sideload
only (Release build via Xcode, paid dev account).

## What exists (all code complete in src/ and ios-native/)
- Native Swift modules (add to Xcode target manually — see SETUP.md step 5):
  - FolderBookmark: UIDocumentPicker folder pick + persistent security-scoped
    bookmark (UserDefaults), restoreAccess() on launch, deleteFile() for dedupe.
  - MetadataReader: AVURLAsset ID3/iTunes tags + artwork → downscaled JPG cached
    in Documents/artwork, returns {title, artist, album, genre, duration, artworkPath}.
- DB: react-native-quick-sqlite. Song id = `${fileSize}_${fileName}` (stable across
  rescans so favorites/playlists survive). song_locations records duplicates.
- Scanner (src/services/scanner.ts): recursive RNFS walk, audio ext filter,
  dedupe to one song + N locations, tag fallback = folder name as artist/album +
  cleaned filename as title.
- Player (src/services/player.ts): react-native-track-player v4; queue, shuffle
  (live reshuffle of remainder), repeat cycle, playNext/addToQueue.
- Screens: Onboarding, Library home (red-icon rows + Recently Added grid), Songs,
  Artists(+Detail), Albums(+Detail), Folders (mirrors real directory tree),
  Playlists(+Detail, Favorites smart playlist pinned), Favorites, Search,
  NowPlaying (modal), AddToPlaylist (modal), Settings (rescan / change folder /
  merge duplicates).
- Design: Apple Music iOS — white bg, accent #FA243C, SF system font, large titles.

## Build order for a fresh machine
Follow SETUP.md exactly: init RN 0.74.5 → copy src+index.js → npm install deps →
pod install → add 4 native files in Xcode + bridging header → Background Modes
audio → Release scheme → run on device.

## Decisions already made with the user (do not change without asking)
- Duplicates: show once, Merge Duplicates in Settings deletes extra copies.
- Favorites = smart playlist inside Playlists tab.
- No sleep timer, no playback speed. v1 scope is fixed.
- Music files have proper ID3 metadata; filename cleaning is fallback only.
