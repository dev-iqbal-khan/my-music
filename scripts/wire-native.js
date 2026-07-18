/* One-shot: wire the native Swift/ObjC modules into the MusicClone Xcode target.
 * Edits ios/MusicClone.xcodeproj/project.pbxproj in place via the `xcode` parser.
 * Idempotent-ish: safe to inspect output; re-running would duplicate refs, so run once. */
const xcode = require('xcode');
const path = require('path');

const pbxPath = path.join(__dirname, '..', 'ios', 'MusicClone.xcodeproj', 'project.pbxproj');
const proj = xcode.project(pbxPath);
proj.parseSync();

// --- locate the MusicClone app target (NOT MusicCloneTests) ---
const nativeTargets = proj.pbxNativeTargetSection();
let targetUuid = null;
for (const key of Object.keys(nativeTargets)) {
  if (key.endsWith('_comment')) continue;
  const name = (nativeTargets[key].name || '').replace(/"/g, '');
  if (name === 'MusicClone') { targetUuid = key; break; }
}
if (!targetUuid) throw new Error('MusicClone target not found');
console.log('MusicClone target uuid:', targetUuid);

// --- find the MusicClone group to file the sources under (cosmetic; best-effort) ---
let groupKey =
  proj.findPBXGroupKey({ name: 'MusicClone' }) ||
  proj.findPBXGroupKey({ path: 'MusicClone' }) ||
  null;
console.log('MusicClone group key:', groupKey);

const opt = { target: targetUuid };
const sources = [
  'MusicClone/FolderBookmark.swift',
  'MusicClone/FolderBookmark.m',
  'MusicClone/MetadataReader.swift',
  'MusicClone/MetadataReader.m',
];
for (const s of sources) {
  proj.addSourceFile(s, opt, groupKey);
  console.log('added source ->', s);
}

// bridging header: add as a plain navigator reference (do NOT compile it)
try {
  proj.addFile('MusicClone/MusicClone-Bridging-Header.h', groupKey);
  console.log('added file ref -> bridging header');
} catch (e) {
  console.log('bridging-header ref skipped (non-fatal):', e.message);
}

// --- build settings on the MusicClone target only ---
proj.updateBuildProperty('SWIFT_VERSION', '5.0', null, 'MusicClone');
proj.updateBuildProperty('SWIFT_OBJC_BRIDGING_HEADER', '"MusicClone/MusicClone-Bridging-Header.h"', null, 'MusicClone');
proj.updateBuildProperty('ALWAYS_EMBED_SWIFT_STANDARD_LIBRARIES', 'YES', null, 'MusicClone');
proj.updateBuildProperty('CLANG_ENABLE_MODULES', 'YES', null, 'MusicClone');
proj.updateBuildProperty('PRODUCT_BUNDLE_IDENTIFIER', 'com.iqbal.mymusic', null, 'MusicClone');
proj.updateBuildProperty('CODE_SIGN_STYLE', 'Automatic', null, 'MusicClone');
console.log('build settings updated for MusicClone target');

require('fs').writeFileSync(pbxPath, proj.writeSync());
console.log('WROTE', pbxPath);
