<script setup lang="ts">
import { Ref, onMounted, ref } from 'vue';
import PageHeader from '../components/PageHeader.vue';
import { google, calendar_v3 } from 'googleapis';

const events = ref<calendar_v3.Schema$Event[] | undefined>([]);

onMounted(async () => {
  try{
    const data = await window.ipcRenderer.send("calendar-events");

  } catch(err) {
    console.error(err);
  }
})
</script>

<template>
  <PageHeader title="Kalendarz sesji"></PageHeader>

</template>
