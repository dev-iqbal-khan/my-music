import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useActiveTrack } from 'react-native-track-player';
import { colors } from '../theme/colors';
import { searchSongs } from '../database/queries';
import { SongRow } from '../components/SongRow';
import { playQueue } from '../services/player';
import { useLibraryStore } from '../store/libraryStore';

export function SearchScreen() {
  const navigation = useNavigation<any>();
  const version = useLibraryStore(s => s.libraryVersion);
  const [query, setQuery] = useState('');
  const results = useMemo(() => (query.trim() ? searchSongs(query.trim()) : []), [query, version]);
  const active = useActiveTrack();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.input}
          placeholder="Artists, Songs, Albums"
          placeholderTextColor={colors.secondaryLabel}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>
      <FlatList
        contentContainerStyle={{ paddingBottom: 140 }}
        data={results}
        keyExtractor={s => s.id}
        keyboardDismissMode="on-drag"
        ListEmptyComponent={
          query.trim() ? <Text style={styles.empty}>No results for “{query.trim()}”.</Text> : null
        }
        renderItem={({ item, index }) => (
          <SongRow
            song={item}
            subtitle={`${item.artist} — ${item.album}`}
            active={active?.id === item.id}
            onPress={() => playQueue(results, index)}
            onAddToPlaylist={s => navigation.navigate('AddToPlaylist', { songId: s.id })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchWrap: { paddingHorizontal: 16, paddingVertical: 8 },
  input: {
    backgroundColor: colors.secondaryBackground, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 9, fontSize: 17, color: colors.label,
  },
  empty: { padding: 32, textAlign: 'center', color: colors.secondaryLabel, fontSize: 15 },
});
