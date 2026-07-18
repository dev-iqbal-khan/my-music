import React from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Slider from '@react-native-community/slider';
import TrackPlayer, {
  RepeatMode, State, useActiveTrack, usePlaybackState, useProgress,
} from 'react-native-track-player';
import { colors } from '../theme/colors';
import { type } from '../theme/typography';
import { ArtworkImage } from '../components/ArtworkImage';
import { toggleShuffle, cycleRepeatMode } from '../services/player';
import { usePlayerStore } from '../store/playerStore';
import { toggleFavorite, getSong } from '../database/queries';
import { useLibraryStore } from '../store/libraryStore';

function fmt(sec: number): string {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export function NowPlayingScreen() {
  const track = useActiveTrack();
  const playback = usePlaybackState();
  const { position, duration } = useProgress(500);
  const { width } = useWindowDimensions();
  const shuffle = usePlayerStore(s => s.shuffle);
  const repeatMode = usePlayerStore(s => s.repeatMode);
  const bump = useLibraryStore(s => s.bumpLibraryVersion);
  const version = useLibraryStore(s => s.libraryVersion);

  const playing = playback.state === State.Playing;
  const artSize = width - 48;
  const artworkPath = typeof track?.artwork === 'string' ? decodeURI(track.artwork.replace('file://', '')) : null;
  const song = track?.id ? getSong(String(track.id)) : undefined;
  const isFav = song?.isFavorite === 1;

  if (!track) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <Text style={type.subhead}>Nothing is playing.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.grabber} />
      <ArtworkImage path={artworkPath} size={artSize} radius={12} style={styles.art} />

      <View style={styles.titleRow}>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={styles.title}>{track.title}</Text>
          <Text numberOfLines={1} style={styles.artist}>{track.artist}</Text>
        </View>
        <Pressable hitSlop={10} onPress={() => { if (song) { toggleFavorite(song.id); bump(); } }}>
          <Text style={[styles.fav, isFav && { color: colors.accent }]}>{isFav ? '♥' : '♡'}</Text>
        </Pressable>
      </View>

      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={duration || 1}
        value={position}
        minimumTrackTintColor={colors.secondaryLabel}
        maximumTrackTintColor={colors.artworkPlaceholder}
        thumbTintColor={colors.secondaryLabel}
        onSlidingComplete={v => TrackPlayer.seekTo(v)}
      />
      <View style={styles.timeRow}>
        <Text style={type.caption}>{fmt(position)}</Text>
        <Text style={type.caption}>-{fmt(Math.max(0, (duration || 0) - position))}</Text>
      </View>

      <View style={styles.controls}>
        <Pressable hitSlop={12} onPress={() => TrackPlayer.skipToPrevious()}>
          <Text style={styles.skip}>⏮</Text>
        </Pressable>
        <Pressable hitSlop={12} onPress={() => (playing ? TrackPlayer.pause() : TrackPlayer.play())}>
          <Text style={styles.play}>{playing ? '⏸' : '▶'}</Text>
        </Pressable>
        <Pressable hitSlop={12} onPress={() => TrackPlayer.skipToNext()}>
          <Text style={styles.skip}>⏭</Text>
        </Pressable>
      </View>

      <View style={styles.modeRow}>
        <Pressable hitSlop={10} onPress={() => toggleShuffle()}>
          <Text style={[styles.mode, shuffle && { color: colors.accent }]}>⤨ Shuffle</Text>
        </Pressable>
        <Pressable hitSlop={10} onPress={() => cycleRepeatMode()}>
          <Text style={[styles.mode, repeatMode !== RepeatMode.Off && { color: colors.accent }]}>
            {repeatMode === RepeatMode.Track ? '🔂 Repeat One' : '🔁 Repeat'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', paddingHorizontal: 24 },
  grabber: { width: 36, height: 5, borderRadius: 3, backgroundColor: colors.artworkPlaceholder, marginTop: 10 },
  art: { marginTop: 24, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
  titleRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', marginTop: 28, gap: 12 },
  title: { fontSize: 20, fontWeight: '600', color: colors.label },
  artist: { fontSize: 18, color: colors.accent, marginTop: 2 },
  fav: { fontSize: 26, color: colors.secondaryLabel },
  slider: { alignSelf: 'stretch', marginTop: 16 },
  timeRow: { alignSelf: 'stretch', flexDirection: 'row', justifyContent: 'space-between' },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 48, marginTop: 24 },
  skip: { fontSize: 34, color: colors.label },
  play: { fontSize: 44, color: colors.label },
  modeRow: { flexDirection: 'row', gap: 40, marginTop: 32 },
  mode: { fontSize: 15, fontWeight: '600', color: colors.secondaryLabel },
});
