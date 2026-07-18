import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useActiveTrack } from 'react-native-track-player';
import { colors } from '../theme/colors';
import { getPlaylistSongs, removeSongFromPlaylist } from '../database/queries';
import { SongRow } from '../components/SongRow';
import { playQueue } from '../services/player';
import { useLibraryStore } from '../store/libraryStore';
import { ActionSheetIOS } from 'react-native';

export function PlaylistDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const playlistId: number = route.params.playlistId;
  const version = useLibraryStore(s => s.libraryVersion);
  const [refresh, setRefresh] = useState(0);
  const songs = useMemo(() => getPlaylistSongs(playlistId), [playlistId, version, refresh]);
  const active = useActiveTrack();

  const removeMenu = (songId: string, title: string) => {
    ActionSheetIOS.showActionSheetWithOptions(
      { title, options: ['Cancel', 'Remove from this Playlist'], cancelButtonIndex: 0, destructiveButtonIndex: 1 },
      idx => {
        if (idx === 1) { removeSongFromPlaylist(playlistId, songId); setRefresh(r => r + 1); }
      },
    );
  };

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 140 }}
      data={songs}
      keyExtractor={s => s.id}
      ListHeaderComponent={
        songs.length > 0 ? (
          <View style={styles.actions}>
            <Pressable style={styles.actionBtn} onPress={() => playQueue(songs, 0)}>
              <Text style={styles.actionText}>▶  Play</Text>
            </Pressable>
            <Pressable style={styles.actionBtn} onPress={() => playQueue(songs, Math.floor(Math.random() * songs.length))}>
              <Text style={styles.actionText}>⤨  Shuffle</Text>
            </Pressable>
          </View>
        ) : (
          <Text style={styles.empty}>Long-press any song anywhere and choose “Add to a Playlist…” to fill this playlist.</Text>
        )
      }
      renderItem={({ item, index }) => (
        <Pressable onLongPress={() => removeMenu(item.id, item.title)}>
          <SongRow
            song={item}
            active={active?.id === item.id}
            onPress={() => playQueue(songs, index)}
            onAddToPlaylist={s => navigation.navigate('AddToPlaylist', { songId: s.id })}
          />
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingVertical: 12 },
  actionBtn: { flex: 1, backgroundColor: colors.secondaryBackground, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  actionText: { color: colors.accent, fontSize: 17, fontWeight: '600' },
  empty: { padding: 32, textAlign: 'center', color: colors.secondaryLabel, fontSize: 15 },
});
