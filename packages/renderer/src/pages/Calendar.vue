<script setup lang="ts">
import { onMounted, ref } from 'vue';
import PageHeader from '../components/PageHeader.vue';
import { calendar_v3 } from 'googleapis';
import moment, { Moment } from 'moment';

interface CalEvent{
  date: string,
  title: string,
  startTime: string,
  endTime: string,
}
interface CalDay{
  date: Moment,
  events?: CalEvent[],
}

const events = ref<CalEvent[]>([]);
const days = ref<CalDay[]>([]);

onMounted(async () => {
  try{
    const cal_name = await window.api.getSetting("google_calendar_name");
    window.ipcRenderer.send("calendar-events", cal_name);
  }catch(err){
    console.error(err);
  }
});

window.ipcRenderer.on("calendar-events-response", (data: calendar_v3.Schema$Event[]) => {
  // distilling events
  data.forEach(item => {
    events.value?.push({
      date: moment(item.start?.dateTime).format("YYYY-MM-DD"),
      title: item.summary || '',
      startTime: moment(item.start?.dateTime).format("H:mm"),
      endTime: moment(item.end?.dateTime).format("H:mm"),
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
        <small>{{ day.date.format("ddd") }}</small>
        <h3>{{ day.date.format("D.MM") }}</h3>
      </div>
      <div class="event rounded" v-for="(event, key2) in day.events" :key="key2">
        {{ event.title }} ({{ event.startTime }} - {{ event.endTime }})
      </div>
    </div>
  </div>
  <h2 v-else>Wczytuję...</h2>
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
}
.header{
  text-align: center;
  border-bottom: 1px solid hsl(var(--acc));
}
.header h3{
  margin: 0;
}
</style>
