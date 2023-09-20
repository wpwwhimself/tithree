<script setup lang="ts">
defineProps(["icon"]);
</script>

<template>
  <button class="flex-right v-center rounded animate clickable" :="$attrs">
    <fai :icon="['fas', icon]" />
    <slot />
  </button>
</template>

<style scoped>
button{
  font-family: Kurale;
  background: none;
  color: hsl(var(--fg));
  border: 3px solid hsl(var(--acc));
  font-size: 1rem;
  padding: 0.2em 0.5em;
}
button:hover{
  background: hsl(var(--acc));
}
button:active{
  background: hsl(var(--fg));
  color: hsl(var(--bg1));
}
</style>
