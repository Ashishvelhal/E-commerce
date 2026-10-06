export interface IElectronAPI {
  platform: string;
  version: string;
  isDesktop: boolean;
  minimize: () => void;
  maximize: () => void;
  close: () => void;
}

declare global {
  interface Window {
    electronAPI?: IElectronAPI;
  }
}
