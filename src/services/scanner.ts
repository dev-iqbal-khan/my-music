import RNFS from 'react-native-fs';
import { MetadataReader } from '../native/MetadataReader';
import {
  upsertSong, addLocation, clearLocations, deleteSongsNotIn, getSong,
} from '../database/queries';
import { useLibraryStore } from '../store/libraryStore';

const AUDIO_EXT = new Set(['mp3', 'm4a', 'aac', 'wav', 'flac', 'aiff', 'aif', 'caf']);

export const ARTWORK_DIR = `${RNFS.DocumentDirectoryPath}/artwork`;

interface FoundFile { path: string; name: string; size: number; folderPath: string }

function isAudio(name: string): boolean {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  return AUDIO_EXT.has(ext);
}

/** Fallback title when a file has no tags: clean up YouTube-style names. */
export function cleanFileName(name: string): string {
  let t = name.replace(/\.[^.]+$/, '');
  t = t.split(/[｜|]/)[0];
  t = t.replace(/\s+/g, ' ').trim();
  return t.length > 0 ? t : name;
}

async function walk(dir: string, out: FoundFile[]): Promise<void> {
  let entries: RNFS.ReadDirItem[] = [];
  try {
    entries = await RNFS.readDir(dir);
  } catch {
    return; // unreadable subfolder — skip
  }
  for (const e of entries) {
    if (e.isDirectory()) {
      await walk(e.path, out);
    } else if (e.isFile() && isAudio(e.name)) {
      out.push({ path: e.path, name: e.name, size: Number(e.size), folderPath: dir });
    }
  }
}

/**
 * Full library scan.
 * - Dedup key: `${size}_${fileName}` → same song in two folders stored once,
 *   every location recorded in song_locations.
 * - Favorites & playlists survive rescans because the song id is stable.
 */
export async function scanLibrary(rootPath: string): Promise<void> {
  const store = useLibraryStore.getState();
  store.setScanning(true, 0, 0);

  const files: FoundFile[] = [];
  await walk(rootPath, files);

  store.setScanning(true, 0, files.length);
  clearLocations();

  const seen = new Map<string, FoundFile>(); // id -> primary file
  const allIds: string[] = [];
  let processed = 0;

  for (const f of files) {
    const id = `${f.size}_${f.name}`;
    addLocation(id, f.path, f.folderPath);

    if (!seen.has(id)) {
      seen.set(id, f);
      allIds.push(id);

      const existing = getSong(id);
      const needsMetadata = !existing || existing.path !== f.path || existing.duration === 0;

      if (needsMetadata || !existing) {
        let meta = { title: null as string | null, artist: null as string | null, album: null as string | null, genre: null as string | null, duration: 0, artworkPath: null as string | null };
        try {
          meta = await MetadataReader.read(f.path, ARTWORK_DIR);
        } catch { /* keep fallbacks */ }

        const folderName = f.folderPath.split('/').filter(Boolean).pop() ?? 'Unknown';
        upsertSong({
          id,
          path: f.path,
          fileName: f.name,
          fileSize: f.size,
          title: meta.title ?? cleanFileName(f.name),
          artist: meta.artist ?? folderName,
          album: meta.album ?? folderName,
          genre: meta.genre,
          duration: meta.duration ?? 0,
          artworkPath: meta.artworkPath,
          folderPath: f.folderPath,
        });
      } else {
        // Re-point primary path in case the folder moved
        upsertSong({ ...existing, path: f.path, folderPath: f.folderPath });
      }
    }

    processed += 1;
    if (processed % 10 === 0 || processed === files.length) {
      store.setScanning(true, processed, files.length);
    }
  }

  // Remove songs whose files no longer exist
  deleteSongsNotIn(allIds);

  store.setScanning(false, files.length, files.length);
  store.bumpLibraryVersion();
}

/** List one directory level for the Folders tab. */
export async function listFolder(dir: string): Promise<{ folders: { name: string; path: string }[]; files: { name: string; path: string }[] }> {
  const entries = await RNFS.readDir(dir);
  const folders = entries.filter(e => e.isDirectory()).map(e => ({ name: e.name, path: e.path }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const files = entries.filter(e => e.isFile() && isAudio(e.name)).map(e => ({ name: e.name, path: e.path }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return { folders, files };
}
