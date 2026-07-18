import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { type } from '../theme/typography';
import { FolderBookmark } from '../native/FolderBookmark';
import { scanLibrary } from '../services/scanner';
import { getDuplicateGroups, libraryCounts, removeLocation } from '../database/queries';
import { useLibraryStore } from '../store/libraryStore';

export function SettingsScreen() {
  const { rootPath, setRootPath, scanning, scanProcessed, scanTotal, libraryVersion, bumpLibraryVersion } = useLibraryStore();
  const [busy, setBusy] = useState(false);
  const counts = useMemo(() => libraryCounts(), [libraryVersion]);
  const dupGroups = useMemo(() => getDuplicateGroups(), [libraryVersion]);
  const extraCopies = dupGroups.reduce((n, g) => n + g.paths.length - 1, 0);

  const rescan = async () => {
    if (!rootPath) return;
    await scanLibrary(rootPath);
  };

  const changeFolder = async () => {
    try {
      const res = await FolderBookmark.pickFolder();
      await scanLibrary(res.path);
      setRootPath(res.path);
    } catch { /* cancelled */ }
  };

  const mergeDuplicates = () => {
    if (extraCopies === 0) {
      Alert.alert('No duplicates', 'Your library has no duplicate files.');
      return;
    }
    Alert.alert(
      'Merge duplicates?',
      `${dupGroups.length} songs exist in more than one folder. This keeps one copy of each and permanently deletes ${extraCopies} extra file(s) from your folder.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: `Delete ${extraCopies} copies`, style: 'destructive',
          onPress: async () => {
            setBusy(true);
            let deleted = 0;
            for (const g of dupGroups) {
              // keep paths[0], delete the rest
              for (const p of g.paths.slice(1)) {
                try {
                  await FolderBookmark.deleteFile(p);
                  removeLocation(p);
                  deleted += 1;
                } catch { /* file locked/missing — skip */ }
              }
            }
            setBusy(false);
            bumpLibraryVersion();
            Alert.alert('Done', `Deleted ${deleted} duplicate file(s).`);
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.secondaryBackground }} contentContainerStyle={{ paddingBottom: 140 }}>
      <Text style={styles.sectionHeader}>LIBRARY</Text>
      <View style={styles.card}>
        <Row label="Songs" value={String(counts.songs)} />
        <Row label="Artists" value={String(counts.artists)} />
        <Row label="Albums" value={String(counts.albums)} last />
      </View>

      <Text style={styles.sectionHeader}>MUSIC FOLDER</Text>
      <View style={styles.card}>
        <Text style={[type.footnote, { padding: 14 }]} numberOfLines={2}>{rootPath ?? 'No folder selected'}</Text>
        <ActionRow label={scanning ? `Scanning… ${scanProcessed}/${scanTotal}` : 'Rescan Library'} onPress={rescan} disabled={scanning} />
        <ActionRow label="Change Music Folder…" onPress={changeFolder} disabled={scanning} last />
      </View>

      <Text style={styles.sectionHeader}>UTILITIES</Text>
      <View style={styles.card}>
        {busy ? (
          <View style={{ padding: 14, alignItems: 'center' }}><ActivityIndicator color={colors.accent} /></View>
        ) : (
          <ActionRow
            label={`Merge Duplicates${extraCopies > 0 ? ` (${extraCopies} extra copies)` : ''}`}
            onPress={mergeDuplicates}
            destructive
            last
          />
        )}
      </View>
      <Text style={[type.footnote, { paddingHorizontal: 28, paddingTop: 8 }]}>
        Merge keeps one copy of each duplicated song and deletes the extra files from your music folder. Playlists and favorites are not affected.
      </Text>
    </ScrollView>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={type.body}>{label}</Text>
      <Text style={[type.body, { color: colors.secondaryLabel }]}>{value}</Text>
    </View>
  );
}

function ActionRow({ label, onPress, disabled, destructive, last }:
  { label: string; onPress: () => void; disabled?: boolean; destructive?: boolean; last?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.row, !last && styles.rowBorder]}>
      <Text style={[type.body, { color: destructive ? colors.destructive : colors.accent, opacity: disabled ? 0.4 : 1 }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sectionHeader: { fontSize: 13, color: colors.secondaryLabel, paddingHorizontal: 28, paddingTop: 24, paddingBottom: 6 },
  card: { backgroundColor: colors.card, borderRadius: 10, marginHorizontal: 16, overflow: 'hidden' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.separator },
});
