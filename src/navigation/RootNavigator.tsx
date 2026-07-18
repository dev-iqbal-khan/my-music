import React from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../theme/colors';
import { useLibraryStore } from '../store/libraryStore';
import { MiniPlayer } from '../components/MiniPlayer';

import { OnboardingScreen } from '../screens/OnboardingScreen';
import { LibraryScreen } from '../screens/LibraryScreen';
import { SongsScreen } from '../screens/SongsScreen';
import { ArtistsScreen } from '../screens/ArtistsScreen';
import { ArtistDetailScreen } from '../screens/ArtistDetailScreen';
import { AlbumsScreen } from '../screens/AlbumsScreen';
import { AlbumDetailScreen } from '../screens/AlbumDetailScreen';
import { FoldersScreen } from '../screens/FoldersScreen';
import { PlaylistsScreen } from '../screens/PlaylistsScreen';
import { PlaylistDetailScreen } from '../screens/PlaylistDetailScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { NowPlayingScreen } from '../screens/NowPlayingScreen';
import { AddToPlaylistScreen } from '../screens/AddToPlaylistScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, primary: colors.accent, background: colors.background },
};

const LibraryStack = createNativeStackNavigator();
function LibraryStackScreen() {
  return (
    <LibraryStack.Navigator
      screenOptions={{ headerLargeTitle: true, headerTintColor: colors.accent, headerTitleStyle: { color: colors.label } }}>
      <LibraryStack.Screen name="LibraryHome" component={LibraryScreen} options={{ title: 'Library' }} />
      <LibraryStack.Screen name="Songs" component={SongsScreen} options={{ title: 'Songs' }} />
      <LibraryStack.Screen name="Artists" component={ArtistsScreen} options={{ title: 'Artists' }} />
      <LibraryStack.Screen name="ArtistDetail" component={ArtistDetailScreen}
        options={({ route }: any) => ({ title: route.params.artist, headerLargeTitle: false })} />
      <LibraryStack.Screen name="Albums" component={AlbumsScreen} options={{ title: 'Albums' }} />
      <LibraryStack.Screen name="AlbumDetail" component={AlbumDetailScreen}
        options={{ title: '', headerLargeTitle: false }} />
      <LibraryStack.Screen name="Folders" component={FoldersScreen}
        options={{ title: 'Folders', headerLargeTitle: false }} />
      <LibraryStack.Screen name="Playlists" component={PlaylistsScreen} options={{ title: 'Playlists' }} />
      <LibraryStack.Screen name="PlaylistDetail" component={PlaylistDetailScreen}
        options={({ route }: any) => ({ title: route.params.name, headerLargeTitle: false })} />
      <LibraryStack.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Favorite Songs' }} />
    </LibraryStack.Navigator>
  );
}

const SearchStack = createNativeStackNavigator();
function SearchStackScreen() {
  return (
    <SearchStack.Navigator
      screenOptions={{ headerLargeTitle: true, headerTintColor: colors.accent, headerTitleStyle: { color: colors.label } }}>
      <SearchStack.Screen name="SearchHome" component={SearchScreen} options={{ title: 'Search' }} />
    </SearchStack.Navigator>
  );
}

const SettingsStack = createNativeStackNavigator();
function SettingsStackScreen() {
  return (
    <SettingsStack.Navigator
      screenOptions={{ headerLargeTitle: true, headerTintColor: colors.accent, headerTitleStyle: { color: colors.label } }}>
      <SettingsStack.Screen name="SettingsHome" component={SettingsScreen} options={{ title: 'Settings' }} />
    </SettingsStack.Navigator>
  );
}

const Tab = createBottomTabNavigator();
function Tabs() {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.secondaryLabel,
          tabBarStyle: { backgroundColor: colors.tabBarBg },
        }}>
        <Tab.Screen name="Library" component={LibraryStackScreen}
          options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>♫</Text> }} />
        <Tab.Screen name="Search" component={SearchStackScreen}
          options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🔍</Text> }} />
        <Tab.Screen name="Settings" component={SettingsStackScreen}
          options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>⚙︎</Text> }} />
      </Tab.Navigator>
      {/* Mini player floats above the tab bar */}
      <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: 84 }}>
        <MiniPlayer />
      </View>
    </View>
  );
}

const Root = createNativeStackNavigator();

export function RootNavigator() {
  const rootPath = useLibraryStore(s => s.rootPath);
  return (
    <NavigationContainer theme={theme}>
      <Root.Navigator screenOptions={{ headerShown: false }}>
        {rootPath == null ? (
          <Root.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <>
            <Root.Screen name="Tabs" component={Tabs} />
            <Root.Screen name="NowPlaying" component={NowPlayingScreen}
              options={{ presentation: 'modal' }} />
            <Root.Screen name="AddToPlaylist" component={AddToPlaylistScreen}
              options={{ presentation: 'modal', headerShown: true, title: 'Add to a Playlist' }} />
          </>
        )}
      </Root.Navigator>
    </NavigationContainer>
  );
}
