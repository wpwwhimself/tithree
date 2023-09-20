<script setup lang="ts">
import { toast, clearToast } from "../toastManager"
</script>

<template>
  <div class="container rounded clickable animate flex-right v-center"
    :class="{appear: toast.visible, error: toast.error}"
    @click="clearToast"
    >
    <fai :icon="['fas', toast.icon || 'check']" bounce />
    <div class="content flex-down">
      <span>{{ toast.title }}</span>
      <small>{{ toast.subtitle }}</small>
    </div>
  </div>
</template>

<style scoped>
.container{
  position: absolute;
  bottom: 2em;
  left: 50%;
  background-color: hsl(var(--acc));
  color: black;
  padding: 0.5em 1em;
  z-index: 99;
  translate: -50% 4.5em;
  opacity: 0;
}
.content{
  gap: 0;
}
.content span, .content small{
  margin: 0;
}
.appear{
  translate: -50% 0;
  opacity: 1;
}
.error{
  color: hsl(0, 88%, 64%);
  background-color: hsl(0, 0%, 10%);
  border: 2px solid currentColor;
}
</style>
