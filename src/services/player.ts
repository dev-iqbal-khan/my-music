import TrackPlayer, {
  AppKilledPlaybackBehavior, Capability, RepeatMode,
} from 'react-native-track-player';
import { Song } from '../database/queries';
import { usePlayerStore } from '../store/playerStore';

let isSetup = false;

export async function setupPlayer(): Promise<void> {
  if (isSetup) return;
  try {
    await TrackPlayer.setupPlayer({ autoHandleInterruptions: true });
  } catch (e: any) {
    // "player already initialized" — safe to ignore
  }
  await TrackPlayer.updateOptions({
    android: { appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback },
    capabilities: [
      Capability.Play, Capability.Pause, Capability.SkipToNext,
      Capability.SkipToPrevious, Capability.SeekTo,
    ],
    compactCapabilities: [Capability.Play, Capability.Pause, Capability.SkipToNext],
    progressUpdateEventInterval: 1,
  });
  isSetup = true;
}

function toTrack(s: Song) {
  return {
    id: s.id,
    url: 'file://' + encodeURI(s.path).replace(/#/g, '%23').replace(/\?/g, '%3F'),
    title: s.title,
    artist: s.artist,
    album: s.album,
    duration: s.duration || undefined,
    artwork: s.artworkPath ? 'file://' + encodeURI(s.artworkPath) : undefined,
  };
}

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Play `songs` starting at index. Respects current shuffle setting. */
export async function playQueue(songs: Song[], startIndex = 0): Promise<void> {
  if (songs.length === 0) return;
  const store = usePlayerStore.getState();
  let queue = songs;
  let index = startIndex;

  if (store.shuffle) {
    const first = songs[startIndex];
    const rest = shuffled(songs.filter((_, i) => i !== startIndex));
    queue = [first, ...rest];
    index = 0;
  }

  store.setQueue(queue, songs);
  await TrackPlayer.reset();
  await TrackPlayer.add(queue.map(toTrack));
  await TrackPlayer.skip(index);
  await TrackPlayer.play();
}

export async function playNext(song: Song): Promise<void> {
  const active = await TrackPlayer.getActiveTrackIndex();
  const insertAt = active == null ? 0 : active + 1;
  await TrackPlayer.add([toTrack(song)], insertAt);
  usePlayerStore.getState().insertIntoQueue(song, insertAt);
}

export async function addToQueueEnd(song: Song): Promise<void> {
  await TrackPlayer.add([toTrack(song)]);
  usePlayerStore.getState().appendToQueue(song);
}

export async function toggleShuffle(): Promise<void> {
  const store = usePlayerStore.getState();
  const next = !store.shuffle;
  store.setShuffle(next);

  // Reshuffle / restore the remainder of the queue live
  const activeIndex = await TrackPlayer.getActiveTrackIndex();
  if (activeIndex == null) return;
  const queue = store.queue;
  const current = queue[activeIndex];
  if (!current) return;

  let remainder: Song[];
  if (next) {
    remainder = shuffled(queue.slice(activeIndex + 1));
  } else {
    const original = store.originalQueue;
    const pos = original.findIndex(s => s.id === current.id);
    remainder = pos >= 0 ? original.slice(pos + 1) : queue.slice(activeIndex + 1);
  }
  await TrackPlayer.removeUpcomingTracks();
  await TrackPlayer.add(remainder.map(toTrack));
  store.setQueue([...queue.slice(0, activeIndex + 1), ...remainder], store.originalQueue);
}

export async function cycleRepeatMode(): Promise<RepeatMode> {
  const current = await TrackPlayer.getRepeatMode();
  const next = current === RepeatMode.Off ? RepeatMode.Queue
    : current === RepeatMode.Queue ? RepeatMode.Track
    : RepeatMode.Off;
  await TrackPlayer.setRepeatMode(next);
  usePlayerStore.getState().setRepeatMode(next);
  return next;
}
