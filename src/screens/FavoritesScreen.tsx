import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useActiveTrack } from 'react-native-track-player';
import { colors } from '../theme/colors';
import { getFavorites } from '../database/queries';
import { SongRow } from '../components/SongRow';
import { playQueue } from '../services/player';
import { useLibraryStore } from '../store/libraryStore';

export function FavoritesScreen() {
  const navigation = useNavigation<any>();
  const version = useLibraryStore(s => s.libraryVersion);
  const songs = useMemo(() => getFavorites(), [version]);
  const active = useActiveTrack();

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
          <Text style={styles.empty}>Long-press any song and tap “Favorite” — it appears here instantly.</Text>
        )
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
  actions: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingVertical: 12 },
  actionBtn: { flex: 1, backgroundColor: colors.secondaryBackground, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  actionText: { color: colors.accent, fontSize: 17, fontWeight: '600' },
  empty: { padding: 32, textAlign: 'center', color: colors.secondaryLabel, fontSize: 15 },
});
