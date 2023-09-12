<script setup lang="ts">
import { onMounted, ref } from 'vue';
import PageHeader from '../components/PageHeader.vue';
import { calendar_v3 } from 'googleapis';
import moment, { Moment } from 'moment';
import Loader from '../components/Loader.vue';
import { CalEvent, CalDay, Student } from '../../types';
import JumpButton from '../components/JumpButton.vue';

const events = ref<CalEvent[]>([]);
const days = ref<CalDay[]>([]);
const students = ref<Student[]>([]);

const DoWs = ["nd", "pn", "wt", "śr", "cz", "pt", "so"];
const horizon = 21;

const [low, high] = [8, 21];
const unit = 1 / (high - low) * 100;
const timestretch = (hour: number) => (hour - low) / (high - low);

onMounted(async () => {
  // get events
  try{
    const cal_name = await window.api.getSetting("google_calendar_name");
    window.ipcRenderer.send("calendar-events", {
      cal_name: cal_name.value,
      mode: "all",
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
  data.forEach(item => {
    const student = students.value.find(st => st.nickname == item.summary);

    events.value?.push({
      date: moment(item.start?.dateTime).format("YYYY-MM-DD"),
      title: item.summary || '',
      startTime: moment(item.start?.dateTime),
      duration: moment.duration(moment(item.end?.dateTime).diff(moment(item.start?.dateTime))).asHours(),
    })
  })

  // grouping into days
  for(let i = 0; i <= horizon-1; i++){
    let start_date = (moment().week() == moment().day(1 - 7).week()) ? moment().day(i + 1 - 7) : moment().day(i + 1);
    days.value.push({
      date: start_date,
      events: events.value.filter(el => el.date == start_date.format("YYYY-MM-DD")),
    });
  }
})
</script>

<template>
  <PageHeader title="Podgląd najbliższych dni">
    <JumpButton :to="{name: 'EventMod'}" icon="plus">Nowe zdarzenie</JumpButton>
  </PageHeader>

  <div id="calendar" v-if="days.length" :style="{gridTemplateColumns: `repeat(${horizon}, 7em)`}">
    <div class="day rounded" v-for="(day, key) in days" :key="key" :class="{today: day.date.isSame(moment(), 'days')}">
      <div class="header">
        <small>{{ DoWs[day.date.format("d") as keyof typeof DoWs] }}</small>
        <h3 :class="{accent: [0,6].includes(day.date.weekday())}">{{ day.date.format("D.MM") }}</h3>
      </div>
      <div class="events-container">
        <div class="event rounded flex-down" v-for="(event, key2) in day.events" :key="key2" :style="{
          height: `calc(${event.duration * unit + '%'} - 0.2em)`,
          top: timestretch(moment.duration(event.startTime.format('H:mm')).asHours()) * 100 + '%',
        }">
          <span>{{ event.title }}</span>
          <small class="ghost">{{ event.startTime.format("H:mm") }}</small>
        </div>
      </div>
    </div>
  </div>
  <Loader v-else />
</template>

<style scoped>
#calendar{
  overflow-x: auto;
  height: calc(100vh - 12em);
  display: grid;
  gap: 0.5em;
}
.day, .legend{
  /* flex: 1; */
  border: 1px solid hsl(var(--bg2));
  padding: 0.5em;
  display: flex; flex-direction: column;
  gap: 0.5em;
}

.events-container{
  position: relative;
  height: 100%;
}

.event{
  position: absolute;
  width: 100%;
  background-color: hsl(var(--bg2));
  box-sizing: border-box;
  padding: 0.25em 0.5em;
  font-size: 0.85em;
  gap: 0; flex-wrap: nowrap;
  overflow: hidden;
}
.event:hover{
  overflow: visible;
}
.event small{
  font-size: 0.75em;
}
.header{
  text-align: center;
  border-bottom: 1px solid hsl(var(--acc));
}
.header h3{
  margin: 0;
}
.today{
  background-color: hsla(var(--acc), 50%);
}
</style>
