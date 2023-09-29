<script setup lang="ts">
import JumpButton from '../components/JumpButton.vue';
import PageHeader from '../components/PageHeader.vue';
import { useRouter } from "vue-router";
import { setErrorToast, setToast } from "../toastManager";
import Input from "../components/Input.vue";
import { Student } from "../../types";
import Loader from "../components/Loader.vue";
import { ref, onMounted } from "vue";
import Button from '../components/Button.vue';

const router = useRouter();
const current_price = ref("");
const students = ref<Student[]>([]);
const showLoader = ref(false);

const target_price = ref("");
const students_affected = ref<number[]>([])

onMounted(async () => {
  // current price
  window.api.getSetting("default_student_price")
    .then(data => {
      current_price.value = data.value;
      target_price.value = data.value;
    })
    .catch(err => { setErrorToast("Błąd wczytywania ceny domyślnej", err) });

  // students
  window.api.executeQuery(`SELECT * FROM students ORDER BY suspended, first_name, last_name`)
    .then(data => { students.value = data })
    .catch(err => { setErrorToast("Błąd wczytywania listy uczniów", err) });
})

const updateTargetPrice = (value: string) => {
  target_price.value = value;
}
const updateStudentsAffected = (student_id: number, state: boolean) => {
  if(student_id === 0){
    students_affected.value = (state) ? students.value.map(st => st.id) : [];
    document.querySelectorAll<HTMLInputElement>("input[name^=student]").forEach((box) => { box.checked = state })
  }else{
    const target_index = students_affected.value.findIndex(id => id == student_id);
    if(state === true && target_index == -1) students_affected.value.push(student_id);
    else if(state === false && target_index > -1) students_affected.value.splice(target_index, 1);
  }
}
const handleSubmit = (e: Event) => {
  e.preventDefault();
  if(!confirm("Na pewno?")) return;

  showLoader.value = true;
  window.api.executeQuery(
    `UPDATE settings SET value = ? WHERE name = 'default_student_price'`,
    [target_price.value]
  ).then(res => (students_affected.value.length == 0)
    ? res
    : window.api.executeQuery(
      `UPDATE students SET price = ? WHERE id in (${students_affected.value.map(i => '?').join(", ")})`,
      [target_price.value, ...students_affected.value]
    )
  ).then(res => {
    setToast("Nowa stawka wprowadzona");
    router.push({ name: "Settings" });
  }).catch(err => {
    setErrorToast("Błąd aktualizacji stawki", err.message);
  }).finally(() => { showLoader.value = false })
}

</script>

<template>
  <PageHeader title="Zmiana stawki">
    <JumpButton :to="{name: 'Settings'}" icon="angles-left" />
  </PageHeader>

  <p class="ghost">
    Tutaj możesz ustawić nową stawkę za prowadzone zajęcia.
    Zmiana obejmuje ustawienie domyślnych stawek dla wybranych oraz wszystkich nowych uczniów.
  </p>

  <Loader v-if="!students" />
  <Loader v-else-if="showLoader" mode="saving" />
  <form v-else @submit="handleSubmit">
    <Input type="number" name="target_price" label="Nowa stawka [zł]" :value="current_price" required @input="updateTargetPrice($event.target.value)" />

    <h2>Których uczniów ma dotyczyć zmiana?</h2>
    <p class="ghost">
      Wyróżnieni uczniowie z listy poniżej mają ustaloną stawkę inną niż domyślna.
    </p>
    <Input type="checkbox"
      name="students_all" label="Wszystkich"
      @change="updateStudentsAffected(0, $event.target.checked)"
      style="font-weight: bold;"
      />
    <div class="grid-2">
      <Input v-for="student in students" :key="student.id"
        type="checkbox"
        :name="`students[${student.id}]`" :label="`${student.first_name} ${student.last_name}`"
        @change="updateStudentsAffected(student.id, $event.target.checked)"
        :class="{
          ghost: student.suspended > 0,
          accent: student.price != +current_price,
        }"
        :title="student.price != +current_price ? `Obecna stawka: ${$toPln(student.price)}` : ''"
        />
    </div>
    <Button icon="check" type="submit">Zatwierdź</Button>
  </form>
</template>

<style scoped>
.grid-2{
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin: 0.5em 0;
}
</style>
