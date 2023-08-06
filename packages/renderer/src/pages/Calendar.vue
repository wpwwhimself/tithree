<script setup lang="ts">
import { onMounted, ref } from 'vue';
import PageHeader from '../components/PageHeader.vue';
import { calendar_v3 } from 'googleapis';

const events = ref<calendar_v3.Schema$Event[] | undefined>([]);

onMounted(async () => {
  try{
    const cal_name = await window.api.getSetting("google_calendar_name");
    window.ipcRenderer.send("calendar-events", cal_name);
  }catch(err){
    console.error(err);
  }
});

window.ipcRenderer.on("calendar-events-response", (data) => {
  events.value = data;
})

</script>

<template>
  <PageHeader title="Kalendarz sesji"></PageHeader>
  <ul v-if="events?.length">
    <li v-for="event in events" :key="event.id?.toString()">
      {{ event.summary }}
    </li>
  </ul>
  <h2 v-else>Wczytuję...</h2>
</template>
