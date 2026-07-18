import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { type } from '../theme/typography';
import { addSongToPlaylist, createPlaylist, getPlaylists } from '../database/queries';
import { ArtworkImage } from '../components/ArtworkImage';

/** Modal: choose which playlist a song goes into. */
export function AddToPlaylistScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const songId: string = route.params.songId;
  const [refresh, setRefresh] = useState(0);
  const playlists = useMemo(() => getPlaylists(), [refresh]);

  const add = (playlistId: number) => {
    addSongToPlaylist(playlistId, songId);
    navigation.goBack();
  };

  const newPlaylist = () => {
    Alert.prompt('New Playlist', 'Give your playlist a name.', name => {
      if (name && name.trim()) {
        const id = createPlaylist(name.trim());
        if (id) add(id);
        else setRefresh(r => r + 1);
      }
    });
  };

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.background }}
      data={playlists}
      keyExtractor={p => String(p.id)}
      ListHeaderComponent={
        <Pressable style={styles.newRow} onPress={newPlaylist}>
          <View style={styles.newIcon}><Text style={{ color: colors.accent, fontSize: 26 }}>＋</Text></View>
          <Text style={[type.body, { color: colors.accent }]}>New Playlist…</Text>
        </Pressable>
      }
      ListEmptyComponent={<Text style={styles.empty}>No playlists yet — create one above.</Text>}
      renderItem={({ item }) => (
        <Pressable
          style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.secondaryBackground }]}
          onPress={() => add(item.id)}>
          <ArtworkImage path={item.artworkPath} size={52} radius={6} />
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={type.body}>{item.name}</Text>
            <Text style={type.footnote}>{item.songCount} songs</Text>
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  newRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 12 },
  newIcon: {
    width: 52, height: 52, borderRadius: 6, backgroundColor: colors.secondaryBackground,
    alignItems: 'center', justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 8 },
  empty: { padding: 32, textAlign: 'center', color: colors.secondaryLabel, fontSize: 15 },
});
