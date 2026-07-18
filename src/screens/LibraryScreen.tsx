import React, { useMemo } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { type } from '../theme/typography';
import { LibraryRow } from '../components/LibraryRow';
import { AlbumGridItem } from '../components/AlbumGridItem';
import { getRecentlyAdded } from '../database/queries';
import { useLibraryStore } from '../store/libraryStore';
import { playQueue } from '../services/player';

export function LibraryScreen() {
  const navigation = useNavigation<any>();
  const version = useLibraryStore(s => s.libraryVersion);
  const recent = useMemo(() => getRecentlyAdded(8), [version]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 140 }}>
      <LibraryRow icon="▤" label="Playlists" onPress={() => navigation.navigate('Playlists')} />
      <LibraryRow icon="🎤" label="Artists" onPress={() => navigation.navigate('Artists')} />
      <LibraryRow icon="◉" label="Albums" onPress={() => navigation.navigate('Albums')} />
      <LibraryRow icon="♫" label="Songs" onPress={() => navigation.navigate('Songs')} />
      <LibraryRow icon="♥" label="Favorites" onPress={() => navigation.navigate('Favorites')} />
      <LibraryRow icon="🗂" label="Folders" onPress={() => navigation.navigate('Folders', {})} isLast />

      {recent.length > 0 && (
        <View style={styles.recentBlock}>
          <Text style={[type.title2, styles.recentTitle]}>Recently Added</Text>
          <View style={styles.grid}>
            {recent.map((s, i) => (
              <AlbumGridItem
                key={s.id}
                title={s.title}
                subtitle={s.artist}
                artworkPath={s.artworkPath}
                onPress={() => playQueue(recent, i)}
              />
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  recentBlock: { marginTop: 24 },
  recentTitle: { paddingHorizontal: 20, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 20 },
});
