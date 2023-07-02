<script setup lang="ts">
const APP_NAME = import.meta.env.VITE_APP_NAME;
</script>

<template>
  <footer class="flex-right v-center">
    <div id="app-info">
      <h2>{{ APP_NAME }}</h2>
      <p>Made with ♥️ by Wojciech Przybyła</p>
    </div>
  </footer>
</template>

<style scoped>
footer{
  flex-direction: row-reverse;
  background-color: hsl(0, 0%, 0%);
  color: hsl(0, 0%, 100%);
  flex-shrink: 0;
  padding: 0.5em 1em;
}

#app-info{
  text-align: right;
}
</style>
