<script lang="ts" setup>
import NavBar from "./components/NavBar.vue";
import Footer from "./components/Footer.vue";
import {ref, onBeforeMount, onMounted} from "vue";
import { useRoute } from "vue-router";
import Toast from "./components/Toast.vue";
import { ToastData } from "types";
import { setErrorToast, setToast } from "./toastManager";
import moment from "moment";

const route = useRoute();
const APP_NAME = import.meta.env.VITE_APP_NAME;
const page_names = {
  About: "O aplikacji",
  Sessions: "Sesje",
  SessionsMod: "Edycja sesji",
  Students: "Uczniowie",
  StudentsMod: "Edycja ucznia",
  Tally: "Podliczanie",
  TallyStudents: "Podliczanie po uczniach",
  TallyStudentDetails: "Podliczanie po uczniu",
  TallyPeriods: "Podliczanie po okresach",
  Settings: "Ustawienia",
  BulkPriceChange: "Zmiana stawki",
  Calendar: "Kalendarz",
  EventMod: "Edycja zdarzenia",
  TimeGrid: "Obecność",
  ActionSummary: "Gotowe!",
};

const dbfolder = ref("");
const accent_color = ref("10, 50%, 50%");
const theme = ref("light");

onBeforeMount(async () => {
  let data = await window.api.getSetting("accent_color");
  accent_color.value = data.value;
  window.ipcRenderer.send("set-window-color", data.value);

  data = await window.api.getSetting("dark_mode");
  theme.value = !!(+data.value) ? "dark" : "light";
})

/**
 * BACKUP
 */
onMounted(async () => {
  window.api.getSetting("google_drive_db_backup_folder")
    .then(folder => {
      dbfolder.value = folder.value;
      window.ipcRenderer.send("dbsync-get-data", { folder: dbfolder.value, callFrom: "App" })
    }).catch(err => {
      setErrorToast("Błąd wczytywania informacji o kopii zapasowej", err)
    })
})
window.ipcRenderer.on("dbsync-get-data-response-app", backups => {
  if(backups.length == 0 || !moment(backups[0].modifiedTime).isSame(moment(), "day")){
    window.ipcRenderer.send("dbsync-dump", { folder: dbfolder.value });
  }
  window.ipcRenderer.send("dbsync-cleanup", { folder: dbfolder.value });
})

window.ipcRenderer.on("toast-pop", (data) => {
  const toast: ToastData = JSON.parse(data)
  if(toast.error) setErrorToast(toast.title, toast.subtitle);
  else setToast(toast.title, false, undefined, toast.subtitle);
})
</script>

<template>
  <div id="app-container" :data-theme="theme">
    <div id="dragger">
      <span v-if="route.name == 'Home'" class="script">{{ APP_NAME }}</span>
      <template v-else>
        <span>{{ page_names[route.name as keyof typeof page_names] }}</span>
        <small class="ghost script">{{ APP_NAME }}</small>
      </template>
    </div>
    <div id="split" class="flex-right">
      <Toast />
      <NavBar />
      <div id="wrapper">
        <router-view />
      </div>
    </div>
    <Footer />
  </div>
</template>

<style>
#app-container{
  --acc: v-bind(accent_color);
  overflow: hidden;
}
#wrapper{
  margin: 0 auto;
  overflow: auto;
  padding: 1em;
  width: calc(100% - 16em);
  max-height: calc(100vh - 6em);
}
#dragger{
  --dragger-height: 30px;
  -webkit-app-region: drag;
  height: var(--dragger-height);
  font-size: calc(var(--dragger-height) - 0.5em);
  background-color: hsl(var(--acc));
  color: white;
  padding: 0 2em;
  align-items: flex-end;
  z-index: 999;
}
#dragger small{
  margin-left: 1em;
}
#split{
  flex-wrap: nowrap;
  flex: 1 0 auto;
}
</style>
