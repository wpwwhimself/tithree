<script setup lang="ts">
import { ref, onMounted } from "vue";
import JumpButton from "../components/JumpButton.vue";
import PageHeader from "../components/PageHeader.vue";
import { Session } from "types";

const months = ref([] as Session[]);
let totals = {
  count: 0,
  time: 0,
  value: 0,
};

onMounted(async () => {
  try{
    const data = await window.api.executeQuery(
      `SELECT
        SUBSTR(session_date, 1, 7) as id,
        COUNT(*) as session_count,
        SUM(duration) as session_time,
        SUM(price * duration) as session_value
      FROM sessions
      GROUP BY 1
      ORDER BY 1 DESC`
    ); //TODO FORMULA FOR CALCULATING PRICE
    months.value = data;

    for(let month of months.value){
      totals.count += month.session_count!;
      totals.time += month.session_time!;
      totals.value += month.session_value!;
    }
  }catch(err){
    console.error(err);
  }
});
</script>

<template>
  <PageHeader title="Podliczenie okresów">
    <JumpButton :to="{name: 'Tally'}" icon="angles-left"></JumpButton>
  </PageHeader>

  <template v-if="months">
    <table v-if="months.length" class="rounded">
      <thead>
        <tr>
          <th>Miesiąc</th>
          <th>Sesje</th>
          <th>Czas</th>
          <th>Suma</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="month in months" :key="month.id">
          <td>{{ month.id }}</td>
          <td>{{ month.session_count }}</td>
          <td>{{ month.session_time }} h</td>
          <td>{{ $toPln(month.session_value) }}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <th>
            <fai :icon="['fas', 'calculator']" />
          </th>
          <th>{{ totals.count }}</th>
          <th>{{ totals.time }} h</th>
          <th>{{ $toPln(totals.value) }}</th>
        </tr>
      </tfoot>
    </table>
    <p v-else>
      Lista jest pusta. Brakuje sesji.
    </p>
  </template>
  <h2 v-else>Wczytuję...</h2>
</template>

<style>
</style>
