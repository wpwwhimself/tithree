<script setup lang="ts">
import PageHeader from '../components/PageHeader.vue';
import JumpButton from '../components/JumpButton.vue';
import Loader from '../components/Loader.vue';
import { ref, onMounted } from 'vue';
import { Session, Student } from 'types';
import moment, { Moment } from 'moment';
import SubPanel from '../components/SubPanel.vue';
import Input from '../components/Input.vue';
import { setErrorToast } from '../toastManager';

const students = ref([] as Student[]);
const sessions = ref([] as Session[]);
let sessions_f = ref([] as Session[]);
const daterange = ref([] as Moment[]);
const [filter_from, filter_to] = [
  ref(moment().subtract(1, "month").format("YYYY-MM-DD")),
  ref(moment().format("YYYY-MM-DD")),
];
const updateFilters = (name: string, val: string) => {
  switch(name){
    case "from": filter_from.value = val; break;
    case "to": filter_to.value = val; break;
  }
  updateDataSet();
}
const updateDataSet = () => {
  sessions_f.value = sessions.value.filter(ses =>
    moment(ses.session_date).isBetween(filter_from.value, filter_to.value, undefined, "[]")
  );

  daterange.value = [];
  let currentDate = moment(filter_to.value);
  while(currentDate.isSameOrAfter(filter_from.value)){
    daterange.value.push(currentDate.clone());
    currentDate.subtract(1, "day");
  }
}

onMounted(async () => {
  //students
  try{
    const data = await window.api.executeQuery(
      `SELECT *
      FROM students
      WHERE suspended = 0
      ORDER BY first_name, last_name`
    );
    students.value = data;
    updateDataSet();
  }catch(err){
    setErrorToast("Błąd wczytywania uczniów", err)
  }

  //sessions
  try{
    const data = await window.api.executeQuery(
      `SELECT session_date, student_id, duration
      FROM sessions
      ORDER BY session_date DESC`
    );
    sessions.value = data;
  }catch(err){
    setErrorToast("Błąd wczytywania sesji", err)
  }

  updateDataSet();
});
</script>

<template>
  <PageHeader title="Obecność">
  </PageHeader>

  <SubPanel title="Filtry">
    <div class="flex-right h-center inputs-in-line">
      <Input type="date" name="date_from" :value="filter_from" label="Od" @change="updateFilters('from', $event.target.value)"/>
      <Input type="date" name="date_to" :value="filter_to" label="Do" @change="updateFilters('to', $event.target.value)" />
    </div>
  </SubPanel>

  <div v-if="students.length">
    <div id="timegrid" :style="{gridTemplateColumns: `auto repeat(${students.length}, 1fr)`}">
      <!-- header -->
      <span></span>
      <span v-for="student in students"
        class="heading"
        :title="`${student.first_name} ${student.last_name}`">
        {{ student.nickname ?? `${student.first_name} ${student.last_name}` }}
      </span>

      <!-- dates -->
      <template v-for="day in daterange">
        <span :title="day.format('D.MM.YYYY')"
          :class="{
            accent: [0, 6].includes(day.weekday())
          }">
          {{ day.format("D.MM") }}
        </span>
        <span v-for="student in students"
          :class="{
            marked: sessions_f.find((el: Session) => el.student_id == student.id && el.session_date == day.format('YYYY-MM-DD')),
            odd: day.month() % 2
          }"
          class="cell"
          :title="sessions_f.find((el: Session) => el.student_id == student.id && el.session_date == day.format('YYYY-MM-DD')) && `${student.first_name} ${student.last_name}: ${sessions_f.find((el: Session) => el.student_id == student.id && el.session_date == day.format('YYYY-MM-DD'))!.duration} h`"
          >
          {{ sessions_f.find((el: Session) => el.student_id == student.id && el.session_date == day.format('YYYY-MM-DD'))?.duration }}
        </span>
      </template>
    </div>
  </div>
  <Loader v-else />
</template>

<style scoped>
#timegrid{
  display: grid;
  gap: 0.1em;
  margin-top: 5em;
}
#timegrid span{
  overflow: hidden;
  white-space: nowrap;
  cursor: default;
  height: 1.5em;
  max-width: 5em;
}
#timegrid span:hover{
  max-width: unset;
}
.heading{
  rotate: -60deg;
  translate: 1.5em 0;
  transform-origin: 0% 100%;
  width: fit-content;
  position: sticky; top: 3em;
}
.cell{
  border: 0.1em solid hsla(var(--fg), 30%);
  text-align: center;
}
.marked{
  background-color: hsl(var(--acc)) !important;
}
.odd{
  background-color: hsla(var(--bg2), 50%);
}
</style>
