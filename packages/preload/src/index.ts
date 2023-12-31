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
    let validChannels = [
      "set-window-color",
      "app-restart",
      "open-external",
      'calendar-events',
      "calendar-new-event",
      "calendar-delete-event",
      "reveal-database",
      "dbsync-get-data",
      "dbsync-dump",
      "dbsync-cleanup",
      "dbsync-restore",
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data)
    }
  },
  on: (channel: string, func: (...args: any[]) => void) => {
    let validChannels = [
      'google-auth-token',
      'calendar-events-response',
      "calendar-event-new-response",
      "calendar-event-delete-response",
      "dbsync-get-data-response",
      "dbsync-get-data-response-app",
      "dbsync-dump-response",
      "dbsync-cleanup-response",
      "dbsync-restore-response",
      "dbsync-restore-restart",
      "toast-pop",
    ]
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
