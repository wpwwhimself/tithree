<script setup lang="ts">
import { onMounted, ref } from 'vue';
import PageHeader from '../components/PageHeader.vue';
import { calendar_v3 } from 'googleapis';
import moment, { Moment } from 'moment';
import Loader from '../components/Loader.vue';
import { Student } from 'types';

interface CalEvent{
  date: string,
  title: string,
  startTime: string,
  duration: number,
}
interface CalDay{
  date: Moment,
  events?: CalEvent[],
}

const events = ref<CalEvent[]>([]);
const days = ref<CalDay[]>([]);
const students = ref<Student[]>([]);

const DoWs = ["nd", "pn", "wt", "śr", "cz", "pt", "so"];

onMounted(async () => {
  // get events
  try{
    const cal_name = await window.api.getSetting("google_calendar_name");
    window.ipcRenderer.send("calendar-events", cal_name);
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
  data.forEach(item => {
    const student = students.value.find(st => st.nickname == item.summary);

    events.value?.push({
      date: moment(item.start?.dateTime).format("YYYY-MM-DD"),
      title: student ? `${student?.first_name} ${student?.last_name}` : item.summary || '',
      startTime: moment(item.start?.dateTime).format("H:mm"),
      duration: moment.duration(moment(item.end?.dateTime).diff(moment(item.start?.dateTime))).asHours(),
    })
  })

  // grouping into days
  const daysAhead = 6
  for(let i = 0; i <= daysAhead; i++){
    let cur_date = moment().add(i, "day");
    days.value.push({
      date: cur_date,
      events: events.value.filter(el => el.date == cur_date.format("YYYY-MM-DD")),
    });
  }
})

</script>

<template>
  <PageHeader title="Sesje w najbliższym tygodniu"></PageHeader>

  <div id="calendar" v-if="days.length">
    <div class="day rounded" v-for="(day, key) in days" :key="key">
      <div class="header">
        <small>{{ DoWs[day.date.format("d") as keyof typeof DoWs] }}</small>
        <h3>{{ day.date.format("D.MM") }}</h3>
      </div>
      <div class="event rounded flex-down" v-for="(event, key2) in day.events" :key="key2">
        <small class="ghost">
          {{ event.startTime }}, {{ event.duration }} h
        </small>
        <span>
          {{ event.title }}
        </span>
      </div>
    </div>
  </div>
  <Loader v-else />
</template>

<style scoped>
#calendar{
  overflow-x: auto;
  height: calc(100vh - 20em);
  display: flex;
  gap: 0.5em;
}
.day, .legend{
  /* flex: 1; */
  width: 500px;
  border: 1px solid hsl(var(--bg2));
  padding: 0.5em;
  display: flex; flex-direction: column;
  gap: 0.5em;
}
.event{
  background-color: hsl(var(--bg2));
  padding: 0.5em;
  gap: 0;
}
.event small{
  font-size: 0.75em;
  margin: 0;
}
.header{
  text-align: center;
  border-bottom: 1px solid hsl(var(--acc));
}
.header h3{
  margin: 0;
}
</style>
