<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Loader from '../components/Loader.vue';
import PageHeader from '../components/PageHeader.vue';
import { CalEvent, Student, Session } from '../../types';
import { calendar_v3 } from 'googleapis';
import moment from 'moment';
import Button from '../components/Button.vue';
import BigSplash from '../components/BigSplash.vue';
import router from '../router';

const students = ref<Student[]>([]);
const events = ref<CalEvent[]>([]);
const noEventsFlag = ref(false);
const studentsToday = ref<number[]>([]);

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
    const data = await window.api.executeQuery(`SELECT * FROM students`);
    students.value = data;
  }catch(err){
    console.error(err);
  }

  // get today's sessions
  try{
    const data = await window.api.executeQuery(`SELECT DISTINCT student_id FROM sessions WHERE date(session_date) = date('now')`);
    data.forEach(el => studentsToday.value.push(el.student_id));
  }catch(err){
    console.error(err);
  }
});

window.ipcRenderer.on("calendar-events-response", (data: calendar_v3.Schema$Event[]) => {
  // distilling events
  data.forEach(item => {
    const student = students.value.find(st => st.nickname == item.summary);

    events.value.push({
      date: moment(item.start?.dateTime).format("YYYY-MM-DD"),
      student: student,
      title: item.summary || '',
      startTime: moment(item.start?.dateTime),
      duration: moment.duration(moment(item.end?.dateTime).diff(moment(item.start?.dateTime))).asHours(),
    })
  })

  events.value = events.value.filter(ev => !studentsToday.value.includes(ev.student?.id!))

  if(!events.value.length) noEventsFlag.value = true;
})

const finalizeSession = async (date: string, student: Student, duration: number) => {
  // if(!confirm("Na pewno?")) return;

  try{
    const [query, params] = [
      `INSERT INTO sessions (student_id, session_date, duration, price) VALUES(?, ?, ?, ?)`,
      [student.id, date, duration, student.price]
    ];
    await window.api.executeQuery(query, params);
    router.push({
      name: "ActionSummary",
      params: {
        action: "Sesja dodana",
        target: "Home",
      }
    });
  }catch(err){
    console.error(err);
  }
};
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
        <td>{{ event.startTime.format("H:mm") }}, {{ event.duration }} h</td>
        <td>{{ event.student && `${event.student?.first_name} ${event.student?.last_name}` }}</td>
        <td class="flex-right action-buttons">
          <Button title="Wykonaj sesję" icon="check" @click="finalizeSession(event.date, event.student as Student, event.duration)"></Button>
        </td>
      </tr>
    </tbody>
  </table>
  <BigSplash v-else-if="noEventsFlag"
    icon="couch"
    title="Brak sesji na dziś"
    subtitle="Czas na relaks?"
    />
  <Loader v-else />
</template>

<script>
</script>
