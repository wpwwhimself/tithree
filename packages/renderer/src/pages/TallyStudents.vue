<script setup lang="ts">
import { ref, onMounted } from "vue";
import Button from "../components/Button.vue";
import JumpButton from "../components/JumpButton.vue";
import PageHeader from "../components/PageHeader.vue";
import { useRouter } from "vue-router";

const router = useRouter();
const students = ref([]);

onMounted(async () => {
  try{
    const data = await window.api.executeQuery(
      `SELECT
        students.first_name || ' ' || students.last_name as student_name,
        COUNT(*) as session_count,
        SUM(sessions.duration) as session_time,
        SUM(COALESCE(sessions.price_override, students.price) * sessions.duration) as session_value
      FROM students
        LEFT JOIN sessions ON student_id = students.id
      GROUP BY students.id
      ORDER BY students.last_name, students.first_name`
    );
    students.value = data;
  }catch(err){
    console.error(err);
  }
});
</script>

<template>
  <PageHeader title="Podliczenie uczniów">
    <JumpButton icon="pencil" :to="{name: 'Students'}">Uczniowie</JumpButton>
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
            <JumpButton icon="eye" :to="{name: 'Students'}" />
          </th>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <th colspan="4"></th>
          <th>
            <fai :icon="['fas', 'calculator']" />
            {{ students.length }}
          </th>
        </tr>
      </tfoot>
    </table>
    <p v-else>
      Lista jest pusta. Utwórz nowego ucznia.
    </p>
  </template>
  <h2 v-else>Wczytuję...</h2>
</template>

<style>
</style>
