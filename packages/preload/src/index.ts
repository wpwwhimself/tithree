/**
 * @module preload
 */

import { app, contextBridge, ipcRenderer } from "electron";
import * as sqlite3 from 'sqlite3';
import * as path from "path";

// connect to sqlite
const dbPath = path.join(__dirname, "../../../database.db")

contextBridge.exposeInMainWorld("ipcRenderer", {
  send: (channel: string, data: any = undefined) => {
    // whitelist channels
    let validChannels = ['calendar-events']
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data)
    }
  },
  on: (channel: string, func: (...args: any[]) => void) => {
    let validChannels = ['google-auth-token']
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (event, ...args) => func(...args))
    }
  },
})

contextBridge.exposeInMainWorld('api', {
  executeQuery: async (query: string, params = []): Promise<any[]> => {
    try{
      const db = new sqlite3.Database(dbPath);

      return new Promise((resolve, reject) => {
        db.all(query, params, (error: Error | null, rows: any[]) => {
          db.close((closeError: Error | null) => {
            if(error){
              reject(error);
            }else if(closeError){
              reject(closeError);
            }else{
              resolve(rows);
            }
          });
        });
      });
    }catch(err){
      throw err;
    }
  },
  getSetting: async (name: string): Promise<any> => {
    try{
      const db = new sqlite3.Database(dbPath);

      return new Promise((resolve, reject) => {
        db.get(
          `SELECT value FROM settings WHERE name = ?`,
          [name],
          (error: Error | null, rows: any[]) => {
            db.close((closeError: Error | null) => {
              if(error){
                reject(error);
              }else if(closeError){
                reject(closeError);
              }else{
                resolve(rows);
              }
            });
          }
        );
      });
    }catch(err){
      throw err;
    }
  }
});
