<script setup lang="ts">
import { ref, onMounted, Ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import Button from "../components/Button.vue";
import PageHeader from "../components/PageHeader.vue";
import Input from "../components/Input.vue";
import { Student } from "../../types";
import Loader from "../components/Loader.vue";

const [route, router] = [useRoute(), useRouter()];
const student_id = +route.params.id;
const student = ref({} as Student);

let title: string;
let first_name = ref("");
let last_name = ref("");
let nickname = ref("");
let price = ref("");
let phone = ref("");
let note = ref("");

onMounted(async () => {
  if(student_id > 0){
    try{
      const data = await window.api.executeQuery(
        `SELECT * FROM students WHERE id = ?`,
        [student_id]
      );
      student.value = data[0];
    }catch(err){
      console.error(err);
    }

    title = `${student.value.first_name} ${student.value.last_name} | Edycja ucznia`;
    first_name = ref(student.value.first_name);
    last_name = ref(student.value.last_name);
    nickname = ref(student.value.nickname || "");
    price = ref(student.value.price.toString());
    phone = ref(student.value.phone || "");
    note = ref(student.value.note || "");
  }else{
    try{
      const data = await window.api.getSetting('default_student_price');
      price.value = data.value;
    }catch(err){
      console.error(err);
    }
  }
});

const handleSubmit = async (e: Event) => {
  e.preventDefault();

  const is_update = (student_id != 0)

  try{
    const [query, params] = (!is_update)
      ? [
          `INSERT INTO students (first_name, last_name, nickname, price, phone, note) VALUES(?, ?, ?, ?, ?, ?)`,
          [first_name.value, last_name.value, nickname.value, price.value, phone.value || null, note.value || null]
        ]
      : [
          `UPDATE students SET first_name = ?, last_name = ?, nickname = ?, price = ?, phone = ?, note = ?, updated_at = datetime() WHERE id = ?`,
          [first_name.value, last_name.value, nickname.value || null, price.value, phone.value || null, note.value || null, student_id]
        ];
    await window.api.executeQuery(query, params);
    router.push({
      name: "ActionSummary",
      params: {
        action: (is_update) ? "Dane ucznia poprawione" : "Uczeń dodany",
        target: "Students"
      }
    });
  }catch(err){
    console.error(err);
  }
};

const updateRef = (target: string, val: string) => {
  const refTable = {
    first_name: first_name,
    last_name: last_name,
    nickname: nickname,
    price: price,
    phone: phone,
    note: note,
  };

  refTable[target as keyof typeof refTable].value = val;
}
</script>

<template>
  <div v-if="student || student_id == 0">
    <PageHeader v-if="student_id > 0" :title="title"></PageHeader>
    <PageHeader v-else title="Nowy uczeń"></PageHeader>
    <form @submit="handleSubmit">
      <Input name="first_name" :value="first_name" label="Imię" required @input="updateRef('first_name', $event.target.value)" />
      <Input name="last_name" :value="last_name" label="Nazwisko" @input="updateRef('last_name', $event.target.value)" />
      <Input name="nickname" :value="nickname" label="Pseudonim" @input="updateRef('nickname', $event.target.value)" />
      <Input type="number" min="0" step="0.01" :value="price" name="price" label="Stawka [zł]" required @input="updateRef('price', $event.target.value)"/>
      <Input name="phone" :value="phone" label="Numer telefonu" @input="updateRef('phone', $event.target.value)" />
      <Input name="note" :value="note" label="Notatka" @input="updateRef('note', $event.target.value)" />
      <Button icon="check" type="submit">Zatwierdź</Button>
    </form>
  </div>
  <Loader v-else />
</template>

<style>

</style>
