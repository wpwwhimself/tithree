<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Loader from '../components/Loader.vue';
import PageHeader from '../components/PageHeader.vue';
import { CalEvent, Student } from '../../types';
import { calendar_v3 } from 'googleapis';
import moment from 'moment';
import Button from '../components/Button.vue';

const students = ref<Student[]>([]);
const events = ref<CalEvent[]>([]);
const noEventsFlag = ref(false);

onMounted(async () => {
  // get events
  try{
    const cal_name = await window.api.getSetting("google_calendar_name");
    window.ipcRenderer.send("calendar-events", {
      cal_name: cal_name.value,
      mode: "today"
    });
  }catch(err){
    console.error(err);
  }

  // get students
  try{
    const data = await window.api.executeQuery(
      `SELECT first_name, last_name, nickname
      FROM students`
    );
    students.value = data;
  }catch(err){
    console.error(err);
  }
});

window.ipcRenderer.on("calendar-events-response", (data: calendar_v3.Schema$Event[]) => {
  // distilling events
  if(data.length){
    data.forEach(item => {
      const student = students.value.find(st => st.nickname == item.summary);

      events.value.push({
        date: moment(item.start?.dateTime).format("YYYY-MM-DD"),
        title: student ? `${student?.first_name} ${student?.last_name}` : item.summary || '',
        startTime: moment(item.start?.dateTime).format("H:mm"),
        duration: moment.duration(moment(item.end?.dateTime).diff(moment(item.start?.dateTime))).asHours(),
      })
    })
  }else{
    noEventsFlag.value = true;
  }
})
</script>

<template>
  <PageHeader title="Sesje zaplanowane na dziś" />

  <table id="today" class="rounded" v-if="events.length">
    <thead>
      <tr>
        <th>Godzina</th>
        <th>Uczeń</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(event, key) in events" :key="key">
        <td>{{ event.startTime }}</td>
        <td>{{ event.title }}</td>
        <td class="flex-right action-buttons">
          <Button title="Wykonaj sesję" icon="check"></Button>
        </td>
      </tr>
    </tbody>
  </table>
  <p v-else-if="noEventsFlag">Brak zdarzeń na dziś</p>
  <Loader v-else />
</template>

<script>
</script>
