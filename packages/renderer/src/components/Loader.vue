<script setup lang="ts">
const props = withDefaults(defineProps<{
  mode?: string
}>(), {
  mode: "loading",
});

let text: string;
switch(props.mode){
  case "loading": text = "Wczytuję..."; break;
  case "saving": text = "Zapisuję..."; break;
}
</script>

<template>
  <div class="flex-down h-center v-center">
    <span class="icon ghost">
      <fai v-if="mode == 'loading'" :icon="['fas', 'cog']" spin></fai>
      <fai v-if="mode == 'saving'" :icon="['fas', 'pencil']" shake></fai>
    </span>
    <h2>{{ text }}</h2>
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
