<script setup lang="ts">
import Button from './Button.vue';
import BigSplash from './BigSplash.vue';

defineProps(["doYouWantTo", "orElse"])
const emit = defineEmits(["confirm", "cancel"])
</script>

<template>
  <div class="container flex-right v-center h-center">
    <div class="flex-down v-center popup rounded">
      <BigSplash
        icon="circle-exclamation"
        title="Ostrożnie!"
        :subtitle="`Czy na pewno chcesz ${doYouWantTo}?`"
        :ghosttitle="orElse ?? 'Tej operacji nie można cofnąć'"
        />
      <div class="flex-right h-center">
        <Button @click="emit('confirm')" icon="check" title="Potwierdź"></Button>
        <Button @click="emit('cancel')" icon="xmark" title="Anuluj"></Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container{
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 100;
  background-color: hsla(0, 0%, 0%, 0.6);
}
.popup{
  margin: auto auto;
  bottom: 1em;
  left: 50%;
  padding: 0.5em 1em;
  z-index: 100;
  box-shadow: 5px 5px 15px hsla(var(--shadow));
  background-color: hsl(var(--bg1));
  border: 3px solid hsl(var(--acc));
}
</style>
