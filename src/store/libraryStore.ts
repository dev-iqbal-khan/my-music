import { create } from 'zustand';

interface LibraryState {
  rootPath: string | null;
  scanning: boolean;
  scanProcessed: number;
  scanTotal: number;
  libraryVersion: number; // bump to make screens re-query the DB
  setRootPath: (p: string | null) => void;
  setScanning: (scanning: boolean, processed: number, total: number) => void;
  bumpLibraryVersion: () => void;
}

export const useLibraryStore = create<LibraryState>(set => ({
  rootPath: null,
  scanning: false,
  scanProcessed: 0,
  scanTotal: 0,
  libraryVersion: 0,
  setRootPath: p => set({ rootPath: p }),
  setScanning: (scanning, scanProcessed, scanTotal) => set({ scanning, scanProcessed, scanTotal }),
  bumpLibraryVersion: () => set(s => ({ libraryVersion: s.libraryVersion + 1 })),
}));
