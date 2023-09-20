<script setup lang="ts">
import { ref, onMounted } from "vue";
import Button from "../components/Button.vue";
import JumpButton from "../components/JumpButton.vue";
import PageHeader from "../components/PageHeader.vue";
import SubPanel from "../components/SubPanel.vue";
import Input from "../components/Input.vue";
import { useRouter } from "vue-router";
import { Session } from "../../types";
import moment from "moment";
import Loader from "../components/Loader.vue";
import { setErrorToast, setToast } from "../toastManager";

const router = useRouter();
const sessions = ref([] as Session[]);
let sessions_f = ref([] as Session[]);
const [filter_from, filter_to] = [
  ref(moment().subtract(1, "month").format("YYYY-MM-DD")),
  ref(moment().format("YYYY-MM-DD")),
];
const updateFilters = (name: string, val: string) => {
  switch(name){
    case "from": filter_from.value = val; break;
    case "to": filter_to.value = val; break;
  }
  updateDataSet();
}
const updateDataSet = () =>
  sessions_f.value = sessions.value.filter(ses =>
    moment(ses.session_date).isBetween(filter_from.value, filter_to.value, undefined, "[]")
  );

const FETCH_DATA = async () => {
  try{
    const data = await window.api.executeQuery(
      `SELECT
        sessions.*,
        first_name || ' ' || last_name as student_name,
        CASE WHEN duration < 1 THEN duration * sessions.price * (SELECT value FROM settings WHERE name = 'price_factor_below_1')
          ELSE duration * sessions.price
        END as session_value
      FROM sessions
        JOIN students ON student_id = students.id
      ORDER BY session_date DESC, sessions.created_at DESC`
    );
    sessions.value = data;
    updateDataSet();
  }catch(err){
    setErrorToast("Błąd wczytywania sesji", err)
  }
}

onMounted(() => { FETCH_DATA() });

const handleDelete = async (session_id: number) => {
  if(!confirm("Na pewno?")) return;

  try{
    const [query, params] = [
      `DELETE FROM sessions WHERE id = ?`,
      [session_id]
    ];
    await window.api.executeQuery(query, params);
    setToast("Sesja usunięta")
    FETCH_DATA();
  }catch(err){
    setErrorToast("Błąd usuwania sesji", err)
  }
};
</script>

<template>
  <PageHeader title="Ostatnie sesje">
    <JumpButton icon="plus" :to="{name: 'SessionsMod', params: {id: 0}}">Dodaj</JumpButton>
  </PageHeader>

  <p class="ghost">
    Na liście poniżej znajdziesz odbyte już sesje ze wskazanego przedziału czasowego.
    Możesz go zmieniać za pomocą filtrów poniżej.
    Z tego miejsca możesz też dodać nową odbytą już sesję.
  </p>

  <SubPanel title="Filtry">
    <div class="flex-right h-center inputs-in-line">
      <Input type="date" name="date_from" :value="filter_from" label="Od" @change="updateFilters('from', $event.target.value)"/>
      <Input type="date" name="date_to" :value="filter_to" label="Do" @change="updateFilters('to', $event.target.value)" />
    </div>
  </SubPanel>

  <template v-if="sessions">
    <table v-if="sessions_f.length" class="rounded">
      <thead>
        <tr>
          <th>Uczeń</th>
          <th>h</th>
          <th>Stawka</th>
          <th>Razem</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(sessions_gr, key) of $group(sessions_f, 'session_date')">
          <tr>
            <td colspan="5" class="accent">{{ key }}</td>
          </tr>
          <tr v-for="session in sessions_gr" :key="session.id">
            <td>{{ session.student_name }}</td>
            <td class="ghost">{{ session.duration }}</td>
            <td class="ghost">{{ $toPln(session.price) }}</td>
            <td>{{ $toPln(session.session_value) }}</td>
            <td class="flex-right action-buttons">
              <JumpButton title="Edytuj" icon="pencil" :to="{name: 'SessionsMod', params: {id: session.id}}"></JumpButton>
              <Button title="Usuń" icon="trash" @click="handleDelete(session.id)"></Button>
            </td>
          </tr>
        </template>
      </tbody>
      <tfoot>
        <tr>
          <th colspan="4"></th>
          <th>
            <fai :icon="['fas', 'calculator']" title="Liczba wyników" />
            {{ sessions_f.length }}
          </th>
        </tr>
      </tfoot>
    </table>
    <p v-else>
      Lista jest pusta. Utwórz nową sesję przyciskiem powyżej lub sprawdź filtry.
    </p>
  </template>
  <Loader v-else />
</template>
