<script setup lang="ts">
import { useRoute } from "vue-router";
import JumpButton from './JumpButton.vue';
import { ref } from "vue";
import NavButton from "./NavButton.vue";

const route = useRoute();

const buttons = [
  {
    label: "Dzisiaj",
    icon: "house-chimney",
    routeName: "Home",
  },
  {
    label: "Kalendarz",
    icon: "calendar",
    routeName: "Calendar",
  },
  {
    label: "Obecność",
    icon: "table-cells-large",
    routeName: "TimeGrid",
  },
  {
    label: "Sesje",
    icon: "clock-rotate-left",
    routeName: "Sessions",
  },
  {
    label: "Uczniowie",
    icon: "users",
    routeName: "Students",
  },
  {
    label: "Podliczenia",
    icon: "chart-line",
    routeName: "Tally",
  },
  {
    label: "Ustawienia",
    icon: "cog",
    routeName: "Settings",
  },
];

</script>

<template>
  <nav class="flex-down animate">
    <nav-button v-for="button in buttons" :key="button.routeName"
      :icon="button.icon" :to="{name: button.routeName}" :active="button.routeName == route.name"
      >{{ button.label }}
    </nav-button>
  </nav>
</template>

<style scoped>
nav{
  background-color: hsla(var(--acc), 30%);
  padding: 1em 1em;
  padding-left: 0;
  width: 3em;
  overflow: hidden;
  align-items: start;
  box-shadow: 0 0 15px hsla(var(--shadow));
}
nav:hover{ width: 10em }
h1 a{
  color: hsl(var(--fg));
  text-decoration: none;
}
img{
  height: 3em;
  filter: brightness(var(--brightness));
}
.active{
  color: hsl(var(--acc));
}
</style>
