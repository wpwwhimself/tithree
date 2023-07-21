<script setup lang="ts">
import { ref, onMounted } from "vue";
import JumpButton from "../components/JumpButton.vue";
import PageHeader from "../components/PageHeader.vue";
import { useRoute } from "vue-router";
import { Student, Session } from "types";

const route = useRoute();
const student_id = +route.params.id;
const report_data = ref([] as (Student & Session)[]);

let title: string;

onMounted(async () => {
  //student data
  try{
    const data = await window.api.executeQuery(
      `SELECT *
      FROM students
      WHERE id = ?`,
      [student_id]
    );
    title = `${data[0].first_name} ${data[0].last_name} | Podliczenie ucznia`;
  }catch(err){
    console.error(err);
  }

  //report
  try{
    const data = await window.api.executeQuery(
      `SELECT
        SUBSTR(session_date, 1, 7) as month,
        COUNT(*) as session_count,
        SUM(duration) as session_time,
        SUM(sessions.price * duration) as session_value
      FROM sessions
        JOIN students ON student_id = students.id
      WHERE student_id = ?
      GROUP BY month
      ORDER BY students.last_name, students.first_name`,
      [student_id]
    ); //TODO formula for calculating price
    report_data.value = data;
  }catch(err){
    console.error(err);
  }
});
</script>

<template>
  <PageHeader :title="title">
    <JumpButton :to="{name: 'TallyStudents'}" icon="angles-left"></JumpButton>
  </PageHeader>

  <template v-if="report_data">
    <table v-if="report_data.length" class="rounded">
      <thead>
        <tr>
          <th>Sesje</th>
          <th>Czas</th>
          <th>Suma</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(session_gr, key) in $group(report_data, 'month')">
          <tr>
            <td colspan="3" class="accent">{{ key }}</td>
          </tr>
          <tr v-for="session in session_gr">
            <td>{{ session.session_count }}</td>
            <td>{{ session.session_time }} h</td>
            <td>{{ $toPln(session.session_value) }}</td>
          </tr>
        </template>
      </tbody>
      <tfoot>
        <tr>
          <th colspan="2"></th>
          <th>
            <fai :icon="['fas', 'calculator']" />
            {{ report_data.length }}
          </th>
        </tr>
      </tfoot>
    </table>
    <p v-else>
      Lista jest pusta.
    </p>
  </template>
  <h2 v-else>Wczytuję...</h2>
</template>

<style>
</style>
