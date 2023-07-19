<script setup lang="ts">
import { ref, onMounted } from "vue";
import Button from "../components/Button.vue";
import JumpButton from "../components/JumpButton.vue";
import PageHeader from "../components/PageHeader.vue";
import Input from "../components/Input.vue";
import { useRouter } from "vue-router";
import { Setting } from "../../types";

const router = useRouter();
const settings = ref({} as Setting[]);

let default_student_price = ref(null);
let default_session_duration = ref(null);

onMounted(async () => {
  try{
    const data = await window.api.executeQuery(
      `SELECT * FROM settings`
    );
    settings.value = data;
  }catch(err){
    console.error(err);
  }

  // default_student_price = ref(settings.value.first_name);
  // default_session_duration = ref(settings.value.last_name);
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
