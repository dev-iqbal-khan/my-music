import { NativeModules } from 'react-native';

export interface FileMetadata {
  title: string | null;
  artist: string | null;
  album: string | null;
  genre: string | null;
  duration: number; // seconds
  artworkPath: string | null;
}

interface MetadataReaderModule {
  read(path: string, artworkDir: string): Promise<FileMetadata>;
}

export const MetadataReader: MetadataReaderModule = NativeModules.MetadataReader;
