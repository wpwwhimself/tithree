<script setup lang="ts">
import logo from "../assets/t3_color.svg";
const APP_NAME = import.meta.env.VITE_APP_NAME;
</script>

<template>
  <footer class="flex-right v-center">
    <router-link to="/">
      <img :src="logo" :alt="APP_NAME" />
    </router-link>
    <div id="app-info">
      <h2>{{ APP_NAME }}</h2>
      <p>Made by Wojciech Przybyła</p>
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
h2, p{
  margin: 0;
}
img{
  height: 3em;
}

#app-info{
  text-align: right;
}
</style>
