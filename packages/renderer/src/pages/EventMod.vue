<script setup lang="ts">
import { onMounted, ref } from 'vue';
import PageHeader from '../components/PageHeader.vue';
import { calendar_v3 } from 'googleapis';
import { CalEvent, CalDay, Student } from '../../types';
import Input from '../components/Input.vue';
import Button from '../components/Button.vue';
import Loader from '../components/Loader.vue';
import { useRoute, useRouter } from 'vue-router';
import Select from '../components/Select.vue';
import moment from 'moment';

const [route, router] = [useRoute(), useRouter()];
const event_id = route.params.id;
const is_update = !!event_id;
const event = ref({} as CalEvent);
const students = ref<Student[]>([]);

let title: string;
const student_nick = ref("");
const date = ref("");
const time = ref("");
const duration = ref("");
const isRecurring = ref(true);
const showLoader = ref(false);

onMounted(async () => {
  // get events
  // try{
  //   const cal_name = await window.api.getSetting("google_calendar_name");
  //   window.ipcRenderer.send("calendar-events", {
  //     cal_name: cal_name.value,
  //     mode: "all",
  //   });
  // }catch(err){
  //   console.error(err);
  // }

  // load students
  try{
    const data = await window.api.executeQuery(
      `SELECT
        students.nickname as key,
        first_name || ' ' || last_name as value,
        COALESCE(JULIANDAY(DATE()) - JULIANDAY(MAX(session_date)) > CAST((SELECT value FROM settings WHERE name = 'student_inactive_days') AS INTEGER), 1) as ghost
      FROM students
        LEFT JOIN sessions ON sessions.student_id = students.id
      GROUP BY students.id
      ORDER BY first_name, last_name`,
    );
    students.value = data;
  }catch(err){
    console.error(err);
  }
});

const handleSubmit = async (e: Event) => {
  e.preventDefault();
  showLoader.value = true;

  const startDate = moment(`${date.value}T${time.value}`);

  const event: calendar_v3.Schema$Event = {
    summary: student_nick.value,
    description: "Korki | Tithree",
    start: {
      dateTime: startDate.toISOString(),
      timeZone: "Europe/Warsaw",
    },
    end: {
      dateTime: startDate.add(duration.value, "h").toISOString(),
      timeZone: "Europe/Warsaw",
    },
    recurrence: isRecurring.value ? ["RRULE:FREQ=WEEKLY;COUNT=30"] : undefined,
  }

  try{
    if(!is_update){
      const cal_name = await window.api.getSetting("google_calendar_name");
      window.ipcRenderer.send("calendar-new-event", {
        cal_name: cal_name.value,
        event: event
      });
    }
  }catch(err){
    showLoader.value = false;
    console.error(err);
  }

};

window.ipcRenderer.on("calendar-event-new-response", (res_code) => {
  if(res_code != 200) return;
  router.push({
    name: "ActionSummary",
    params: {
      action: (is_update) ? "Zdarzenie poprawione" : "Sesja zaplanowana",
      target: "Calendar"
    }
  });
})

const updateRef = (target: string, val: string | boolean) => {
  const refTable = {
    student_nick: student_nick,
    date: date,
    time: time,
    duration: duration,
    isRecurring: isRecurring,
  };

  refTable[target as keyof typeof refTable].value = val;
}
</script>

<template>
  <Loader mode="saving" v-if="showLoader" />
  <div v-else-if="event || !event_id">
    <PageHeader v-if="!!event_id" :title="title"></PageHeader>
    <PageHeader v-else title="Nowe zdarzenie"></PageHeader>
    <form @submit="handleSubmit">
      <Select :options="students" :emptyOption="true" :value="student_nick" name="student_nick" label="Uczeń" required @change="updateRef('student_nick', $event.target.value)" />
      <Input type="date" name="date" :value="date" label="Data sesji" required @input="updateRef('date', $event.target.value)" />
      <Input type="time" name="time" :value="time" label="Godzina rozpoczęcia" required @input="updateRef('time', $event.target.value)" />
      <Input type="number" min="0" step="0.25" name="duration" :value="duration" label="Czas trwania sesji [h]" required @input="updateRef('duration', $event.target.value)" />
      <Input type="checkbox" name="isRecurring" label="Powtarzaj co tydzień" @change="updateRef('isRecurring', $event.target.checked)" />
      <Button icon="check" type="submit">Zatwierdź</Button>
    </form>
  </div>
  <Loader v-else />
</template>
