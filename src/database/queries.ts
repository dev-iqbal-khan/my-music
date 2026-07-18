import { db } from './db';

export interface Song {
  id: string;
  path: string;
  fileName: string;
  fileSize: number;
  title: string;
  artist: string;
  album: string;
  genre: string | null;
  duration: number;
  artworkPath: string | null;
  folderPath: string;
  isFavorite: number;
  addedAt: number;
}

export interface ArtistRow { artist: string; songCount: number; artworkPath: string | null }
export interface AlbumRow { album: string; artist: string; songCount: number; artworkPath: string | null }
export interface Playlist { id: number; name: string; createdAt: number; songCount: number; artworkPath: string | null }
export interface FolderEntry { name: string; path: string; isDirectory: boolean; songCount?: number }
export interface DuplicateGroup { songId: string; title: string; artist: string; paths: string[] }

function rows<T>(res: any): T[] {
  const out: T[] = [];
  for (let i = 0; i < (res.rows?.length ?? 0); i++) out.push(res.rows.item(i));
  return out;
}

// ---------- Songs ----------
export function getAllSongs(): Song[] {
  return rows<Song>(db().execute('SELECT * FROM songs ORDER BY title COLLATE NOCASE ASC'));
}

export function getSong(id: string): Song | undefined {
  return rows<Song>(db().execute('SELECT * FROM songs WHERE id = ?', [id]))[0];
}

export function getRecentlyAdded(limit = 12): Song[] {
  return rows<Song>(db().execute('SELECT * FROM songs ORDER BY addedAt DESC LIMIT ?', [limit]));
}

export function upsertSong(s: Omit<Song, 'isFavorite' | 'addedAt'>): void {
  db().execute(
    `INSERT INTO songs (id, path, fileName, fileSize, title, artist, album, genre, duration, artworkPath, folderPath, isFavorite, addedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
     ON CONFLICT(id) DO UPDATE SET
       path=excluded.path, title=excluded.title, artist=excluded.artist,
       album=excluded.album, genre=excluded.genre, duration=excluded.duration,
       artworkPath=excluded.artworkPath, folderPath=excluded.folderPath`,
    [s.id, s.path, s.fileName, s.fileSize, s.title, s.artist, s.album, s.genre, s.duration, s.artworkPath, s.folderPath, Date.now()],
  );
}

export function addLocation(songId: string, path: string, folderPath: string): void {
  db().execute(
    'INSERT OR IGNORE INTO song_locations (songId, path, folderPath) VALUES (?, ?, ?)',
    [songId, path, folderPath],
  );
}

export function clearLocations(): void {
  db().execute('DELETE FROM song_locations');
}

export function deleteSongsNotIn(ids: string[]): void {
  if (ids.length === 0) { db().execute('DELETE FROM songs'); return; }
  const placeholders = ids.map(() => '?').join(',');
  db().execute(`DELETE FROM songs WHERE id NOT IN (${placeholders})`, ids);
}

// ---------- Search ----------
export function searchSongs(q: string): Song[] {
  const like = `%${q}%`;
  return rows<Song>(db().execute(
    `SELECT * FROM songs WHERE title LIKE ? OR artist LIKE ? OR album LIKE ?
     ORDER BY title COLLATE NOCASE ASC LIMIT 200`,
    [like, like, like],
  ));
}

// ---------- Artists / Albums ----------
export function getArtists(): ArtistRow[] {
  return rows<ArtistRow>(db().execute(
    `SELECT artist, COUNT(*) AS songCount, MAX(artworkPath) AS artworkPath
     FROM songs GROUP BY artist ORDER BY artist COLLATE NOCASE ASC`,
  ));
}

export function getSongsByArtist(artist: string): Song[] {
  return rows<Song>(db().execute(
    'SELECT * FROM songs WHERE artist = ? ORDER BY album COLLATE NOCASE, title COLLATE NOCASE',
    [artist],
  ));
}

export function getAlbums(): AlbumRow[] {
  return rows<AlbumRow>(db().execute(
    `SELECT album, MIN(artist) AS artist, COUNT(*) AS songCount, MAX(artworkPath) AS artworkPath
     FROM songs GROUP BY album ORDER BY album COLLATE NOCASE ASC`,
  ));
}

export function getAlbumsByArtist(artist: string): AlbumRow[] {
  return rows<AlbumRow>(db().execute(
    `SELECT album, MIN(artist) AS artist, COUNT(*) AS songCount, MAX(artworkPath) AS artworkPath
     FROM songs WHERE artist = ? GROUP BY album ORDER BY album COLLATE NOCASE ASC`,
    [artist],
  ));
}

export function getSongsByAlbum(album: string): Song[] {
  return rows<Song>(db().execute(
    'SELECT * FROM songs WHERE album = ? ORDER BY title COLLATE NOCASE',
    [album],
  ));
}

