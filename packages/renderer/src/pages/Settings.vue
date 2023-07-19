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

  <form v-if="settings">
    <Input
      v-for="setting in settings" :key="setting.name"
      :label="setting.desc" :value="setting.value"
      :name="setting.name"
      @change="(event) => updateSetting(setting.name, event.target.value)"
      />
  </form>
  <h2 v-else>Wczytywanie...</h2>
</template>

<style>

</style>
