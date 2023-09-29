<script setup lang="ts">
const props = defineProps({
  type: { type: String, default: "text" },
  name: { type: String, required: true },
  label: { type: String },
  value: { type: String },
});
</script>

<template>
  <div class="input-container">
    <label :for="name">{{ label }}</label>
    <input :type="type" :id="name" :name="name" :value="value" :="$attrs" />
  </div>
</template>

<style scoped>
.input-container{
  display: grid;
  grid-template-columns: 50% 50%;
}
.input-container:hover{
  background-color: hsl(var(--bg2));
}

input{
  background: none;
  border: none;
  border-bottom: 2px solid hsl(var(--bg2));
  color: inherit;
  font-family: inherit;
  accent-color: hsl(var(--acc));
}
</style>
