<script setup>
import { ref, onMounted } from "vue";
import JumpButton from "../components/JumpButton.vue";
import PageHeader from "../components/PageHeader.vue";

const students = ref([]);

onMounted(async () => {
  try{
    const data = await window.api.executeQuery(
      "SELECT * FROM students"
    );
    students.value = data;
  }catch(err){
    console.error(err);
  }
});
</script>

<template>
  <PageHeader title="Lista uczniów">
    <JumpButton icon="plus" to="/students/mod">Dodaj</JumpButton>
  </PageHeader>
  <table>
    <thead>
      <tr>
        <th>Imię</th>
        <th>Nazwisko</th>
        <th>Stawka</th>
      </tr>
    </thead>
    <tbody>
      <tr v-if="students" v-for="student in students" :key="student.id">
        <td>{{ student.first_name }}</td>
        <td>{{ student.last_name }}</td>
        <td>{{ $toPln(student.price) }}</td>
      </tr>
      <tr v-else>
        <td colspan="3">Wczytuję...</td>
      </tr>
    </tbody>
  </table>
</template>
