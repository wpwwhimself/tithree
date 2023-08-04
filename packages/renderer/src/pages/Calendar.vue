<script setup lang="ts">
import { onMounted, ref } from 'vue';
import PageHeader from '../components/PageHeader.vue';
import { calendar_v3 } from 'googleapis';
import { ipcRenderer } from 'electron';

const events = ref<calendar_v3.Schema$Event[] | undefined>([]);

onMounted(() => {
  window.ipcRenderer.send("calendar-events");
});

window.ipcRenderer.on("calendar-events-response", (event, data) => {
  console.log(data);
})

</script>

<template>
  <PageHeader title="Kalendarz sesji"></PageHeader>

</template>
