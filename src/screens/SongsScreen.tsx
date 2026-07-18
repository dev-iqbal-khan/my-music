import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useActiveTrack } from 'react-native-track-player';
import { colors } from '../theme/colors';
import { getAllSongs } from '../database/queries';
import { SongRow } from '../components/SongRow';
import { playQueue } from '../services/player';
import { useLibraryStore } from '../store/libraryStore';

export function SongsScreen() {
  const navigation = useNavigation<any>();
  const version = useLibraryStore(s => s.libraryVersion);
  const songs = useMemo(() => getAllSongs(), [version]);
  const active = useActiveTrack();

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={{ paddingBottom: 140 }}
      data={songs}
      keyExtractor={s => s.id}
      ListHeaderComponent={
        <View style={styles.actions}>
          <Pressable style={styles.actionBtn} onPress={() => playQueue(songs, 0)}>
            <Text style={styles.actionText}>▶  Play</Text>
          </Pressable>
          <Pressable
            style={styles.actionBtn}
            onPress={() => playQueue(songs, Math.floor(Math.random() * songs.length))}>
            <Text style={styles.actionText}>⤨  Shuffle</Text>
          </Pressable>
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
  list: { flex: 1, backgroundColor: colors.background },
  actions: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingVertical: 12 },
  actionBtn: {
    flex: 1, backgroundColor: colors.secondaryBackground, borderRadius: 12,
    paddingVertical: 12, alignItems: 'center',
  },
  actionText: { color: colors.accent, fontSize: 17, fontWeight: '600' },
});
