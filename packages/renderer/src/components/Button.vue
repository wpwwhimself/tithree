<script setup lang="ts">
defineProps(["icon"]);
</script>

<template>
  <button class="flex-right v-center rounded" :="$attrs">
    <fai :icon="['fas', icon]" />
    <slot />
  </button>
</template>

<style scoped>
button{
  font-family: Kalam;
  background: none;
  color: hsl(var(--fg));
  border: 3px solid hsl(var(--acc));
  cursor: pointer;
  font-size: 1rem;
}
button:hover{
  background: hsl(var(--acc));
}
button:active{
  background: hsl(var(--fg));
}
</style>
