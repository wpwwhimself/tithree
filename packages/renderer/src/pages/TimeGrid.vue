<script setup lang="ts">
import PageHeader from '../components/PageHeader.vue';
import JumpButton from '../components/JumpButton.vue';
import Loader from '../components/Loader.vue';
import { ref, onMounted } from 'vue';
import { Session, Student } from 'types';
import moment, { Moment } from 'moment';

const students = ref([] as Student[]);
const sessions = ref([] as Session[]);
const daterange = ref([] as Moment[]);

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
  }catch(err){
    console.error(err);
  }

  //sessions
  try{
    const data = await window.api.executeQuery(
      `SELECT session_date, student_id, duration
      FROM sessions
      ORDER BY session_date DESC`
    );
    sessions.value = data;
    const oldest = moment(sessions.value.slice(-1)[0].session_date);

    let currentDate = moment();
    while(currentDate.isSameOrAfter(oldest)){
      daterange.value.push(currentDate.clone());
      currentDate.subtract(1, "day");
    }

  }catch(err){
    console.error(err);
  }
});
</script>

<template>
  <PageHeader title="Obecność">
  </PageHeader>

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
            marked: sessions.find((el: Session) => el.student_id == student.id && el.session_date == day.format('YYYY-MM-DD')),
            odd: day.month() % 2
          }"
          class="cell"
          :title="sessions.find((el: Session) => el.student_id == student.id && el.session_date == day.format('YYYY-MM-DD')) && `${student.first_name} ${student.last_name}: ${sessions.find((el: Session) => el.student_id == student.id && el.session_date == day.format('YYYY-MM-DD'))!.duration} h`"
          >
          {{ sessions.find((el: Session) => el.student_id == student.id && el.session_date == day.format('YYYY-MM-DD'))?.duration }}
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
