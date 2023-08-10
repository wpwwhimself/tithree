<script lang="ts" setup>
import NavBar from "./components/NavBar.vue";
import Footer from "./components/Footer.vue";
import {ref, onBeforeMount} from "vue";

const accent_color = ref("10, 50%, 50%");
const theme = ref("light");
onBeforeMount(async () => {
  let data = await window.api.getSetting("accent_color");
  accent_color.value = data.value;
  window.ipcRenderer.send("set-window-color", data.value);

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
  overflow: hidden;
}
#wrapper{
  flex: 1 0 auto;
  margin: 1em auto;
  width: 90vw;
  height: calc(100vh - 8em);
  overflow: auto;
  padding: 1em;
}
</style>
