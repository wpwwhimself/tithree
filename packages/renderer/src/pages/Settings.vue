<script setup lang="ts">
import { ref, onMounted } from "vue";
import PageHeader from "../components/PageHeader.vue";
import Input from "../components/Input.vue";
import { Setting } from "../../types";

const settings = ref({} as Setting[]);

onMounted(async () => {
  try{
    const data = await window.api.executeQuery(
      `SELECT * FROM settings`
    );
    settings.value = data;
  }catch(err){
    console.error(err);
  }
});

const updateSetting = async (name: string, val: string) => {
  try{
    await window.api.executeQuery(
      `UPDATE settings SET value = ? WHERE name = ?`,
      [val, name]
    );
    console.log(`${name} changed to ${val}`);
  }catch(err){
    console.error(err);
  }
};
</script>

<template>
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
        :label="setting.desc" :value="setting.value"
        :name="setting.name"
        @change="(event) => updateSetting(setting.name, event.target.value)"
        />
    </template>
  </form>
  <h2 v-else>Wczytywanie...</h2>
</template>

<style>

</style>
