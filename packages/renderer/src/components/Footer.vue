<script setup lang="ts">
import logo from "../assets/t3_color.svg";
const APP_NAME = import.meta.env.VITE_APP_NAME;
</script>

<template>
  <footer class="flex-right v-center">
    <div id="app-info" class="flex-right">
      <router-link to="/about">
        <h2>{{ APP_NAME }}</h2>
      </router-link>
      <p>Made by <a href="http://wpww.pl/" target="_blank">Wojciech Przybyła</a></p>
    </div>
    <!-- <router-link to="/"> -->
      <img :src="logo" :alt="APP_NAME" />
    <!-- </router-link> -->
  </footer>
</template>

<style scoped>
footer{
  flex-direction: row;
  justify-content: space-between;
  background-color: hsl(0, 0%, 0%);
  color: hsl(0, 0%, 100%);
  flex-shrink: 0;
  padding: 0.2em 1em;
}
h2, p{
  margin: 0;
}
h2, img{
  --height: 1.1em;
  font-size: var(--height);
  height: var(--height);
}
img{
  filter: brightness(2)
}

#app-info{
  align-items: baseline;
}
</style>
