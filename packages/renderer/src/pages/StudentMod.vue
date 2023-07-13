<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import Button from "../components/Button.vue";
import PageHeader from "../components/PageHeader.vue";
import Input from "../components/Input.vue";

const [route, router] = [useRoute(), useRouter()];
const student_id = +route.params.id;
const student = ref(null);

let title;
let first_name = ref("");
let last_name = ref("");
let price = ref("");

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
    price = ref(student.value.price.toString());
  };
});

const handleSubmit = async (e) => {
  e.preventDefault();

  const is_update = (student_id != 0)

  try{
    const [query, params] = (!is_update)
      ? [
          `INSERT INTO students (first_name, last_name, price) VALUES(?, ?, ?)`,
          [first_name.value, last_name.value, price.value]
        ]
      : [
          `UPDATE students SET first_name = ?, last_name = ?, price = ?, updated_at = datetime() WHERE id = ?`,
          [first_name.value, last_name.value, price.value, student_id]
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

const updateFirstName = (val) => first_name.value = val;
const updateLastName = (val) => last_name.value = val;
const updatePrice = (val) => price.value = val;
</script>

<template>
  <div v-if="student || student_id == 0">
    <PageHeader v-if="student_id > 0" :title="title"></PageHeader>
    <PageHeader v-else title="Nowy uczeń"></PageHeader>
    <form @submit="handleSubmit">
      <Input name="first_name" :value="first_name" label="Imię" required @input="updateFirstName($event.target.value)" />
      <Input name="last_name" :value="last_name" label="Nazwisko" @input="updateLastName($event.target.value)" />
      <Input type="number" min="0" step="0.01" :value="price" name="price" label="Stawka [zł]" required @input="updatePrice($event.target.value)"/>
      <Button icon="check" type="submit">Zatwierdź</Button>
    </form>
  </div>
  <div v-else>
    <h2>Wczytywanie...</h2>
  </div>
</template>

<style>

</style>
