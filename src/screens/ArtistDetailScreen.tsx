import React, { useMemo } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useActiveTrack } from 'react-native-track-player';
import { colors } from '../theme/colors';
import { type } from '../theme/typography';
import { getAlbumsByArtist, getSongsByArtist } from '../database/queries';
import { AlbumGridItem } from '../components/AlbumGridItem';
import { SongRow } from '../components/SongRow';
import { playQueue } from '../services/player';
import { useLibraryStore } from '../store/libraryStore';

export function ArtistDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const artist: string = route.params.artist;
  const version = useLibraryStore(s => s.libraryVersion);
  const songs = useMemo(() => getSongsByArtist(artist), [artist, version]);
  const albums = useMemo(() => getAlbumsByArtist(artist), [artist, version]);
  const active = useActiveTrack();
  const showAlbums = albums.length > 1;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: 140 }}>
      {showAlbums && (
        <View>
          <Text style={[type.title3, styles.section]}>Albums</Text>
          <View style={styles.grid}>
            {albums.map(a => (
              <AlbumGridItem
                key={a.album}
                title={a.album}
                subtitle={`${a.songCount} songs`}
                artworkPath={a.artworkPath}
                onPress={() => navigation.navigate('AlbumDetail', { album: a.album })}
              />
            ))}
          </View>
        </View>
      )}
      <Text style={[type.title3, styles.section]}>Songs</Text>
      {songs.map((s, i) => (
        <SongRow
          key={s.id}
          song={s}
          subtitle={s.album}
          active={active?.id === s.id}
          onPress={() => playQueue(songs, i)}
          onAddToPlaylist={song => navigation.navigate('AddToPlaylist', { songId: song.id })}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: 20, marginTop: 16, marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 20 },
});
