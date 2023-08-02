<script setup lang="ts">
import { useRoute } from "vue-router";
import logo from "../assets/t3_color.svg";
import JumpButton from './JumpButton.vue';
const APP_NAME = import.meta.env.VITE_APP_NAME;
const route = useRoute();
const page_names = {
  About: "O aplikacji",
  Sessions: "Sesje",
  SessionsMod: "Edycja sesji",
  Students: "Uczniowie",
  StudentsMod: "Edycja ucznia",
  Tally: "Podliczanie",
  TallyStudents: "Podliczanie po uczniach",
  TallyStudentDetails: "Podliczanie po uczniu",
  TallyPeriods: "Podliczanie po okresach",
  Settings: "Ustawienia",
  Calendar: "Kalendarz",
  ActionSummary: "Gotowe!",
};
</script>

<template>
  <header>
    <div id="dragger">
      <span v-if="route.name == 'Home'" class="script">{{ APP_NAME }}</span>
      <template v-else>
        <span>{{ page_names[route.name as keyof typeof page_names] }}</span>
        <small class="ghost script">{{ APP_NAME }}</small>
      </template>
    </div>
    <nav class="flex-right v-center">
      <router-link to="/">
        <img :src="logo" :alt="APP_NAME" />
      </router-link>
      <jump-button icon="calendar" :to="{name: 'Calendar'}">Kalendarz</jump-button>
      <jump-button icon="clock-rotate-left" :to="{name: 'Sessions'}">Sesje</jump-button>
      <jump-button icon="users" :to="{name: 'Students'}">Uczniowie</jump-button>
      <jump-button icon="chart-line" :to="{name: 'Tally'}">Podliczenia</jump-button>
      <jump-button icon="cog" :to="{name: 'Settings'}">Ustawienia</jump-button>
    </nav>
  </header>
</template>

<style scoped>
header{
  --dragger-height: 30px;
}
nav{
  background-color: hsla(var(--acc), 35%);
  padding: 1em;
  padding-top: calc(var(--dragger-height) + 1em);
}
h1 a{
  color: hsl(var(--fg));
  text-decoration: none;
}
img{
  height: 3em;
  filter: brightness(var(--brightness));
}
#dragger{
  -webkit-app-region: drag;
  height: var(--dragger-height);
  font-size: calc(var(--dragger-height) - 0.5em);
  background-color: dimgray;
  color: white;
  padding: 0 2em;
  align-items: flex-end;
  position: fixed; top: 0; left: 0; right: 0;
  z-index: 999;
}
small{
  margin-left: 1em;
}
</style>
