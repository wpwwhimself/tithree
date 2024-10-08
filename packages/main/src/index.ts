import {app, BrowserWindow, ipcMain, ipcRenderer, protocol, session, shell} from 'electron';
import './security-restrictions';
import {restoreOrCreateWindow} from '/@/mainWindow';
import {platform} from 'node:process';
import * as path from 'node:path';
import * as fs from 'fs';
import * as sqlite3 from 'sqlite3';
import { calendar_v3, google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import * as http from "http";
import * as url from "url";
import moment from 'moment';

const setToast = (title: string, error = false, comment?: any) => {
  BrowserWindow.getAllWindows()[0].webContents.send("toast-pop", JSON.stringify({
    title: title,
    error: error,
    subtitle: comment,
  }))
}

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
    nickname TEXT UNIQUE,
    price REAL,
    phone TEXT,
    note TEXT,
    suspended INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS sessions(
    id INTEGER PRIMARY KEY,
    student_id INTEGER NOT NULL,
    session_date TEXT DEFAULT CURRENT_DATE NOT NULL,
    duration REAL,
    price REAL,
    price_factor_below_1 REAL,
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
    ("default_session_duration", "Domyślna długość sesji [h]", 1),
    ("price_factor_below_1", "Mnożnik stawki dla sesji poniżej 1 h", 1.0666667),
    ("student_inactive_days", "Powyżej ilu dni braku wpisów uczeń jest uznawany za nieaktywnego", 60),
    ("tally_from", "Od jakiego dnia mają być zliczane wartości w podliczeniach", "2020-01-01"),
    ("tally_to", "Do jakiego dnia mają być zliczane wartości w podliczeniach", "9999-12-31"),
    ("accent_color", "Kolor wiodący aplikacji", "256, 69%, 69%"),
    ("dark_mode", "Tryb ciemny", 0),
    ("google_calendar_name", "Nazwa kalendarza Google do integracji", ""),
    ("google_drive_db_backup_folder", "Nazwa folderu do kopii bazy danych na Dysku Google", "Tithree_baza_danych")
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
ipcMain.on("reveal-database", (ev) => {
  shell.showItemInFolder(dbPath);
})

/**
 * Create the application window when the background process is ready.
 */
app
  .whenReady()
  .then(restoreOrCreateWindow)
  .catch(e => console.error('Failed create window:', e));

ipcMain.on("set-window-color", (ev, color) => {
  BrowserWindow.getAllWindows()[0].setTitleBarOverlay({
    color: `hsl(${color})`,
    symbolColor: "white",
    height: 30,
  })
})
ipcMain.on("app-restart", () => {
  app.relaunch();
  app.exit();
})

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

ipcMain.on("open-external", (ev, link) => {
  shell.openExternal(link);
})

/**
 * google auth
 */
const CALLBACK_PORT = 9876;
const REDIRECT_URI = `http://localhost:${CALLBACK_PORT}/google-auth`;
const SCOPES = ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/drive.file'];
const TOKEN_PATH = "TOKEN.json";

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 */
interface Authorize {
  (
    client_id: string,
    client_secret: string,
    redirect_uri: string,
    callback: (...args: any[]) => any,
  ): any
}
const authorize: Authorize = function(client_id, client_secret, redirect_uri, callback){
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uri
  );

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) return getNewToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token.toString()));
      callback(oAuth2Client);
  });
}

/**
* Get and store new token after prompting for user authorization, and then
* execute the given callback with the authorized OAuth2 client.
*/
interface GetNewToken{
  (
    oAuth2Client: OAuth2Client,
    callback: (...args: any[]) => any,
  ): any
}
const getNewToken: GetNewToken = function (oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
  });

  // Create auth prompt
  let win = createAuthPrompt(authUrl);

  // Create a temp server for receiving the authentication approval request
  const server = http.createServer(function (req, res) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end("Mamy to. Token zapisany, Zamknij to okno.");

      var q = url.parse(req.url!, true).query;
      const code = q.code as string;
      if(!code) return;

      oAuth2Client.getToken(code, (err, token) => {
          if (err) return console.error('Error while trying to retrieve access token', err);
          oAuth2Client.setCredentials(token!);

          // Store the token to disk for later program executions
          fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
              if (err) return console.error(err);
              console.log('Token stored to', TOKEN_PATH);
          });

          // Close the auth window (if it was an electron window) and stop the server
          // if(win) win.close();
          server.close( err => {
              if(err) return console.log(err)
              console.log("Server closed")
          });

          callback(oAuth2Client);
      });
  });
  server.listen(CALLBACK_PORT);
}

function createAuthPrompt(authUrl: string) {
  shell.openExternal(authUrl);
}

