<script setup lang="ts">
import { ref, onMounted } from "vue";
import JumpButton from "../components/JumpButton.vue";
import PageHeader from "../components/PageHeader.vue";
import { useRoute } from "vue-router";
import { Student, Session } from "../../types";
import Loader from "../components/Loader.vue";
import moment from "moment";
import { setErrorToast, setToast } from "../toastManager";
import SubPanel from "../components/SubPanel.vue";
import Input from "../components/Input.vue";
import Button from "../components/Button.vue";

const route = useRoute();
const student_id = +route.params.id;
const report_data = ref([] as (Student & Session)[]);
const tally_from = ref("");
const tally_to = ref("");

let title: string;

const updateDataSet = async () => {
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
    setErrorToast("Błąd wczytywania danych ucznia", err)
  }

  //report
  try{
    const data = await window.api.executeQuery(
      `SELECT
        SUBSTR(session_date, 1, 7) as month,
        COUNT(*) as session_count,
        SUM(duration) as session_time,
        SUM(
          CASE WHEN duration < 1 THEN duration * sessions.price * sessions.price_factor_below_1
            ELSE duration * sessions.price
          END
        ) as session_value
      FROM sessions
        JOIN students ON student_id = students.id
      WHERE student_id = ?
        AND date(session_date) >= (SELECT date(value) FROM settings WHERE name = 'tally_from')
        AND date(session_date) <= (SELECT date(value) FROM settings WHERE name = 'tally_to')
      GROUP BY month
      ORDER BY month DESC`,
      [student_id]
    );
    report_data.value = data;
  }catch(err){
    setErrorToast("Błąd wczytywania statystyk", err)
  }

  //tally from/to
  try{
    const data = await window.api.getSetting("tally_from");
    tally_from.value = data.value;
  }catch(err){
    setErrorToast("Błąd wczytywania ustawień", err)
  }
  try{
    const data = await window.api.getSetting("tally_to");
    tally_to.value = data.value;
  }catch(err){
    setErrorToast("Błąd wczytywania ustawień", err)
  }
}

onMounted(async () => {
  updateDataSet();
});

const updateFilters = (name: string, val: string) => {
  if (val.charAt(0) == "0") return;

  window.api.executeQuery(
    `UPDATE settings SET value = ? WHERE name = ?`,
    [val, `tally_${name}`]
  ).then(res => {
    setToast("Zakres filtrów zmieniony")
    updateDataSet();
  })
  .catch(err => setErrorToast("Nie udało się zmienić filtrów", err.message))
}
const setReportYear = (year: number) => {
  updateFilters("from", `${year}-01-01`)
  updateFilters("to", `${year}-12-31`)
}
</script>

<template>
  <PageHeader :title="title">
    <JumpButton :to="{name: 'TallyStudents'}" icon="angles-left"></JumpButton>
  </PageHeader>

  <p class="ghost">
    To zestawienie wpłat danego ucznia z podziałem na miesiące.
  </p>

  <SubPanel title="Zakres zestawienia">
    <div class="flex-right h-center inputs-in-line">
      <Input type="date" name="date_from" :value="tally_from" label="Od" @change="updateFilters('from', $event.target.value)"/>
      <Input type="date" name="date_to" :value="tally_to" label="Do" @change="updateFilters('to', $event.target.value)" />
      <Button icon="calendar" @click="(ev) => setReportYear(moment().year())">{{ moment().year() }}</Button>
      <Button icon="calendar" @click="(ev) => setReportYear(moment().year() - 1)">{{ moment().year() - 1 }}</Button>
    </div>
  </SubPanel>

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
            <fai :icon="['fas', 'calculator']" title="Liczba wyników" />
            {{ report_data.length }}
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

<style>
</style>
