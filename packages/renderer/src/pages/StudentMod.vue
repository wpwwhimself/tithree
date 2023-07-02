<script setup>
import { ref, onMounted } from "vue";
import Button from "../components/Button.vue";
import PageHeader from "../components/PageHeader.vue";
import Input from "../components/Input.vue";

const title = "Nowy uczeń";

const first_name = ref("");
const last_name = ref("");
const price = ref("");

const handleSubmit = async () => {
  try{
    await window.api.executeQuery(
      `INSERT INTO students (first_name, last_name, price)
      VALUES(?, ?, ?)`,
      [first_name.value, last_name.value, price.value]
    );
  }catch(err){
    console.error(err);
  }
};

const updateFirstName = (val) => first_name.value = val;
const updateLastName = (val) => last_name.value = val;
const updatePrice = (val) => price.value = val;
</script>

<template>
  <PageHeader :title="title"></PageHeader>
  <form @submit="handleSubmit">
    <Input name="first_name" :value="first_name" label="Imię" required @input="updateFirstName($event.target.value)" />
    <Input name="last_name" :value="last_name" label="Nazwisko" @input="updateLastName($event.target.value)" />
    <Input type="number" min="0" step="0.01" :value="price" name="price" label="Stawka [zł]" required @input="updatePrice($event.target.value)"/>
    <Button icon="check" type="submit">Zatwierdź</Button>
  </form>
</template>

<style>

</style>