// ---------- Folders ----------
export function getSongsInFolder(folderPath: string): Song[] {
  const direct = rows<Song>(db().execute(
    `SELECT s.* FROM songs s
     WHERE s.folderPath = ?
        OR s.id IN (SELECT songId FROM song_locations WHERE folderPath = ?)
     ORDER BY s.title COLLATE NOCASE`,
    [folderPath, folderPath],
  ));
  return direct;
}

// ---------- Favorites ----------
export function toggleFavorite(songId: string): void {
  db().execute('UPDATE songs SET isFavorite = CASE isFavorite WHEN 1 THEN 0 ELSE 1 END WHERE id = ?', [songId]);
}

export function getFavorites(): Song[] {
  return rows<Song>(db().execute('SELECT * FROM songs WHERE isFavorite = 1 ORDER BY title COLLATE NOCASE'));
}

export function favoritesCount(): number {
  const r = rows<{ c: number }>(db().execute('SELECT COUNT(*) AS c FROM songs WHERE isFavorite = 1'));
  return r[0]?.c ?? 0;
}

// ---------- Playlists ----------
export function getPlaylists(): Playlist[] {
  return rows<Playlist>(db().execute(
    `SELECT p.id, p.name, p.createdAt,
            COUNT(ps.songId) AS songCount,
            (SELECT s.artworkPath FROM playlist_songs ps2
              JOIN songs s ON s.id = ps2.songId
              WHERE ps2.playlistId = p.id AND s.artworkPath IS NOT NULL
              ORDER BY ps2.position LIMIT 1) AS artworkPath
     FROM playlists p
     LEFT JOIN playlist_songs ps ON ps.playlistId = p.id
     GROUP BY p.id ORDER BY p.createdAt DESC`,
  ));
}

export function createPlaylist(name: string): number {
  const res = db().execute('INSERT INTO playlists (name, createdAt) VALUES (?, ?)', [name, Date.now()]);
  return res.insertId ?? 0;
}

export function renamePlaylist(id: number, name: string): void {
  db().execute('UPDATE playlists SET name = ? WHERE id = ?', [name, id]);
}

export function deletePlaylist(id: number): void {
  db().execute('DELETE FROM playlist_songs WHERE playlistId = ?', [id]);
  db().execute('DELETE FROM playlists WHERE id = ?', [id]);
}

export function getPlaylistSongs(playlistId: number): Song[] {
  return rows<Song>(db().execute(
    `SELECT s.* FROM playlist_songs ps JOIN songs s ON s.id = ps.songId
     WHERE ps.playlistId = ? ORDER BY ps.position ASC`,
    [playlistId],
  ));
}

export function addSongToPlaylist(playlistId: number, songId: string): void {
  const r = rows<{ m: number }>(db().execute(
    'SELECT COALESCE(MAX(position), -1) + 1 AS m FROM playlist_songs WHERE playlistId = ?', [playlistId]));
  db().execute(
    'INSERT OR IGNORE INTO playlist_songs (playlistId, songId, position) VALUES (?, ?, ?)',
    [playlistId, songId, r[0]?.m ?? 0],
  );
}

export function removeSongFromPlaylist(playlistId: number, songId: string): void {
  db().execute('DELETE FROM playlist_songs WHERE playlistId = ? AND songId = ?', [playlistId, songId]);
}

// ---------- Duplicates ----------
export function getDuplicateGroups(): DuplicateGroup[] {
  const dup = rows<{ songId: string; paths: string; title: string; artist: string }>(db().execute(
    `SELECT sl.songId AS songId, GROUP_CONCAT(sl.path, '||') AS paths, s.title, s.artist
     FROM song_locations sl JOIN songs s ON s.id = sl.songId
     GROUP BY sl.songId HAVING COUNT(*) > 1`,
  ));
  return dup.map(d => ({ songId: d.songId, title: d.title, artist: d.artist, paths: d.paths.split('||') }));
}

export function removeLocation(path: string): void {
  db().execute('DELETE FROM song_locations WHERE path = ?', [path]);
}

// ---------- Stats ----------
export function libraryCounts(): { songs: number; artists: number; albums: number } {
  const s = rows<{ c: number }>(db().execute('SELECT COUNT(*) AS c FROM songs'))[0]?.c ?? 0;
  const a = rows<{ c: number }>(db().execute('SELECT COUNT(DISTINCT artist) AS c FROM songs'))[0]?.c ?? 0;
  const al = rows<{ c: number }>(db().execute('SELECT COUNT(DISTINCT album) AS c FROM songs'))[0]?.c ?? 0;
  return { songs: s, artists: a, albums: al };
}
