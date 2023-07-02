const customPlugin = {
  install(app: any){
    app.config.globalProperties.$toPln = (val: number): string => {
      return val.toLocaleString(undefined, {
        minimumFractionDigits: 2,
      }) + " zł";
    }
  }
}

export default customPlugin;
