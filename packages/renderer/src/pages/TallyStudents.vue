<script setup lang="ts">
import { ref, onMounted } from "vue";
import JumpButton from "../components/JumpButton.vue";
import PageHeader from "../components/PageHeader.vue";
import { Student, Session } from "types";

const students = ref([] as (Student & Session)[]);

onMounted(async () => {
  try{
    const data = await window.api.executeQuery(
      `SELECT
        students.id,
        students.first_name || ' ' || students.last_name as student_name,
        COUNT(*) as session_count,
        SUM(sessions.duration) as session_time,
        SUM(
          CASE WHEN duration < 1 THEN duration * sessions.price * (SELECT value FROM settings WHERE name = 'price_factor_below_1')
            ELSE duration * sessions.price
          END
        ) as session_value
      FROM students
        LEFT JOIN sessions ON student_id = students.id
      GROUP BY students.id
      HAVING COUNT(sessions.id) > 0
      ORDER BY students.first_name, students.last_name`
    );
    students.value = data;
  }catch(err){
    console.error(err);
  }
});
</script>

<template>
  <PageHeader title="Policzenie uczniów">
    <JumpButton :to="{name: 'Tally'}" icon="angles-left"></JumpButton>
  </PageHeader>

  <template v-if="students">
    <table v-if="students.length" class="rounded">
      <thead>
        <tr>
          <th>Uczeń</th>
          <th>Sesje</th>
          <th>Czas</th>
          <th>Suma</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="student in students" :key="student.id">
          <td>{{ student.student_name }}</td>
          <td>{{ student.session_count }}</td>
          <td>{{ student.session_time }} h</td>
          <td>{{ $toPln(student.session_value) }}</td>
          <th class="flex-right action-buttons">
            <JumpButton title="Szczegóły" icon="eye" :to="{name: 'TallyStudentDetails', params: {id: student.id}}" />
          </th>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <th colspan="4"></th>
          <th>
            <fai :icon="['fas', 'calculator']" title="Liczba wyników" />
            {{ students.length }}
          </th>
        </tr>
      </tfoot>
    </table>
    <p v-else>
      Lista jest pusta. Brakuje uczniów lub sesji dla nich.
    </p>
  </template>
  <h2 v-else>Wczytuję...</h2>
</template>

<style>
</style>
