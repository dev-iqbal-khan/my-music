import React from 'react';
import { ActionSheetIOS, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { type } from '../theme/typography';
import { Song, toggleFavorite } from '../database/queries';
import { ArtworkImage } from './ArtworkImage';
import { playNext, addToQueueEnd } from '../services/player';
import { useLibraryStore } from '../store/libraryStore';

interface Props {
  song: Song;
  onPress: () => void;
  onAddToPlaylist: (song: Song) => void;
  subtitle?: string;
  active?: boolean;
}

export function SongRow({ song, onPress, onAddToPlaylist, subtitle, active }: Props) {
  const bump = useLibraryStore(s => s.bumpLibraryVersion);

  const openMenu = () => {
    const favLabel = song.isFavorite ? 'Undo Favorite' : 'Favorite';
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: song.title,
        message: song.artist,
        options: ['Cancel', 'Play Next', 'Add to Queue', favLabel, 'Add to a Playlist…'],
        cancelButtonIndex: 0,
      },
      async idx => {
        if (idx === 1) await playNext(song);
        else if (idx === 2) await addToQueueEnd(song);
        else if (idx === 3) { toggleFavorite(song.id); bump(); }
        else if (idx === 4) onAddToPlaylist(song);
      },
    );
  };

  return (
    <Pressable onPress={onPress} onLongPress={openMenu} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <ArtworkImage path={song.artworkPath} size={48} radius={4} />
      <View style={styles.textCol}>
        <Text numberOfLines={1} style={[type.body, active && { color: colors.accent }]}>{song.title}</Text>
        <Text numberOfLines={1} style={type.subhead}>{subtitle ?? song.artist}</Text>
      </View>
      {song.isFavorite === 1 && <Text style={styles.heart}>♥</Text>}
      <Pressable hitSlop={12} onPress={openMenu}>
        <Text style={styles.more}>⋯</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 6, gap: 12,
    backgroundColor: colors.background,
  },
  pressed: { backgroundColor: colors.secondaryBackground },
  textCol: { flex: 1, gap: 2 },
  heart: { color: colors.accent, fontSize: 14, marginRight: 2 },
  more: { color: colors.secondaryLabel, fontSize: 22, fontWeight: '700', paddingHorizontal: 4 },
});
