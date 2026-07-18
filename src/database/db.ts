import { open, QuickSQLiteConnection } from 'react-native-quick-sqlite';

let _db: QuickSQLiteConnection | null = null;

export function db(): QuickSQLiteConnection {
  if (!_db) {
    _db = open({ name: 'music.db' });
  }
  return _db;
}

export function initDatabase(): void {
  const d = db();
  d.execute(`CREATE TABLE IF NOT EXISTS songs (
    id TEXT PRIMARY KEY,           -- stable key: size_fileName (survives rescans)
    path TEXT NOT NULL,            -- primary playable location
    fileName TEXT NOT NULL,
    fileSize INTEGER NOT NULL,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    album TEXT NOT NULL,
    genre TEXT,
    duration REAL DEFAULT 0,
    artworkPath TEXT,
    folderPath TEXT NOT NULL,      -- folder of the primary location
    isFavorite INTEGER DEFAULT 0,
    addedAt INTEGER NOT NULL
  );`);

  d.execute(`CREATE TABLE IF NOT EXISTS song_locations (
    songId TEXT NOT NULL,
    path TEXT NOT NULL UNIQUE,
    folderPath TEXT NOT NULL,
    FOREIGN KEY (songId) REFERENCES songs(id) ON DELETE CASCADE
  );`);

  d.execute(`CREATE TABLE IF NOT EXISTS playlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    createdAt INTEGER NOT NULL
  );`);

  d.execute(`CREATE TABLE IF NOT EXISTS playlist_songs (
    playlistId INTEGER NOT NULL,
    songId TEXT NOT NULL,
    position INTEGER NOT NULL,
    UNIQUE(playlistId, songId),
    FOREIGN KEY (playlistId) REFERENCES playlists(id) ON DELETE CASCADE,
    FOREIGN KEY (songId) REFERENCES songs(id) ON DELETE CASCADE
  );`);

  d.execute('CREATE INDEX IF NOT EXISTS idx_songs_artist ON songs(artist);');
  d.execute('CREATE INDEX IF NOT EXISTS idx_songs_album ON songs(album);');
  d.execute('CREATE INDEX IF NOT EXISTS idx_songs_folder ON songs(folderPath);');
  d.execute('CREATE INDEX IF NOT EXISTS idx_locations_song ON song_locations(songId);');
}
