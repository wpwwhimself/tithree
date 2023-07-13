/**
 * @module preload
 */

import { app, contextBridge } from "electron";
import * as sqlite3 from 'sqlite3';
import * as path from "path";

// connect to sqlite
const dbPath = path.join(__dirname, "../../../database.db")

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
  }
});
