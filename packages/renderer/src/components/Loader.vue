<script setup lang="ts">
</script>

<template>
  <div class="flex-down h-center v-center">
    <span class="icon ghost">
      <fai :icon="['fas', 'cog']" spin></fai>
    </span>
    <h2>Wczytuję...</h2>
  </div>
</template>

<style scoped>
.icon{
  font-size: 4em;
  padding: 0 0.5em;
}
span, h1, h2{
  margin: 0;
}
h1::before, h1::after{
  content: "===";
  color: hsl(var(--acc));
  padding: 0.5em;
}
</style>
