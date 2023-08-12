<script setup lang="ts">
defineProps(["title"]);
</script>

<template>
  <div class="page-header flex-right v-center rounded">
    <h1>{{ title }}</h1>
    <div class="buttons-container flex-right">
      <slot />
    </div>
  </div>
</template>

<style>
.page-header{
  justify-content: space-between;
  background-color: hsl(var(--bg2));
  padding: 0.5em 2em;
  margin-bottom: 0.5em;
}
.page-header h1{
  margin: 0;
}
.page-header button{
  padding: 0.5em;
}
</style>
