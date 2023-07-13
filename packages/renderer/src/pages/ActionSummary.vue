<script setup lang="ts">
import JumpButton from '../components/JumpButton.vue';
import { useRoute } from "vue-router";

const route = useRoute();
const [action, target] = [route.params.action, route.params.target];
</script>

<template>
  <h1>
    <fai :icon="['fas', 'check']"></fai>
    {{ action }}
  </h1>
  <JumpButton icon="chevron-left" :to="{name: target}">Wróć</JumpButton>
</template>

<style scoped>
h1{
  text-align: center;
  padding: 0.5em;
}
h1::before, h1::after{
  content: "===";
  color: hsl(var(--acc));
  padding: 0.5em;
}
</style>
