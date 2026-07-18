import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { getAlbums } from '../database/queries';
import { AlbumGridItem } from '../components/AlbumGridItem';
import { useLibraryStore } from '../store/libraryStore';

export function AlbumsScreen() {
  const navigation = useNavigation<any>();
  const version = useLibraryStore(s => s.libraryVersion);
  const albums = useMemo(() => getAlbums(), [version]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: 140 }}>
      <View style={styles.grid}>
        {albums.map(a => (
          <AlbumGridItem
            key={a.album}
            title={a.album}
            subtitle={a.artist}
            artworkPath={a.artworkPath}
            onPress={() => navigation.navigate('AlbumDetail', { album: a.album })}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16 },
});
