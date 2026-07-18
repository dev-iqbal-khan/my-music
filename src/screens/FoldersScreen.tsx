import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useActiveTrack } from 'react-native-track-player';
import { colors } from '../theme/colors';
import { type } from '../theme/typography';
import { listFolder } from '../services/scanner';
import { getSongsInFolder, Song } from '../database/queries';
import { SongRow } from '../components/SongRow';
import { playQueue } from '../services/player';
import { useLibraryStore } from '../store/libraryStore';

/** Mirrors the real directory tree. Route param `path` = current folder (root when absent). */
export function FoldersScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const rootPath = useLibraryStore(s => s.rootPath);
  const version = useLibraryStore(s => s.libraryVersion);
  const path: string = route.params?.path ?? rootPath ?? '';
  const [folders, setFolders] = useState<{ name: string; path: string }[]>([]);
  const active = useActiveTrack();

  useEffect(() => {
    let alive = true;
    listFolder(path).then(r => { if (alive) setFolders(r.folders); }).catch(() => setFolders([]));
    return () => { alive = false; };
  }, [path]);

  const songs: Song[] = useMemo(() => getSongsInFolder(path), [path, version]);

  useEffect(() => {
    if (route.params?.path) {
      navigation.setOptions({ title: path.split('/').filter(Boolean).pop() });
    }
  }, [path]);

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 140 }}
      data={songs}
      keyExtractor={s => s.id + path}
      ListHeaderComponent={
        <View>
          {folders.map(f => (
            <Pressable
              key={f.path}
              style={({ pressed }) => [styles.folderRow, pressed && { backgroundColor: colors.secondaryBackground }]}
              onPress={() => navigation.push('Folders', { path: f.path })}>
              <Text style={styles.folderIcon}>📁</Text>
              <Text numberOfLines={1} style={[type.body, { flex: 1 }]}>{f.name}</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
          {songs.length > 0 && (
            <View style={styles.actions}>
              <Pressable style={styles.actionBtn} onPress={() => playQueue(songs, 0)}>
                <Text style={styles.actionText}>▶  Play</Text>
              </Pressable>
              <Pressable style={styles.actionBtn} onPress={() => playQueue(songs, Math.floor(Math.random() * songs.length))}>
                <Text style={styles.actionText}>⤨  Shuffle</Text>
              </Pressable>
            </View>
          )}
        </View>
      }
      renderItem={({ item, index }) => (
        <SongRow
          song={item}
          active={active?.id === item.id}
          onPress={() => playQueue(songs, index)}
          onAddToPlaylist={s => navigation.navigate('AddToPlaylist', { songId: s.id })}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  folderRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 12 },
  folderIcon: { fontSize: 22 },
  chevron: { fontSize: 22, color: colors.tertiaryLabel, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingVertical: 12 },
  actionBtn: { flex: 1, backgroundColor: colors.secondaryBackground, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  actionText: { color: colors.accent, fontSize: 17, fontWeight: '600' },
});