ipcMain.on("calendar-events", (event, data) => {
  const {cal_name, mode} = data;

  const events = (auth: OAuth2Client) => {
    const calendar = google.calendar({ version: 'v3', auth });

    calendar.calendarList.list()
      .then((res) => res?.data.items?.find((cal => cal.summary === cal_name))?.id)
      .then((cal_id) => {
        const today = new Date(); today.setHours(0,0,0,0);
        const last_month = new Date(); last_month.setDate(last_month.getDate() - 30); last_month.setHours(0,0,0,0);
        const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setHours(0,0,0,0);
        const next_month = new Date(); next_month.setMonth(next_month.getMonth() + 1); next_month.setHours(0,0,0,0);

        return calendar.events.list({
          calendarId: cal_id ?? undefined,
          singleEvents: true,
          timeMin: last_month.toISOString(),
          timeMax: (mode === "all") ? next_month.toISOString() : tomorrow.toISOString(),
        })
      })
      // .then(res => {
        // res.data.items?.forEach(el => console.log(el.start?.dateTime));
      //   return res;
      // })
      .then(res => {
        const events = res.data.items?.sort((a, b) => {
          const dateA = new Date(a.start?.dateTime || a.start?.date || '');
          const dateB = new Date(b.start?.dateTime || b.start?.date || '');
          return dateA.getTime() - dateB.getTime();
        });
        BrowserWindow.getAllWindows()[0].webContents.send(
          "calendar-events-response",
          events
        )
      })
      .catch((err) => {
        setToast("Nie udało się uruchomić kalendarza", true, err.message);
        if(err.code == 400 || err.code == 401){
          fs.unlink(TOKEN_PATH, (err) => {
            if(err){
              setToast("Nie udało się wyczyścić tokena Google", true, err.message)
              console.error("Could not remove token...");
            }
          });
          app.exit();
        }
      });
  }

  authorize(
    import.meta.env.VITE_GOOGLE_API_CLIENT_ID,
    import.meta.env.VITE_GOOGLE_API_CLIENT_SECRET,
    REDIRECT_URI,
    events
  );
})
ipcMain.on("calendar-new-event", (ev, data) => {
  const {cal_name, event} = data;

  const callback = (auth: OAuth2Client) => {
    const calendar = google.calendar({ version: 'v3', auth });

    calendar.calendarList.list()
      .then((res) => res?.data.items?.find((cal => cal.summary === cal_name))?.id)
      .then((cal_id) => calendar.events.insert({
        calendarId: cal_id ?? undefined,
        requestBody: event,
      }))
      .then(res => BrowserWindow.getAllWindows()[0].webContents.send(
        "calendar-event-new-response",
        res.status
      ))
      .catch((err) => console.error(`Event creation error: ${err}`));
  }

  authorize(
    import.meta.env.VITE_GOOGLE_API_CLIENT_ID,
    import.meta.env.VITE_GOOGLE_API_CLIENT_SECRET,
    REDIRECT_URI,
    callback
  );
})
ipcMain.on("calendar-delete-event", (ev, data) => {
  const {cal_name, eventId} = data;

  const callback = (auth: OAuth2Client) => {
    const calendar = google.calendar({ version: 'v3', auth });

    calendar.calendarList.list()
      .then((res) => res?.data.items?.find((cal => cal.summary === cal_name))?.id)
      .then((cal_id) => calendar.events.delete({
        calendarId: cal_id ?? undefined,
        eventId: eventId,
      }))
      .then(res => {
        console.log(res.status);
        BrowserWindow.getAllWindows()[0].webContents.send(
        "calendar-event-delete-response",
        res.status
      )})
      .catch((err) => console.error(`Event deletion error: ${err}`));
  }

  authorize(
    import.meta.env.VITE_GOOGLE_API_CLIENT_ID,
    import.meta.env.VITE_GOOGLE_API_CLIENT_SECRET,
    REDIRECT_URI,
    callback
  );
})

