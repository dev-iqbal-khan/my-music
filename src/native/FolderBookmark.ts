import { NativeModules } from 'react-native';

type PickResult = { path: string; accessGranted: boolean };

interface FolderBookmarkModule {
  pickFolder(): Promise<PickResult>;
  restoreAccess(): Promise<string | null>;
  hasFolder(): Promise<boolean>;
  clearFolder(): Promise<boolean>;
  deleteFile(path: string): Promise<boolean>;
}

export const FolderBookmark: FolderBookmarkModule = NativeModules.FolderBookmark;
