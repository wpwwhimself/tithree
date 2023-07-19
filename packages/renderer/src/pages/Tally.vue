<script setup lang="ts">
import Button from "../components/Button.vue";
import JumpButton from "../components/JumpButton.vue";
import PageHeader from "../components/PageHeader.vue";

</script>

<template>
  <PageHeader title="Podliczenia">
  </PageHeader>

  <p>Pokaż statystyki według:</p>
  <div class="flex-right h-center">
    <JumpButton icon="calendar" :to="{name: 'TallyPeriods'}">Okresów</JumpButton>
    <JumpButton icon="graduation-cap" :to="{name: 'TallyStudents'}">Uczniów</JumpButton>
  </div>
</template>

<style>
</style>
