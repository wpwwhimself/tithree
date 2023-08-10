<script setup lang="ts">
import logo_big from "../assets/t3_full_color.svg";
</script>

<template>
  <div id="wrap">
    <img :src="logo_big" alt="Tithree Logo">
    <p>Aplikacja podliczająca zarobki korepetytora</p>
    <p>Pierwsza wersja: <strong>lato 2023</strong></p>
    <p>Widzisz błąd? Chcesz zaproponować nową funkcjonalność? Napisz na <a href="mailto:contact@wpww.pl" target="_blank">contact@wpww.pl</a></p>
  </div>
</template>

<style scoped>
img{
  max-width: 600px;
}
#wrap{
  text-align: center;
}
</style>
