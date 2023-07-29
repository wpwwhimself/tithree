<script lang="ts" setup>
import NavBar from "./components/NavBar.vue";
import Footer from "./components/Footer.vue";
import {ref, onBeforeMount} from "vue";

const accent_color = ref("10, 50%, 50%");
const theme = ref("light");
onBeforeMount(async () => {
  let data = await window.api.getSetting("accent_color");
  accent_color.value = data.value;

  data = await window.api.getSetting("dark_mode");
  theme.value = !!(+data.value) ? "dark" : "light";
})
</script>

<template>
  <div id="app-container" :data-theme="theme">
    <NavBar />
    <!-- route outlet -->
    <!-- component matched by the route will render here -->
    <div id="wrapper">
      <router-view />
    </div>
    <Footer />
  </div>
</template>

<style>
#app-container{
  --acc: v-bind(accent_color);
}
</style>
