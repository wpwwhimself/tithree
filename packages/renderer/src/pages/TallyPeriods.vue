<script setup lang="ts">
import { ref, onMounted } from "vue";
import JumpButton from "../components/JumpButton.vue";
import PageHeader from "../components/PageHeader.vue";
import SubPanel from "../components/SubPanel.vue";
import ColPlot from "../components/ColPlot.vue";
import { Session } from "../../types";
import Loader from "../components/Loader.vue";
import moment from "moment";
import { setErrorToast } from "../toastManager";

const months = ref([] as Session[]);
const tally_from = ref("");
const tally_to = ref("");
let totals = {
  count: 0,
  time: 0,
  value: 0,
};
const WEEKS_PER_MONTH = 365 / 7 / 12;

onMounted(async () => {
  try{
    const data = await window.api.executeQuery(
      `SELECT
        SUBSTR(session_date, 1, 7) as id,
        COUNT(*) as session_count,
        SUM(duration) as session_time,
        SUM(
          CASE WHEN duration < 1 THEN duration * price * (SELECT value FROM settings WHERE name = 'price_factor_below_1')
            ELSE duration * price
          END
        ) as session_value
      FROM sessions
      WHERE date(session_date) >= (SELECT date(value) FROM settings WHERE name = 'tally_from')
        AND date(session_date) <= (SELECT date(value) FROM settings WHERE name = 'tally_to')
      GROUP BY 1
      ORDER BY 1 ASC`
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
});
</script>

<template>
  <PageHeader title="Podliczenie okresów">
    <JumpButton :to="{name: 'Tally'}" icon="angles-left"></JumpButton>
  </PageHeader>

  <p class="ghost">
    Poniżej znajdziesz zestawienie przychodów na podstawie dostępnej historii,
    z podziałem na miesiące.
  </p>

  <template v-if="months">
    <p v-if="tally_from && tally_to">
      Zestawienie generowane jest na podstawie wpisów od {{ moment(tally_from).format("D.MM.YYYY") }} do {{ moment(tally_to).format("D.MM.YYYY") }}.
      Zakres tych dat możesz zmienić w ustawieniach.
    </p>

    <template v-if="months.length">
      <ColPlot :data="months.slice(0, 12)" :axes="['id', 'session_value']" :as-pln="true"></ColPlot>

      <table class="rounded">
        <thead>
          <tr>
            <th>Miesiąc</th>
            <th>Sesje</th>
            <th>Czas</th>
            <th>Suma</th>
            <th>Średnia tyg.</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="month in months" :key="month.id">
            <td>{{ month.id }}</td>
            <td>{{ month.session_count }}</td>
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
              <th>Sesje</th>
              <th>Czas</th>
              <th>Suma</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Sumy</td>
              <td>{{ totals.count }}</td>
              <td>{{ totals.time }} h</td>
              <td>{{ $toPln(totals.value) }}</td>
            </tr>
            <tr>
              <td>Średnie miesięczne</td>
              <td>{{ $round(totals.count / months.length) }}</td>
              <td>{{ $round(totals.time / months.length) }} h</td>
              <td>{{ $toPln(totals.value / months.length) }}</td>
            </tr>
            <tr>
              <td>Średnie tygodniowe</td>
              <td>{{ $round(totals.count / (months.length * WEEKS_PER_MONTH)) }}</td>
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
