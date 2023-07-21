<script setup lang="ts">
defineProps(["title"]);
</script>

<template>
  <div class="sub-panel rounded">
    <h2>{{ title }}</h2>
    <slot />
  </div>
</template>

<style scoped>
.sub-panel{
  justify-content: space-between;
  border: 0.3em dashed hsl(var(--bg2));
  padding: 0.5em 2em;
  margin: 0.5em 0;
}
h2{
  margin: 0;
}
</style>