ipcMain.on("dbsync-get-data", (ev, data) => {
  const {folder, callFrom = "anywhere"} = data;

  const driveData = (auth: OAuth2Client) => {
    const drive = google.drive({ version: 'v3', auth });

    drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name = '${folder}' and trashed = false`,
      fields: 'files(id, name)',
    }).then(res => {
      const folders = res.data.files;
      if(folders?.length) return folders[0].id;
      else throw new Error("DB folder does not exist");
    }).then(folderId => drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: "files(id, name, modifiedTime, parents)",
        orderBy: `modifiedTime desc`,
      }).then(res => res.data.files)
    ).then(files => {
      BrowserWindow.getAllWindows()[0].webContents.send(`dbsync-get-data-response${callFrom == "App" ? "-app" : ""}`, files)
    }).catch((err) => {
      setToast("Nie udało się sprawdzić Dysku", true, err.message);
    });
  }

  authorize(
    import.meta.env.VITE_GOOGLE_API_CLIENT_ID,
    import.meta.env.VITE_GOOGLE_API_CLIENT_SECRET,
    REDIRECT_URI,
    driveData
  );
})

ipcMain.on("dbsync-dump", (ev, data) => {
  const {folder} = data;

  const driveData = (auth: OAuth2Client) => {
    const drive = google.drive({ version: 'v3', auth });

    // find or create folder
    drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name = '${folder}' and trashed = false`,
      fields: 'files(id, name)',
    }).then(res => {
      const folders = res.data.files;
      if(folders?.length) return folders[0].id;
      else return drive.files.create({
        requestBody: {
          name: folder,
          mimeType: "application/vnd.google-apps.folder",
        },
        fields: 'id'
      }).then(res => res.data.id)
    }).then(folderId => {
      // upload file
      const dbfile = fs.createReadStream(dbPath);
      return drive.files.create({
        fields: `id`,
        media: { body: dbfile },
        requestBody: {
          name: `database_${moment().format("YYYYMMDD_HHmmss")}.db`,
          parents: [folderId as string],
        },
      }).then(res => res.data.id)
    }).then(fileid => {
      setToast("Kopia bazy danych gotowa")
      BrowserWindow.getAllWindows()[0].webContents.send("dbsync-dump-response", fileid)
    }).catch((err) => {
      setToast("Nie udało się wgrać bazy na Dysk", true, err.message)
    });
  }

  authorize(
    import.meta.env.VITE_GOOGLE_API_CLIENT_ID,
    import.meta.env.VITE_GOOGLE_API_CLIENT_SECRET,
    REDIRECT_URI,
    driveData
  );
})

ipcMain.on("dbsync-cleanup", (ev, data) => {
  const {folder} = data;

  const driveData = (auth: OAuth2Client) => {
    const drive = google.drive({ version: 'v3', auth });

    // find folder
    drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name = '${folder}' and trashed = false`,
      fields: 'files(id, name)',
    }).then(res => {
      const folders = res.data.files;
      if(folders?.length) return folders[0].id;
    }).then(folderId => drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: "files(id, name, modifiedTime)",
        orderBy: `modifiedTime desc`,
      }).then(res => res.data.files)
    ).then(files => {
      let counter = 0;
      files?.forEach(file => {
        counter++;
        if(counter > 5) drive.files.delete({
          fileId: file.id ?? "",
        }).catch(err => {throw new Error(`Nie udało się usunąć pliku ${file.name}: ${err.message}`)})
      })
    }).then(res => {
      console.log("Katalog backupowy oczyszczony")
    }).catch((err) => {
      setToast("Nie udało się wyczyścić Dysku", true, err.message);
    });
  }

  authorize(
    import.meta.env.VITE_GOOGLE_API_CLIENT_ID,
    import.meta.env.VITE_GOOGLE_API_CLIENT_SECRET,
    REDIRECT_URI,
    driveData
  );
})

ipcMain.on("dbsync-restore", (ev, data) => {
  const {folder} = data;

  const driveData = (auth: OAuth2Client) => {
    const drive = google.drive({ version: 'v3', auth });

    drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name = '${folder}' and trashed = false`,
      fields: 'files(id, name)',
    })
      .then(res => {
        const folders = res.data.files;
        if(folders?.length){
          return folders[0].id
        }else{
          throw new Error("DB folder does not exist");
        }
      })
      .then(folderId => {
        drive.files.list({
          q: `name starts with 'database' and '${folderId}' in parents and trashed = false`,
          fields: `files(id, name, modifiedTime)`,
          orderBy: `modifiedTime desc`,
        }).then(res => {
          if(res.data.files?.length) return drive.files.get(
              { fileId: res.data.files[0].id ?? "", alt: "media"},
              { responseType: "stream" },
              (err, res) => {
                if(err) throw new Error(`Error downloading file: ${err}`);
                else{
                  const dest = fs.createWriteStream(dbPath);
                  res?.data
                    .on("end", () => {
                      BrowserWindow.getAllWindows()[0].webContents.send("dbsync-restore-restart")
                    })
                    .on("error", (err) => {throw new Error(`Error writing file: ${err}`)})
                    .pipe(dest);
                }
              }
          )
        })
      })
      .then(res => {
        BrowserWindow.getAllWindows()[0].webContents.send(
          "dbsync-restore-response",
          res
        )
      })
      .catch((err) => {
        setToast("Nie udało się pobrać bazy z Dysku", true, err.message)
      });
  }

  authorize(
    import.meta.env.VITE_GOOGLE_API_CLIENT_ID,
    import.meta.env.VITE_GOOGLE_API_CLIENT_SECRET,
    REDIRECT_URI,
    driveData
  );
})
