<script lang="ts" setup>
import NavBar from "./components/NavBar.vue";
import Footer from "./components/Footer.vue";
</script>

<template>
  <NavBar />
  <!-- route outlet -->
  <!-- component matched by the route will render here -->
  <div id="wrapper">
    <router-view />
  </div>
  <Footer />
</template>

<style>
</style>
