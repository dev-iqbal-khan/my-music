import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, View } from 'react-native';
import { RootNavigator } from './navigation/RootNavigator';
import { initDatabase } from './database/db';
import { setupPlayer } from './services/player';
import { FolderBookmark } from './native/FolderBookmark';
import { useLibraryStore } from './store/libraryStore';
import { colors } from './theme/colors';

export default function App() {
  const [ready, setReady] = useState(false);
  const setRootPath = useLibraryStore(s => s.setRootPath);

  useEffect(() => {
    (async () => {
      initDatabase();
      await setupPlayer();
      // Re-open the folder permission saved on first launch
      const path = await FolderBookmark.restoreAccess();
      setRootPath(path);
      setReady(true);
    })();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <RootNavigator />
    </>
  );
}
