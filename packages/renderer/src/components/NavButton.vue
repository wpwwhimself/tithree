<script setup lang="ts">
import { RouteLocationRaw } from 'vue-router';

withDefaults(
  defineProps<{
    icon: string,
    to: RouteLocationRaw,
    active?: boolean
  }>(),
  {
    active: false,
  }
);
</script>

<template>
  <RouterLink :to="to" class="container animate" :class="{active: active}">
    <span class="icon">
      <fai :icon="['fas', icon]" />
    </span>
    <slot />
  </RouterLink>
</template>

<style scoped>
.container{
  display: grid;
  grid-template-columns: 4em 1fr;
  align-items: center;

  text-decoration: none;
  color: hsl(var(--fg));
}
.container:hover{
  color: hsl(var(--acc));
}
.icon{
  text-align: center;
}
</style>
