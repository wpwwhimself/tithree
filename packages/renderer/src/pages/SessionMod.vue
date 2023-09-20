<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import Button from "../components/Button.vue";
import PageHeader from "../components/PageHeader.vue";
import Input from "../components/Input.vue";
import Select from "../components/Select.vue";
import moment from "moment";
import { SelectOption, Session } from "../../types";
import { setErrorToast, setToast } from "../toastManager";

const [route, router] = [useRoute(), useRouter()];
const session_id = +route.params.id;
const students = ref([] as SelectOption[]);
const session = ref({} as Session);

let title: string;
// let session_id = ref("");
let session_date = ref(moment().format("YYYY-MM-DD"));
let student_id = ref("");
let duration = ref("");
let price = ref("");

onMounted(async () => {
  // load students
  try{
    const data = await window.api.executeQuery(
      `SELECT
        students.id as key,
        first_name || ' ' || last_name as value,
        COALESCE(JULIANDAY(DATE()) - JULIANDAY(MAX(session_date)) > CAST((SELECT value FROM settings WHERE name = 'student_inactive_days') AS INTEGER), 1) as ghost,
        students.price
      FROM students
        LEFT JOIN sessions ON sessions.student_id = students.id
      GROUP BY students.id
      ORDER BY suspended, first_name, last_name`,
    );
    students.value = data;
  }catch(err){
    setErrorToast("Błąd wczytywania uczniów", err)
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
      setErrorToast("Błąd wczytywania danych sesji", err)
    }

    title = `${session.value.session_date} ${session.value.student_name} | Edycja sesji`;
    session_date = ref(session.value.session_date);
    student_id = ref(session.value.student_id.toString());
    duration = ref(session.value.duration.toString());
    price = ref(session.value.price.toString());
  }else{
    try{
      const data = await window.api.getSetting("default_session_duration");
      duration.value = data.value;
    }catch(err){
      setErrorToast("Błąd wczytywania ustawień", err)
    }
  }
});

const handleSubmit = async (e: Event) => {
  e.preventDefault();

  const is_update = (session_id != 0)

  try{
    const [query, params] = (!is_update)
      ? [
          `INSERT INTO sessions (student_id, session_date, duration, price) VALUES(?, ?, ?, ?)`,
          [student_id.value, session_date.value, duration.value, price.value]
        ]
      : [
          `UPDATE sessions SET student_id = ?, session_date = ?, duration = ?, price = ?, updated_at = datetime() WHERE id = ?`,
          [student_id.value, session_date.value, duration.value, price.value, session_id]
        ];
    await window.api.executeQuery(query, params);
    setToast((is_update) ? "Dane sesji poprawione" : "Sesja dodana")
    router.push({ name: "Sessions" });
  }catch(err){
    setErrorToast("Błąd aktualizacji danych", err)
  }
};

const updateStudentId = (val: string) => {
  student_id.value = val;
  price.value = students.value.filter(opt => opt.key == val)[0].price!.toString();
};
const updateRef = (target: string, val: string) => {
  const refTable = {
    session_date: session_date,
    duration: duration,
    price: price,
  }
  refTable[target as keyof typeof refTable].value = val;
}
</script>

<template>
  <div v-if="session || session_id == 0">
    <PageHeader v-if="session_id > 0" :title="title"></PageHeader>
    <PageHeader v-else title="Nowa sesja"></PageHeader>

    <p class="ghost">
      Dodajesz właśnie nową, odbytą już sesję. Wybierz ucznia i uzupełnij informacje o sesji.
      Wyszarzeni uczniowie to ci, którzy ostatnią sesję odbyli dawno temu (jak dawno – znajdziesz w ustawieniach).
    </p>

    <form @submit="handleSubmit">
      <Input type="date" :value="session_date" name="session_date" label="Data" required @input="updateRef('session_date', $event.target.value)"/>
      <Select :options="students" :emptyOption="true" :value="student_id" name="student_id" label="Uczeń" required @change="updateStudentId($event.target.value)" />
      <Input type="number" min="0" step="0.25" :value="duration" name="duration" label="Czas trwania [h]" required @input="updateRef('duration', $event.target.value)"/>
      <Input type="number" min="0" step="0.01" :value="price" name="price" label="Stawka [zł]" required @input="updateRef('price', $event.target.value)"/>
      <Button icon="check" type="submit">Zatwierdź</Button>
    </form>
  </div>
  <div v-else>
    <h2>Wczytywanie...</h2>
  </div>
</template>

<style>

</style>
