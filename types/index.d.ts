export {};

export interface API{
  executeQuery(query: string, params?: any[]): Promise<any[]>;
  getSetting(name: string): Promise<any>;
}
export interface IipcRenderer{
  send: (channel: string, data?: any) => void;
  on: (channel: string, func: (...args: any[]) => void) => void;
}

declare global{
  interface Window{
    api: API;
    ipcRenderer: IipcRenderer;
  }
}
