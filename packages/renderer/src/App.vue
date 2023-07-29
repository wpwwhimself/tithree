<script lang="ts" setup>
import NavBar from "./components/NavBar.vue";
import Footer from "./components/Footer.vue";
import {ref, onBeforeMount} from "vue";

const accent_color = ref("10, 50%, 50%");
onBeforeMount(async () => {
  const data = await window.api.getSetting("accent_color");
  accent_color.value = data.value;
})
</script>

<template>
  <div id="app-container">
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
