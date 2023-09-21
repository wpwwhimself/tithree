<script setup lang="ts">
import { ref, onMounted } from "vue";
import Button from "../components/Button.vue";
import JumpButton from "../components/JumpButton.vue";
import PageHeader from "../components/PageHeader.vue";
import { useRouter } from "vue-router";
import { Student } from "../../types";
import Loader from "../components/Loader.vue";
import { setToast, setErrorToast } from "../toastManager"

const router = useRouter();
const students = ref([] as Student[]);
const students_almost_suspended = ref([] as Student[]);
const students_suspended = ref([] as Student[]);
const def_price = ref(0);

const contents = [
  { header: "Uczniowie aktualni", data: students },
  { header: "Uczniowie o niższym priorytecie", data: students_almost_suspended },
  { header: "Uczniowie zawieszeni", data: students_suspended },
]

const FETCH_DATA = async () => {
  //students list
  try{
    const data = await window.api.executeQuery(
      "SELECT * FROM students WHERE suspended = 0 ORDER BY first_name, last_name"
    );
    students.value = data;
  }catch(err){
    setErrorToast("Błąd wczytywania uczniów", err)
  }
  //semi-suspended students list
  try{
    const data = await window.api.executeQuery(
      "SELECT * FROM students WHERE suspended = 1 ORDER BY first_name, last_name"
    );
    students_almost_suspended.value = data;
  }catch(err){
    setErrorToast("Błąd wczytywania uczniów", err)
  }
  //suspended students list
  try{
    const data = await window.api.executeQuery(
      "SELECT * FROM students WHERE suspended = 2 ORDER BY first_name, last_name"
    );
    students_suspended.value = data;
  }catch(err){
    setErrorToast("Błąd wczytywania uczniów", err)
  }

  //default price for highlighting purposes
  try{
    const data = await window.api.getSetting("default_student_price");
    def_price.value = +data.value;
  }catch(err){
    setErrorToast("Błąd wczytywania ustawień", err)
  }
}

onMounted(() => { FETCH_DATA() });

const handleDelete = async (student_id: number) => {
  if(!confirm("Na pewno?")) return;

  try{
    const [query, params] = [
      `DELETE FROM students WHERE id = ?`,
      [student_id]
    ];
    await window.api.executeQuery(query, params);
    setToast(`Uczeń usunięty`)
    FETCH_DATA();
  }catch(err){
    setErrorToast("Błąd usuwania ucznia", err)
  }
};

const handleSuspend = async (student_id: number, value: number) => {
  try{
    const [query, params] = [
      `UPDATE students SET suspended = ? WHERE id = ?`,
      [value, student_id]
    ];
    await window.api.executeQuery(query, params);
    setToast(`Zmieniono priorytet ucznia`)
    FETCH_DATA();
  }catch(err){
    setErrorToast("Błąd zmiany statusu ucznia", err)
  }
};
</script>

<template>
  <PageHeader title="Lista uczniów">
    <JumpButton icon="plus" :to="{name: 'StudentsMod', params: {id: 0}}">Dodaj</JumpButton>
  </PageHeader>

  <p class="ghost">
    Poniżej znajduje się pełna lista uczniów wpisanych do systemu.
    Możesz edytować każdego z nich lub dodać nowego.
    Wyszarzone kwoty w stawkach oznaczają, że uczeń został zapisany z domyślną stawką (patrz ustawienia).
    Pseudonimy są wykorzystywane do integracji z kalendarzem i identyfikują ucznia.
  </p>
  <p class="ghost">
    Priorytet wyświetlania uczniów jest podzielony na 3 kategorię.
    Aktualni uczniowie będą zawsze na początku listy.
  </p>

  <template v-for="(data, level) in contents">
  <h1>{{ data.header }}</h1>

  <template v-if="data.data">
    <table v-if="data.data.value.length" class="rounded">
      <thead>
        <tr>
          <th>Imię i nazwisko</th>
          <th>Pseudonim</th>
          <th>Stawka</th>
          <th>Telefon</th>
          <th>Notatka</th>
          <th>Priorytet</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="student in data.data.value" :key="student.id">
          <td>{{ student.first_name }} {{ student.last_name }}</td>
          <td>{{ student.nickname || "–" }}</td>
          <td :class="{ ghost: (def_price == student.price) }">{{ $toPln(student.price) }}</td>
          <td>{{ student.phone || "–" }}</td>
          <td>{{ student.note || "–" }}</td>
          <td>
            <div class="flex-right action-buttons">
              <Button v-if="level != 0" title="Wysoki" icon="arrow-up" @click="handleSuspend(student.id, 0)"></Button>
              <Button v-if="level != 1" title="Średni" icon="minus" @click="handleSuspend(student.id, 1)"></Button>
              <Button v-if="level != 2" title="Niski" icon="arrow-down" @click="handleSuspend(student.id, 2)"></Button>
            </div>
          </td>
          <td>
            <div class="flex-right action-buttons">
              <JumpButton title="Edytuj" icon="pencil" :to="{name: 'StudentsMod', params: {id: student.id}}"></JumpButton>
              <Button title="Usuń" icon="trash" @click="handleDelete(student.id)"></Button>
            </div>
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <th colspan="6"></th>
          <th>
            <fai :icon="['fas', 'calculator']" title="Liczba wyników" />
            {{ data.data.value.length }}
          </th>
        </tr>
      </tfoot>
    </table>
    <p v-else>
      Lista jest pusta.
    </p>
  </template>
  <Loader v-else />

  </template>

</template>

<style>
</style>
