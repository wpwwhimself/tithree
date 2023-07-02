<script setup lang="ts">
const APP_NAME = import.meta.env.VITE_APP_NAME;
</script>

<template>
  <nav class="flex-right v-center">
    <h1>
      <router-link to="/">{{ APP_NAME }}</router-link>
    </h1>
    <router-link to="/today">Na dziś</router-link>
    <router-link to="/students">Dzieciaki</router-link>
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
