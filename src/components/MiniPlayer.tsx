import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import TrackPlayer, { State, useActiveTrack, usePlaybackState } from 'react-native-track-player';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { type } from '../theme/typography';
import { ArtworkImage } from './ArtworkImage';

/** Floating bar above the tab bar, exactly like Apple Music. */
export function MiniPlayer() {
  const track = useActiveTrack();
  const playback = usePlaybackState();
  const navigation = useNavigation<any>();

  if (!track) return null;
  const playing = playback.state === State.Playing;

  const artworkPath = typeof track.artwork === 'string'
    ? track.artwork.replace('file://', '')
    : null;

  return (
    <Pressable style={styles.bar} onPress={() => navigation.navigate('NowPlaying')}>
      <ArtworkImage path={artworkPath ? decodeURI(artworkPath) : null} size={40} radius={4} />
      <Text numberOfLines={1} style={[type.body, styles.title]}>{track.title}</Text>
      <Pressable hitSlop={10} onPress={() => (playing ? TrackPlayer.pause() : TrackPlayer.play())}>
        <Text style={styles.control}>{playing ? '❚❚' : '▶'}</Text>
      </Pressable>
      <Pressable hitSlop={10} onPress={() => TrackPlayer.skipToNext()}>
        <Text style={styles.control}>»</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute', left: 8, right: 8, bottom: 0,
    height: 56, borderRadius: 12,
    backgroundColor: colors.miniPlayerBg,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, gap: 10,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
  },
  title: { flex: 1, fontWeight: '500' },
  control: { fontSize: 20, color: colors.label, paddingHorizontal: 8 },
});
