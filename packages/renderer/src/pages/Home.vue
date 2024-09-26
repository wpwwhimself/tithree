<script setup lang="ts">
import { ref, onMounted, DefineComponent } from "vue";
import Loader from '../components/Loader.vue';
import PageHeader from '../components/PageHeader.vue';
import { CalEvent, Student, Session } from '../../types';
import { calendar_v3 } from 'googleapis';
import moment from 'moment';
import Button from '../components/Button.vue';
import BigSplash from '../components/BigSplash.vue';
import router from '../router';
import JumpButton from '../components/JumpButton.vue';
import { setErrorToast, setToast } from '../toastManager';
import Warning from "../components/Warning.vue";
import { createConfirmDialog } from "vuejs-confirm-dialog";

const students = ref<Student[]>([]);
const events = ref<CalEvent[]>([]);
const noEventsFlag = ref(false);
const lastSessions = ref<string[]>([]);
const showLoader = ref(false);

const FETCH_DATA = async () => {
  // get events
  try{
    const cal_name = await window.api.getSetting("google_calendar_name");
    window.ipcRenderer.send("calendar-events", {
      cal_name: cal_name.value,
      mode: "today"
    });
  }catch(err){
    setErrorToast("Błąd wczytywania zdarzeń", err)
  }

  // get students
  try{
    const data = await window.api.executeQuery(`SELECT * FROM students`);
    students.value = data;
  }catch(err){
    setErrorToast("Błąd wczytywania uczniów", err)
  }

  // get last sessions
  try{
    const data = await window.api.executeQuery(`SELECT session_date || '_' || student_id as session_code FROM sessions WHERE date(session_date) >= date('now', '-30 days')`);
    data.forEach(el => lastSessions.value.push(el.session_code));
  }catch(err){
    setErrorToast("Błąd wczytywania sesji", err)
  }
}

onMounted(async () => { FETCH_DATA() });

window.ipcRenderer.on("calendar-events-response", (data: calendar_v3.Schema$Event[]) => {
  events.value = [];

  // distilling events
  data.forEach(item => {
    const student = students.value.find(st => st.nickname == item.summary);

    events.value.push({
      eventId: item.id,
      date: moment(item.start?.dateTime).format("YYYY-MM-DD"),
      student: student,
      title: item.summary || '',
      startTime: moment(item.start?.dateTime),
      duration: moment.duration(moment(item.end?.dateTime).diff(moment(item.start?.dateTime))).asHours(),
    })
  })

  events.value = events.value.filter(ev => !lastSessions.value.includes(`${ev.date}_${ev.student?.id!}`))

  if(!events.value.length) noEventsFlag.value = true;
})
window.ipcRenderer.on("calendar-event-delete-response", (res_code) => {
  if(res_code >= 300) return;
  showLoader.value = false;
  setToast("Zdarzenie usunięte z kalendarza")
  FETCH_DATA();
})

const finalizeSession = async (date: string, student: Student, duration: number) => {
  try{
    const [query, params] = [
      `INSERT INTO sessions (student_id, session_date, duration, price, price_factor_below_1)
      VALUES (?, ?, ?, ?, (SELECT value FROM settings WHERE name = 'price_factor_below_1'))`,
      [student.id, date, duration, student.price]
    ];
    await window.api.executeQuery(query, params);
    setToast("Sesja dodana")
    FETCH_DATA();
  }catch(err){
    setErrorToast("Błąd zatwierdzania sesji", err)
  }
};

const dialog = createConfirmDialog(Warning as DefineComponent<any, any, any, any, any, any, any, any>);
const deleteSession = async (eventId: string) => {
  const { isCanceled } = await dialog.reveal({ doYouWantTo: "odrzucić sesję", orElse: "Spowoduje to usunięcie zdarzenia w kalendarzu" });
  if(isCanceled) return;
  showLoader.value = true;

  try{
    const cal_name = await window.api.getSetting("google_calendar_name");
    window.ipcRenderer.send("calendar-delete-event", {
      cal_name: cal_name.value,
      eventId: eventId
    });
  }catch(err){
    showLoader.value = false;
    setErrorToast("Błąd usuwania zdarzenia z Google", err)
  }

};
</script>

<template>
  <Loader mode="saving" v-if="showLoader" />
  <template v-else>

    <PageHeader title="Do wypełnienia na dziś" />
    <p class="ghost">
      Oto lista dzisiejszych i zaległych sesji, które oczekują na wypełnienie.
    </p>

    <table id="today" class="rounded" v-if="events.length">
      <thead>
        <tr>
          <th>Data</th>
          <th>Godzina</th>
          <th>Uczeń</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(event, key) in events" :key="key">
          <td>{{ event.startTime.format("D.MM") }}</td>
          <td>{{ event.startTime.format("H:mm") }}, {{ event.duration }} h</td>
          <td v-if="event.student">{{ event.student.first_name}} {{event.student.last_name}}</td>
            <td v-else class="ghost">{{ event.title }} <i>(dodaj pseudonim)</i></td>
          <td>
            <div class="flex-right h-center action-buttons">
              <Button v-if="event.student" title="Wykonaj sesję" icon="check" @click="finalizeSession(event.date, event.student as Student, event.duration)"></Button>
              <JumpButton v-else :to="{name: 'Students'}" title="Lista uczniów" icon="user-pen"></JumpButton>
              <Button title="Odrzuć sesję" icon="xmark" @click="deleteSession(event.eventId!)"></Button>
            </div>
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
</template>

<script>
</script>
