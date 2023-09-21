<script setup lang="ts">
const props = defineProps({
  name: { type: String, required: true },
  options: { type: Object || null },
  emptyOption: { type: Boolean },
  label: { type: String },
  value: { type: String },
});
</script>

<template>
  <div class="input-container">
    <label :for="name">{{ label }}</label>
    <select :id="name" :name="name" :="$attrs" v-if="options">
      <option v-if="emptyOption" value=""></option>
      <option
        v-for="option in options" :key="option.key"
        :value="option.key"
        :selected="value == option.key"
        :class="{ ghost: (option.ghost) }"
        >
        {{ option.value }}
      </option>
    </select>
    <span v-else>
      Wczytuję opcje...
    </span>
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

select{
  background: none;
  border: none;
  border-bottom: 2px solid hsl(var(--bg2));
  color: inherit;
  font-family: inherit;
}
option{
  background-color: hsl(var(--bg1));
}
option.ghost{
  color: hsla(var(--fg), 0.3);
}
</style>
