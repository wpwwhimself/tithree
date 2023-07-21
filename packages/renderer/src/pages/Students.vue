<script setup lang="ts">
import { ref, onMounted } from "vue";
import Button from "../components/Button.vue";
import JumpButton from "../components/JumpButton.vue";
import PageHeader from "../components/PageHeader.vue";
import { useRouter } from "vue-router";
import { Student } from "../../types";

const router = useRouter();
const students = ref([] as Student[]);
const def_price = ref(0);

onMounted(async () => {
  //students list
  try{
    const data = await window.api.executeQuery(
      "SELECT * FROM students ORDER BY last_name, first_name"
    );
    students.value = data;
  }catch(err){
    console.error(err);
  }

  //default price for highlighting purposes
  try{
    const data = await window.api.getSetting("default_student_price");
    def_price.value = +data.value;
  }catch(err){
    console.error(err);
  }
});

const handleDelete = async (student_id: number) => {
  if(!confirm("Na pewno?")) return;

  try{
    const [query, params] = [
      `DELETE FROM students WHERE id = ?`,
      [student_id]
    ];
    await window.api.executeQuery(query, params);
    router.push({
      name: "ActionSummary",
      params: {
        action: "Uczeń usunięty",
        target: "Students",
      }
    });
  }catch(err){
    console.error(err);
  }
};
</script>

<template>
  <PageHeader title="Lista uczniów">
    <JumpButton icon="plus" :to="{name: 'StudentsMod', params: {id: 0}}">Dodaj</JumpButton>
  </PageHeader>

  <template v-if="students">
    <table v-if="students.length" class="rounded">
      <thead>
        <tr>
          <th>Imię</th>
          <th>Nazwisko</th>
          <th>Stawka</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="student in students" :key="student.id">
          <td>{{ student.first_name || "–" }}</td>
          <td>{{ student.last_name || "–" }}</td>
          <td :class="{ ghost: (def_price == student.price) }">{{ $toPln(student.price) }}</td>
          <td class="flex-right action-buttons">
            <JumpButton icon="pencil" :to="{name: 'StudentsMod', params: {id: student.id}}"></JumpButton>
            <Button icon="trash" @click="handleDelete(student.id)"></Button>
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <th colspan="3"></th>
          <th>
            <fai :icon="['fas', 'calculator']" />
            {{ students.length }}
          </th>
        </tr>
      </tfoot>
    </table>
    <p v-else>
      Lista jest pusta. Utwórz nowego ucznia przyciskiem powyżej.
    </p>
  </template>
  <h2 v-else>Wczytuję...</h2>
</template>

<style>
</style>
