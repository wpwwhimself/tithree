import {app, BrowserWindow} from 'electron';
import './security-restrictions';
import {restoreOrCreateWindow} from '/@/mainWindow';
import {platform} from 'node:process';
import * as path from 'node:path';
import * as fs from 'fs';
import * as sqlite3 from 'sqlite3';

/**
 * Prevent electron from running multiple instances.
 */
const isSingleInstance = app.requestSingleInstanceLock();
if (!isSingleInstance) {
  app.quit();
  process.exit(0);
}
app.on('second-instance', restoreOrCreateWindow);

/**
 * Disable Hardware Acceleration to save more system resources.
 */
app.disableHardwareAcceleration();

/**
 * Shout down background process if all windows was closed
 */
app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit();
  }
});

/**
 * @see https://www.electronjs.org/docs/latest/api/app#event-activate-macos Event: 'activate'.
 */
app.on('activate', restoreOrCreateWindow);

/**
 * *CREATE DATABASE*
 * check the existence of sqlite database
 * and create one, if empty
 */
const dbPath = path.join(__dirname, "../../../database.db");

if(!fs.existsSync(dbPath)){
  fs.closeSync(fs.openSync(dbPath, 'w'));
}
/**
 * then populate the database with tables
 */
const db = new sqlite3.Database(dbPath);
const queries = [
  `CREATE TABLE IF NOT EXISTS students(
    id INTEGER PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT,
    price REAL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS sessions(
    id INTEGER PRIMARY KEY,
    student_id INTEGER NOT NULL,
    session_date TEXT DEFAULT CURRENT_DATE NOT NULL,
    duration REAL,
    price_override REAL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY(student_id) REFERENCES students(id)
  )`,
  `CREATE TABLE IF NOT EXISTS settings(
    name TEXT PRIMARY KEY,
    desc TEXT NOT NULL,
    value TEXT
  )`,
  `INSERT OR IGNORE INTO settings VALUES
    ("default_student_price", "Domyślna stawka [zł]", 50),
    ("default_session_duration", "Domyślna długość sesji [h]", 1)
  `,
];
db.serialize(() => {
  for(let query of queries){
    db.all(query, [], (err, rows) => {
      if(err){
        console.error(err);
        return;
      }
    });
  }
});
db.close();

/**
 * Create the application window when the background process is ready.
 */
app
  .whenReady()
  .then(restoreOrCreateWindow)
  .catch(e => console.error('Failed create window:', e));

/**
 * Install Vue.js or any other extension in development mode only.
 * Note: You must install `electron-devtools-installer` manually
 */
// if (import.meta.env.DEV) {
//   app
//     .whenReady()
//     .then(() => import('electron-devtools-installer'))
//     .then(module => {
//       const {default: installExtension, VUEJS3_DEVTOOLS} =
//         // @ts-expect-error Hotfix for https://github.com/cawa-93/vite-electron-builder/issues/915
//         typeof module.default === 'function' ? module : (module.default as typeof module);
//
//       return installExtension(VUEJS3_DEVTOOLS, {
//         loadExtensionOptions: {
//           allowFileAccess: true,
//         },
//       });
//     })
//     .catch(e => console.error('Failed install extension:', e));
// }

/**
 * Check for app updates, install it in background and notify user that new version was installed.
 * No reason run this in non-production build.
 * @see https://www.electron.build/auto-update.html#quick-setup-guide
 *
 * Note: It may throw "ENOENT: no such file app-update.yml"
 * if you compile production app without publishing it to distribution server.
 * Like `npm run compile` does. It's ok 😅
 */
if (import.meta.env.PROD) {
  app
    .whenReady()
    .then(() =>
      /**
       * Here we forced to use `require` since electron doesn't fully support dynamic import in asar archives
       * @see https://github.com/electron/electron/issues/38829
       * Potentially it may be fixed by this https://github.com/electron/electron/pull/37535
       */
      require('electron-updater').autoUpdater.checkForUpdatesAndNotify(),
    )
    .catch(e => console.error('Failed check and install updates:', e));
}
