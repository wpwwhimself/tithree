<script setup lang="ts">
defineProps(["icon", "to"]);
import Button from './Button.vue';
</script>

<template>
  <router-link :to="to">
    <Button :icon="icon">
      <slot />
    </Button>
  </router-link>
</template>

<style scoped>
a{
  text-decoration: none;
}
</style>
