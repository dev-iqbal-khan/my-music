import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { type } from '../theme/typography';
import { createPlaylist, deletePlaylist, favoritesCount, getPlaylists } from '../database/queries';
import { ArtworkImage } from '../components/ArtworkImage';
import { useLibraryStore } from '../store/libraryStore';

export function PlaylistsScreen() {
  const navigation = useNavigation<any>();
  const focused = useIsFocused();
  const version = useLibraryStore(s => s.libraryVersion);
  const [refresh, setRefresh] = useState(0);
  const playlists = useMemo(() => getPlaylists(), [version, refresh, focused]);
  const favCount = useMemo(() => favoritesCount(), [version, focused]);

  const newPlaylist = () => {
    Alert.prompt('New Playlist', 'Give your playlist a name.', name => {
      if (name && name.trim()) {
        createPlaylist(name.trim());
        setRefresh(r => r + 1);
      }
    });
  };

  const confirmDelete = (id: number, name: string) => {
    Alert.alert(`Delete “${name}”?`, 'This removes the playlist, not the songs.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deletePlaylist(id); setRefresh(r => r + 1); } },
    ]);
  };

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 140 }}
      data={playlists}
      keyExtractor={p => String(p.id)}
      ListHeaderComponent={
        <View>
          <Pressable style={styles.newRow} onPress={newPlaylist}>
            <View style={styles.newIcon}><Text style={{ color: colors.accent, fontSize: 26 }}>＋</Text></View>
            <Text style={[type.body, { color: colors.accent }]}>New Playlist…</Text>
          </Pressable>
          {/* Favorites smart playlist — always pinned first */}
          <Pressable
            style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.secondaryBackground }]}
            onPress={() => navigation.navigate('Favorites')}>
            <View style={styles.favArt}><Text style={{ color: '#FFF', fontSize: 26 }}>♥</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={type.body}>Favorite Songs</Text>
              <Text style={type.footnote}>Smart Playlist · {favCount} songs</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        </View>
      }
      renderItem={({ item }) => (
        <Pressable
          style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.secondaryBackground }]}
          onPress={() => navigation.navigate('PlaylistDetail', { playlistId: item.id, name: item.name })}
          onLongPress={() => confirmDelete(item.id, item.name)}>
          <ArtworkImage path={item.artworkPath} size={56} radius={6} />
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={type.body}>{item.name}</Text>
            <Text style={type.footnote}>{item.songCount} songs</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  newRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 10 },
  newIcon: {
    width: 56, height: 56, borderRadius: 6, backgroundColor: colors.secondaryBackground,
    alignItems: 'center', justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 8 },
  favArt: {
    width: 56, height: 56, borderRadius: 6, backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  chevron: { fontSize: 22, color: colors.tertiaryLabel, fontWeight: '600' },
});
