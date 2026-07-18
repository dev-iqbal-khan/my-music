import React from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { type } from '../theme/typography';
import { FolderBookmark } from '../native/FolderBookmark';
import { scanLibrary } from '../services/scanner';
import { useLibraryStore } from '../store/libraryStore';

export function OnboardingScreen() {
  const { scanning, scanProcessed, scanTotal, setRootPath } = useLibraryStore();

  const pick = async () => {
    try {
      const res = await FolderBookmark.pickFolder();
      await scanLibrary(res.path);
      setRootPath(res.path); // switches navigator to the main app
    } catch (e: any) {
      if (e?.code !== 'cancelled') {
        Alert.alert('Could not open folder', String(e?.message ?? e));
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.note}>♪</Text>
      <Text style={[type.largeTitle, styles.center]}>Your Music</Text>
      <Text style={[type.subhead, styles.center, { marginTop: 8, paddingHorizontal: 40 }]}>
        Choose the folder in Files that holds all your music. You only do this once.
      </Text>
      {scanning ? (
        <View style={styles.progress}>
          <ActivityIndicator color={colors.accent} />
          <Text style={type.subhead}>Adding songs… {scanProcessed}/{scanTotal}</Text>
        </View>
      ) : (
        <Pressable style={styles.button} onPress={pick}>
          <Text style={styles.buttonText}>Choose Music Folder</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  note: { fontSize: 64, color: colors.accent, marginBottom: 16 },
  center: { textAlign: 'center' },
  button: {
    marginTop: 32, backgroundColor: colors.accent,
    paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12,
  },
  buttonText: { color: '#FFF', fontSize: 17, fontWeight: '600' },
  progress: { marginTop: 32, alignItems: 'center', gap: 12 },
});
