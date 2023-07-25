<script setup lang="ts">
const props = withDefaults(defineProps<{
    data: any[],
    axes: string[],
    title?: string,
    asPln?: boolean,
    barHeightPx?: number,
    flip?: boolean,
  }>(), {
    asPln: false,
    barHeightPx: 100,
    flip: false,
  }
);

let labels = [] as string[];
let values = [] as number[];
for(let el of props.data){
  labels.push(el[props.axes[0]]);
  values.push(el[props.axes[1]]);
}
if(props.flip){
  labels.reverse();
  values.reverse();
}
const highest_col = Math.max(...values);
</script>

<template>
  <div class="plot-container">
    <h2 v-if="title">{{ title }}</h2>

    <div class="columns flex-right">
      <div class="rounded flex-right h-center" v-for="(n, i) in values.length" :style="{ height: values[i]/highest_col * barHeightPx + 'px' }">
        {{ asPln ? $toPln(values[i]) : values[i] }}
      </div>
    </div>

    <div class="labels flex-right">
      <span class="flex-right h-center" v-for="(n, i) in labels.length">
        {{ labels[i] }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.plot-container{
  margin: 0.5em 0;
}
.columns, .labels{
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: flex-end;
}
.labels{
  margin-top: 4px;
  border-top: 2px solid hsl(var(--bg2));
}
.columns > div, .labels > span{
  width: 100%;
  overflow: hidden;
  font-size: 0.75em;
}
.columns > div{
  background-color: hsla(var(--acc), 0.5);
}
.columns > div:hover{
  background-color: hsla(var(--acc), 1);
}
</style>
