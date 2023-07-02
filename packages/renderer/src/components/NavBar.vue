<script setup lang="ts">
import JumpButton from './JumpButton.vue';
const APP_NAME = import.meta.env.VITE_APP_NAME;
</script>

<template>
  <nav class="flex-right v-center">
    <h1>
      <router-link to="/">{{ APP_NAME }}</router-link>
    </h1>
    <jump-button icon="calendar" to="/today">Na dziś</jump-button>
    <jump-button icon="users" to="/students">Uczniowie</jump-button>
  </nav>
</template>

<style scoped>
nav{
  background-color: hsl(var(--bga));
  padding: 1em;
}
h1 a{
  color: hsl(var(--fg));
  text-decoration: none;
}
</style>
