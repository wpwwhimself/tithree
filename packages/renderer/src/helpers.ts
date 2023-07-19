import { App } from "vue";

export const toPlnPlugin = {
  install(app: App){
    app.config.globalProperties.$toPln = (val: number): string => {
      return val.toLocaleString(undefined, {
        minimumFractionDigits: 2,
      }) + " zł";
    };
  }
}
export const groupPlugin = {
  install(app: App){
    app.config.globalProperties.$group = (data: any[], key: string): any[] =>
      data.reduce((grouped, item) => {
        const categoryValue = item[key];
        if(!grouped[categoryValue]){
          grouped[categoryValue] = [];
        }
        grouped[categoryValue].push(item);
        return grouped;
      }, {});
  }
}
