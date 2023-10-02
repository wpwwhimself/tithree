<script setup lang="ts">
const props = defineProps<{
  icon: string,
  title: string,
  subtitle?: string,
  ghosttitle?: string,
}>();
</script>

<template>
  <div class="flex-down h-center v-center">
    <span class="icon accent">
      <fai :icon="['fas', icon]"></fai>
    </span>
    <h1>{{ title }}</h1>
    <span v-if="subtitle">{{ subtitle }}</span>
    <span v-if="ghosttitle" class="ghost">{{ ghosttitle }}</span>
  </div>
</template>

<style scoped>
.icon{
  font-size: 4em;
  padding: 0 0.5em;
}
span, h1, h2{
  margin: 0;
}
h1::before, h1::after{
  content: "===";
  color: hsl(var(--acc));
  padding: 0.5em;
}
</style>
