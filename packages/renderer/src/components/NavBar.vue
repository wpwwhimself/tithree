<script setup lang="ts">
import logo from "../assets/t3_color.svg";
import JumpButton from './JumpButton.vue';
const APP_NAME = import.meta.env.VITE_APP_NAME;
</script>

<template>
  <nav class="flex-right v-center">
    <router-link to="/">
      <img :src="logo" :alt="APP_NAME" />
    </router-link>
    <jump-button icon="clock-rotate-left" :to="{name: 'Sessions'}">Sesje</jump-button>
    <jump-button icon="users" :to="{name: 'Students'}">Uczniowie</jump-button>
    <jump-button icon="chart-line" :to="{name: 'Tally'}">Podliczenia</jump-button>
    <jump-button icon="cog" :to="{name: 'Settings'}">Ustawienia</jump-button>
  </nav>
</template>

<style scoped>
nav{
  background-color: hsla(var(--acc), 35%);
  padding: 1em;
}
h1 a{
  color: hsl(var(--fg));
  text-decoration: none;
}
img{
  height: 3em;
}
</style>
