<script setup lang="ts">
import BigSplash from '../components/BigSplash.vue';
import JumpButton from '../components/JumpButton.vue';
import { useRoute } from "vue-router";

const route = useRoute();
const [action, target] = [route.params.action, route.params.target];
</script>

<template>
  <BigSplash icon="check" :title="(action as string)" />
  <JumpButton icon="chevron-left" :to="{name: target}">Wróć</JumpButton>
</template>
