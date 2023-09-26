<script setup lang="ts">
import { toast, clearToast } from "../toastManager"
</script>

<template>
  <div class="container rounded clickable animate"
    :class="{appear: toast.visible, error: toast.error}"
    @click="clearToast"
    >
    <div class="flex-right v-center">
      <fai :icon="['fas', toast.icon || 'check']" bounce />
      <div class="content">
        <span>{{ toast.title }}</span>
      </div>
    </div>
    <small>{{ toast.subtitle }}</small>
  </div>
</template>

<style scoped>
.container{
  position: absolute;
  bottom: 1em;
  left: 50%;
  background-color: hsl(var(--acc));
  color: black;
  padding: 0.5em 1em;
  z-index: 99;
  translate: -50% 4.5em;
  opacity: 0;
  box-shadow: 5px 5px 15px hsla(var(--shadow));
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
