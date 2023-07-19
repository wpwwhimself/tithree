<script setup lang="ts">
import { ref, onMounted } from "vue";
import Button from "../components/Button.vue";
import JumpButton from "../components/JumpButton.vue";
import PageHeader from "../components/PageHeader.vue";
import { useRouter } from "vue-router";
import { Student } from "types";

const router = useRouter();
const students = ref([] as Student[]);

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
  <PageHeader title="Podliczenie okresów">
  </PageHeader>

</template>

<style>
</style>
