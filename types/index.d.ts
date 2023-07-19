export {};

export interface API{
  executeQuery(query: string, params?: any[]): Promise<any[]>;
}

declare global{
  interface Window{
    api: API;
  }
}
