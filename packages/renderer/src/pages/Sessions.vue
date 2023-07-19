<script setup lang="ts">
import { ref, onMounted } from "vue";
import Button from "../components/Button.vue";
import JumpButton from "../components/JumpButton.vue";
import PageHeader from "../components/PageHeader.vue";
import { useRouter } from "vue-router";
import { Session } from "../../types";

const router = useRouter();
const sessions = ref([] as Session[]);

onMounted(async () => {
  try{
    const data = await window.api.executeQuery(
      `SELECT
        sessions.*,
        first_name || ' ' || last_name as student_name,
        coalesce(price_override, students.price) as session_price
      FROM sessions
        JOIN students ON student_id = students.id
      ORDER BY session_date DESC, sessions.created_at DESC`
    );
    sessions.value = data;
  }catch(err){
    console.error(err);
  }
});

const handleDelete = async (session_id: number) => {
  if(!confirm("Na pewno?")) return;

  try{
    const [query, params] = [
      `DELETE FROM sessions WHERE id = ?`,
      [session_id]
    ];
    await window.api.executeQuery(query, params);
    router.push({
      name: "ActionSummary",
      params: {
        action: "Sesja usunięta",
        target: "Sessions",
      }
    });
  }catch(err){
    console.error(err);
  }
};
</script>

<template>
  <PageHeader title="Ostatnie sesje">
    <JumpButton icon="plus" :to="{name: 'SessionsMod', params: {id: 0}}">Dodaj</JumpButton>
  </PageHeader>

  <template v-if="sessions">
    <table v-if="sessions.length" class="rounded">
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
        <template v-for="(sessions_gr, key) of $group(sessions, 'session_date')">
          <tr>
            <td colspan="5" class="accent">{{ key }}</td>
          </tr>
          <tr v-for="session in sessions_gr" :key="session.id">
            <td>{{ session.student_name }}</td>
            <td class="ghost">{{ session.duration }}</td>
            <td class="ghost">{{ $toPln(session.session_price) }}</td>
            <td>{{ $toPln(session.session_price * session.duration) }}</td>
            <td class="flex-right action-buttons">
              <JumpButton icon="pencil" :to="{name: 'SessionsMod', params: {id: session.id}}"></JumpButton>
              <Button icon="trash" @click="handleDelete(session.id)"></Button>
            </td>
          </tr>
        </template>
      </tbody>
      <tfoot>
        <tr>
          <th colspan="4"></th>
          <th>
            <fai :icon="['fas', 'calculator']" />
            {{ sessions.length }}
          </th>
        </tr>
      </tfoot>
    </table>
    <p v-else>
      Lista jest pusta. Utwórz nową sesję przyciskiem powyżej.
    </p>
  </template>
  <h2 v-else>Wczytuję...</h2>
</template>
