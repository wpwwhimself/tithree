<script setup lang="ts">
import { ref, onMounted } from "vue";
import JumpButton from "../components/JumpButton.vue";
import PageHeader from "../components/PageHeader.vue";
import SubPanel from "../components/SubPanel.vue";
import ColPlot from "../components/ColPlot.vue";
import { Session } from "../../types";
import Loader from "../components/Loader.vue";
import { setErrorToast, setToast } from "../toastManager";
import Input from "../components/Input.vue";

const months = ref([] as Session[]);
const weekly = ref([] as Session[]);
const tally_from = ref("");
const tally_to = ref("");
let totals = {
  count: 0,
  time: 0,
  value: 0,
};
const WEEKS_PER_MONTH = 365 / 7 / 12;
const WEEKS_BACK = 6;

const updateDataSet = async () => {
  try{
    const data = await window.api.executeQuery(
      `WITH RECURSIVE months as (
        SELECT date((SELECT date(value) FROM settings WHERE name = 'tally_from')) as date
        UNION ALL
        SELECT date(date, '+1 month') as date
        FROM months
        WHERE date(date) < min(date('now', 'start of month'), (SELECT date(value, 'start of month') FROM settings WHERE name = 'tally_to'))
      )
      SELECT
        SUBSTR(date, 1, 7) as id,
        COALESCE(sum(duration), 0) as session_time,
        COALESCE(sum(
          CASE WHEN duration < 1 THEN duration * price * (SELECT value FROM settings WHERE name = 'price_factor_below_1')
            ELSE duration * price
          END
        ), 0) as session_value
      FROM months
        LEFT JOIN sessions ON SUBSTR(date, 1, 7) = substr(session_date, 1, 7)
          AND coalesce(session_date, date) >= (SELECT date(value) FROM settings WHERE name = 'tally_from')
          AND session_date <= (SELECT date(value) FROM settings WHERE name = 'tally_to')
      GROUP BY 1
      ORDER BY 1`
    );
    months.value = data;

    for(let month of months.value){
      totals.count += month.session_count!;
      totals.time += month.session_time!;
      totals.value += month.session_value!;
    }
  }catch(err){
    setErrorToast("Błąd wczytywania statystyk", err)
  }

  //weekly data
  window.api.executeQuery(
    `WITH RECURSIVE weeks as (
      SELECT date('now') as date
      UNION ALL
      SELECT date(date, '-7 days') as date
      FROM weeks
      LIMIT ${WEEKS_BACK + 1}
    )
    SELECT
      'tydz. ' || strftime('%W', date) as label,
      strftime('%W', date) as week,
      coalesce(sum(
          CASE WHEN duration < 1 THEN duration * price * (SELECT value FROM settings WHERE name = 'price_factor_below_1')
            ELSE duration * price
          END
        ), 0) as session_value
    FROM weeks
      LEFT JOIN sessions ON week = strftime('%W', session_date)
    GROUP BY 1
    LIMIT ${WEEKS_BACK}`
  ).then(data => { weekly.value = data })
  .catch(err => { setErrorToast("Błąd wczytywania statystyk", err) })

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
</script>

<template>
  <PageHeader title="Podliczenie okresów">
    <JumpButton :to="{name: 'Tally'}" icon="angles-left"></JumpButton>
  </PageHeader>

  <h1>Ostatnie tygodnie</h1>
  <p class="ghost">
    Poniżej znajdziesz zestawienie przychodów z ostatnich kilku tygodni.
  </p>

  <template v-if="weekly">
    <template v-if="weekly.length">
      <ColPlot :data="weekly" :axes="['label', 'session_value']" :as-pln="true"></ColPlot>
    </template>
    <p v-else>Lista jest pusta. Brakuje sesji.</p>
  </template>
  <Loader v-else />

  <h1>Długi okres</h1>
  <p class="ghost">
    Poniżej znajdziesz zestawienie przychodów na podstawie dostępnej historii,
    z podziałem na miesiące. Wykres
  </p>

  <SubPanel title="Zakres zestawienia">
    <div class="flex-right h-center inputs-in-line">
      <Input type="date" name="date_from" :value="tally_from" label="Od" @change="updateFilters('from', $event.target.value)" min="2020-01-01" />
      <Input type="date" name="date_to" :value="tally_to" label="Do" @change="updateFilters('to', $event.target.value)" min="2020-01-01" />
    </div>
  </SubPanel>

  <template v-if="months">
    <template v-if="months.length">
      <ColPlot :data="months.slice(-12)" :axes="['id', 'session_value']" :as-pln="true"></ColPlot>

      <table class="rounded">
        <thead>
          <tr>
            <th>Miesiąc</th>
            <th>Czas</th>
            <th>Suma</th>
            <th>Średnia tyg.</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="month in months" :key="month.id">
            <td>{{ month.id }}</td>
            <td>{{ month.session_time }} h</td>
            <td>{{ $toPln(month.session_value) }}</td>
            <td>{{ $toPln(month.session_value! / 4) }}</td>
          </tr>
        </tbody>
      </table>

      <SubPanel title="Podsumowanie">
        <table class="no-border">
          <thead>
            <tr>
              <th></th>
              <th>Czas</th>
              <th>Suma</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Sumy</td>
              <td>{{ totals.time }} h</td>
              <td>{{ $toPln(totals.value) }}</td>
            </tr>
            <tr>
              <td>Średnie miesięczne</td>
              <td>{{ $round(totals.time / months.length) }} h</td>
              <td>{{ $toPln(totals.value / months.length) }}</td>
            </tr>
            <tr>
              <td>Średnie tygodniowe</td>
              <td>{{ $round(totals.time / (months.length * WEEKS_PER_MONTH)) }} h</td>
              <td>{{ $toPln(totals.value / (months.length * WEEKS_PER_MONTH)) }}</td>
            </tr>
          </tbody>
        </table>
      </SubPanel>
    </template>
    <p v-else>
      Lista jest pusta. Brakuje sesji.
    </p>
  </template>
  <Loader v-else />
</template>

<style>
</style>
