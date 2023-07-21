import { ComponentCustomProperties } from "vue";

declare module '*.vue' {
  import type {DefineComponent} from 'vue';
  // eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module '@vue/runtime-core'{
  interface ComponentCustomProperties{
    $toPln: (val: number | undefined) => string,
    $group: (data: any[], key: string) => any[],
    $round: (val: number, precision?: number) => number,
  }
}
