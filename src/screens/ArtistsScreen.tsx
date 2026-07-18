import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { type } from '../theme/typography';
import { getArtists } from '../database/queries';
import { ArtworkImage } from '../components/ArtworkImage';
import { useLibraryStore } from '../store/libraryStore';

export function ArtistsScreen() {
  const navigation = useNavigation<any>();
  const version = useLibraryStore(s => s.libraryVersion);
  const artists = useMemo(() => getArtists(), [version]);

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 140 }}
      data={artists}
      keyExtractor={a => a.artist}
      renderItem={({ item }) => (
        <Pressable
          style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.secondaryBackground }]}
          onPress={() => navigation.navigate('ArtistDetail', { artist: item.artist })}>
          <ArtworkImage path={item.artworkPath} size={52} radius={26} />
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={type.body}>{item.artist}</Text>
            <Text style={type.footnote}>{item.songCount} songs</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 8 },
  chevron: { fontSize: 22, color: colors.tertiaryLabel, fontWeight: '600' },
});
