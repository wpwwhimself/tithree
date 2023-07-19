<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import Button from "../components/Button.vue";
import PageHeader from "../components/PageHeader.vue";
import Input from "../components/Input.vue";
import Select from "../components/Select.vue";
import * as moment from "moment";

const [route, router] = [useRoute(), useRouter()];
const session_id = +route.params.id;
const students = ref(null);
const session = ref(null);

let title;
// let session_id = ref("");
let session_date = ref(moment().format("YYYY-MM-DD"));
let student_id = ref(null);
let duration = ref(null);
let price_override = ref(null);

onMounted(async () => {
  // load students
  try{
    const data = await window.api.executeQuery(
      `SELECT
        id as key,
        first_name || ' ' || last_name as value
      FROM students
      ORDER BY first_name, last_name`,
    );
    students.value = data;
  }catch(err){
    console.error(err);
  }

  // load session data
  if(session_id > 0){
    try{
      const data = await window.api.executeQuery(
        `SELECT
          sessions.*,
          first_name || ' ' || last_name as student_name
        FROM sessions
          JOIN students ON student_id = students.id
        WHERE sessions.id = ?`,
        [session_id]
      );
      session.value = data[0];
    }catch(err){
      console.error(err);
    }

    title = `${session.value.session_date} ${session.value.student_name} | Edycja sesji`;
    session_date = ref(session.value.session_date);
    student_id = ref(session.value.student_id.toString());
    duration = ref(session.value.duration.toString());
    price_override = ref(session.value.price_override.toString());
  }else{
    try{
      const data = await window.api.executeQuery(
        `SELECT value FROM settings WHERE name = 'default_session_duration'`
      );
      duration.value = data[0].value;
    }catch(err){
      console.error(err);
    }
  }
});

const handleSubmit = async (e) => {
  e.preventDefault();

  const is_update = (session_id != 0)

  try{
    const [query, params] = (!is_update)
      ? [
          `INSERT INTO sessions (student_id, session_date, duration, price_override) VALUES(?, ?, ?, ?)`,
          [student_id.value, session_date.value, duration.value, price_override.value || null]
        ]
      : [
          `UPDATE sessions SET student_id = ?, session_date = ?, duration = ?, price_override = ?, updated_at = datetime() WHERE id = ?`,
          [student_id.value, session_date.value, duration.value, price_override.value || null, session_id]
        ];
    await window.api.executeQuery(query, params);
    router.push({
      name: "ActionSummary",
      params: {
        action: (is_update) ? "Dane sesji poprawione" : "Sesja dodana",
        target: "Sessions"
      }
    });
  }catch(err){
    console.error(err);
  }
};

const updateSessionDate = (val) => session_date.value = val;
const updateStudentId = (val) => student_id.value = val;
const updateDuration = (val) => duration.value = val;
const updatePriceOverride = (val) => price_override.value = val;
</script>

<template>
  <div v-if="session || session_id == 0">
    <PageHeader v-if="session_id > 0" :title="title"></PageHeader>
    <PageHeader v-else title="Nowa sesja"></PageHeader>
    <form @submit="handleSubmit">
      <Input type="date" :value="session_date" name="session_date" label="Data" required @input="updateSessionDate($event.target.value)"/>
      <Select :options="students" :emptyOption="true" :value="student_id" name="student_id" label="Uczeń" required @change="updateStudentId($event.target.value)" />
      <Input type="number" min="0" step="0.25" :value="duration" name="duration" label="Czas trwania [h]" required @input="updateDuration($event.target.value)"/>
      <Input type="number" min="0" step="0.01" :value="price_override" name="price_override" label="Wyjątkowa stawka [zł]" @input="updatePriceOverride($event.target.value)"/>
      <Button icon="check" type="submit">Zatwierdź</Button>
    </form>
  </div>
  <div v-else>
    <h2>Wczytywanie...</h2>
  </div>
</template>

<style>

</style>
