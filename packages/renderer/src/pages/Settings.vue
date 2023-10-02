<script setup lang="ts">
import { ref, onMounted, DefineComponent } from "vue";
import PageHeader from "../components/PageHeader.vue";
import Input from "../components/Input.vue";
import Button from "../components/Button.vue";
import { Setting } from "../../types";
import moment, { Moment } from "moment";
import Loader from "../components/Loader.vue";
import { useRouter } from "vue-router";
import { setErrorToast, setToast } from "../toastManager";
import JumpButton from "../components/JumpButton.vue";
import SuccessDialog from "../components/SuccessDialog.vue";
import { createConfirmDialog } from "vuejs-confirm-dialog";

const settings = ref({} as Setting[]);
const dbSyncLastMod = ref<Moment | null | undefined>(undefined);
const dbDriveLink = ref("");
const showLoader = ref(false);

const getDbSyncLastMod = () => {
  window.ipcRenderer.send("dbsync-get-data", {
    folder: settings.value.find(el => el.name === "google_drive_db_backup_folder")?.value,
  })
}

onMounted(async () => {
  try{
    const data = await window.api.executeQuery(
      `SELECT * FROM settings`
    );
    settings.value = data;
  }catch(err){
    setErrorToast("Błąd wczytywania ustawień", err)
  }

  // dbSync
  try{
    getDbSyncLastMod();
  }catch(err){
    setErrorToast("Błąd wczytywania informacji o kopii zapasowej", err)
  }
});

const updateSetting = async (name: string, val: string) => {
  try{
    await window.api.executeQuery(
      `UPDATE settings SET value = ? WHERE name = ?`,
      [val, name]
    );
    setToast("Zapisano", false, undefined, `${name} zmieniono na ${val}`);
  }catch(err){
    setErrorToast("Błąd zapisu ustawień", err)
  }
};

const openDbFolder = () => { window.ipcRenderer.send("reveal-database") };
const openDriveLink = () => { window.ipcRenderer.send("open-external", dbDriveLink.value )}
const dbSyncDump = () => {
  showLoader.value = true;
  window.ipcRenderer.send("dbsync-dump", { folder: settings.value.find(el => el.name === "google_drive_db_backup_folder")?.value })
};
const dbSyncRestore = () => {
  showLoader.value = true;
  window.ipcRenderer.send("dbsync-restore", { folder: settings.value.find(el => el.name === "google_drive_db_backup_folder")?.value })
};

window.ipcRenderer.on("dbsync-get-data-response", (data) => {
  dbSyncLastMod.value = (data.length) ? moment(data[0].modifiedTime) : null;
  dbDriveLink.value = (data.length) ? `https://drive.google.com/drive/u/0/folders/${data[0].parents[0]}` : "";
})
window.ipcRenderer.on("dbsync-dump-response", (data) => {
  setToast("Kopiowanie bazy na Dysk rozpoczęte", false, undefined, "Wkrótce Twoje dane pojawią się w chmurze")
  showLoader.value = false;
  getDbSyncLastMod();
  window.ipcRenderer.send("dbsync-cleanup", { folder: settings.value.find(el => el.name === "google_drive_db_backup_folder")?.value })
})
window.ipcRenderer.on("dbsync-restore-response", (data) => {
  setToast("Zgrywanie bazy z Dysku rozpoczęte", false, undefined, "Wkrótce Twoja baza będzie przywrócona")
  showLoader.value = false;
})

const dialog = createConfirmDialog(SuccessDialog as DefineComponent<any, any, any, any, any, any, any, any>);
window.ipcRenderer.on("dbsync-restore-restart", async () => {
  const { isCanceled } = await dialog.reveal({
    text: "Baza danych została pomyślnie pobrana",
    subtext: "Musisz zrestartować aplikację. Chcesz zrobić to teraz?"
  });
  if(isCanceled) return;
  window.ipcRenderer.send("app-restart");
})

// bulk operations
interface BOper{
  label: string,
  icon: string,
  pageName: string,
}
const bulkOperations: BOper[] = [
  {
    label: "Zmiana stawki",
    icon: "copy",
    pageName: "BulkPriceChange",
  },
]
</script>

<template>
  <Loader mode="saving" v-if="showLoader" />
  <template v-else>

  <PageHeader title="Ustawienia"></PageHeader>

  <p class="ghost">
    Aby zmienić ustawienie, po prostu wpisz wartość – zmiany zostaną zapisane od razu.<br>
    <b>* Po zmianie tego parametru wymagany jest restart aplikacji!</b>
  </p>

  <form v-if="settings">
    <template v-for="setting in settings" :key="setting.name">
      <Input v-if="setting.name == 'accent_color'"
        type="color"
        :label="setting.desc + '*'" :value="$colorConvert(setting.value, 'hsl-hex')"
        :name="setting.name"
        @change="(event) => updateSetting(setting.name, $colorConvert(event.target.value, 'hex-hsl'))"
        />
      <Input v-else-if="setting.name == 'dark_mode'"
        type="checkbox"
        :label="setting.desc + '*'" :checked="+setting.value"
        :name="setting.name"
        @change="(event) => updateSetting(setting.name, (+event.target.checked).toString())"
        />
      <Input v-else
        :type="(['tally_from', 'tally_to'].includes(setting.name) ? 'date' : 'text')"
        :label="setting.desc" :value="setting.value"
        :name="setting.name"
        @change="(event) => updateSetting(setting.name, event.target.value)"
        />
    </template>
  </form>
  <h2 v-else>Wczytywanie...</h2>

  <h1>Baza danych</h1>
  <p class="ghost">
    Wszystkie dane dotyczące uczniów i sesji są trzymane w wewnętrznej bazie danych. Możesz zobaczyć, gdzie ona się znajduje, za pomocą przycisku poniżej.
  </p>
  <Button icon="up-right-from-square" @click="openDbFolder">Otwórz lokalny plik</Button>

  <h2>Kopia zapasowa bazy danych</h2>
  <p class="ghost">
    Kopia zapasowa bazy danych zapisywana jest na Twoim Dysku Google po pierwszym uruchomieniu aplikacji w danym dniu.
    W chmurze przetrzymywane jest ostatnie 5 kopii bazy.
  </p>
  <p>Ostatnia kopia bazy danych: {{
    (dbSyncLastMod === null)
    ? "brak danych"
    : (dbSyncLastMod === undefined)
      ? "sprawdzam..."
      : dbSyncLastMod.format("DD.MM.YYYY HH:mm:ss")
  }}</p>
  <div class="flex-right">
    <Button icon="up-right-from-square" @click="openDriveLink">Otwórz katalog na Dysku</Button>
    <Button icon="cloud-arrow-up" @click="dbSyncDump">Kopiuj bazę teraz</Button>
    <Button icon="download" @click="dbSyncRestore">Pobierz najnowszą kopię bazy z Dysku (zrestartuje aplikację)</Button>
  </div>

  <h1>Operacje masowe</h1>
  <p class="ghost">
    Tutaj możesz wykonać zmiany na wielu obiektach jednocześnie.
  </p>
  <div class="flex-right">
    <JumpButton v-for="{label, icon, pageName} in bulkOperations" :key="pageName"
      :icon="icon"
      :to="{name: pageName}"
      >
      {{ label }}
    </JumpButton>
  </div>

  </template>
</template>

<style>

</style>
