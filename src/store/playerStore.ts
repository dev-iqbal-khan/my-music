import { create } from 'zustand';
import { RepeatMode } from 'react-native-track-player';
import { Song } from '../database/queries';

interface PlayerState {
  queue: Song[];          // as currently playing (may be shuffled)
  originalQueue: Song[];  // in original order
  shuffle: boolean;
  repeatMode: RepeatMode;
  setQueue: (queue: Song[], original: Song[]) => void;
  insertIntoQueue: (song: Song, index: number) => void;
  appendToQueue: (song: Song) => void;
  setShuffle: (v: boolean) => void;
  setRepeatMode: (m: RepeatMode) => void;
}

export const usePlayerStore = create<PlayerState>(set => ({
  queue: [],
  originalQueue: [],
  shuffle: false,
  repeatMode: RepeatMode.Off,
  setQueue: (queue, original) => set({ queue, originalQueue: original }),
  insertIntoQueue: (song, index) => set(s => {
    const q = [...s.queue];
    q.splice(index, 0, song);
    return { queue: q };
  }),
  appendToQueue: song => set(s => ({ queue: [...s.queue, song] })),
  setShuffle: v => set({ shuffle: v }),
  setRepeatMode: m => set({ repeatMode: m }),
}));
