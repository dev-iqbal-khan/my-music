import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useActiveTrack } from 'react-native-track-player';
import { colors } from '../theme/colors';
import { type } from '../theme/typography';
import { getSongsByAlbum } from '../database/queries';
import { ArtworkImage } from '../components/ArtworkImage';
import { SongRow } from '../components/SongRow';
import { playQueue } from '../services/player';
import { useLibraryStore } from '../store/libraryStore';

export function AlbumDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const album: string = route.params.album;
  const version = useLibraryStore(s => s.libraryVersion);
  const songs = useMemo(() => getSongsByAlbum(album), [album, version]);
  const active = useActiveTrack();
  const artwork = songs.find(s => s.artworkPath)?.artworkPath ?? null;
  const artist = songs[0]?.artist ?? '';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: 140 }}>
      <View style={styles.header}>
        <ArtworkImage path={artwork} size={220} radius={10} />
        <Text style={[type.title3, { marginTop: 12, textAlign: 'center' }]} numberOfLines={2}>{album}</Text>
        <Text style={[type.subhead, { color: colors.accent, marginTop: 2 }]}>{artist}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable style={styles.actionBtn} onPress={() => playQueue(songs, 0)}>
          <Text style={styles.actionText}>▶  Play</Text>
        </Pressable>
        <Pressable style={styles.actionBtn} onPress={() => playQueue(songs, Math.floor(Math.random() * songs.length))}>
          <Text style={styles.actionText}>⤨  Shuffle</Text>
        </Pressable>
      </View>
      {songs.map((s, i) => (
        <SongRow
          key={s.id}
          song={s}
          active={active?.id === s.id}
          onPress={() => playQueue(songs, i)}
          onAddToPlaylist={song => navigation.navigate('AddToPlaylist', { songId: song.id })}
        />
      ))}
      <Text style={[type.footnote, { paddingHorizontal: 20, paddingTop: 12 }]}>{songs.length} songs</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingTop: 16, paddingHorizontal: 20 },
  actions: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingVertical: 16 },
  actionBtn: { flex: 1, backgroundColor: colors.secondaryBackground, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  actionText: { color: colors.accent, fontSize: 17, fontWeight: '600' },
});
