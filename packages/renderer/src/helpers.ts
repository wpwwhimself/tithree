import { App } from "vue";

export const toPlnPlugin = {
  install(app: App){
    app.config.globalProperties.$toPln = (val) => {
      return val?.toLocaleString(undefined, {
        minimumFractionDigits: 2,
      }) + " zł";
    };
  }
}
export const groupPlugin = {
  install(app: App){
    app.config.globalProperties.$group = (data, key) =>
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
export const roundNumberPlugin = {
  install(app: App){
    app.config.globalProperties.$round = (val, precision = 2) =>
      Math.round(val * Math.pow(10, precision)) / Math.pow(10, precision);
  }
}
export const colorConvertPlugin = {
  install(app: App){
    app.config.globalProperties.$colorConvert = (color, direction = 'hsl-hex') => {
      let ret = "";
      if(direction == "hsl-hex"){
        //prepare data
        const hsl_values = color.split(/, /);
        const h = +hsl_values[0];
        const s = +hsl_values[1].replace(/%/, '') / 100;
        const l = +hsl_values[2].replace(/%/, '') / 100;

        let c = (1 - Math.abs(2 * l - 1)) * s,
            x = c * (1 - Math.abs((h / 60) % 2 - 1)),
            m = l - c/2,
            r = 0,
            g = 0,
            b = 0;

        if (0 <= h && h < 60) {
          r = c; g = x; b = 0;
        } else if (60 <= h && h < 120) {
          r = x; g = c; b = 0;
        } else if (120 <= h && h < 180) {
          r = 0; g = c; b = x;
        } else if (180 <= h && h < 240) {
          r = 0; g = x; b = c;
        } else if (240 <= h && h < 300) {
          r = x; g = 0; b = c;
        } else if (300 <= h && h < 360) {
          r = c; g = 0; b = x;
        }
        // Having obtained RGB, convert channels to hex
        let R = Math.round((r + m) * 255).toString(16);
        let G = Math.round((g + m) * 255).toString(16);
        let B = Math.round((b + m) * 255).toString(16);

        // Prepend 0s, if necessary
        if (R.length == 1)
          R = "0" + R;
        if (G.length == 1)
          G = "0" + G;
        if (B.length == 1)
          B = "0" + B;

        ret = "#" + R + G + B;
      }else if(direction == "hex-hsl"){
        // Convert hex to RGB first
        let r = 0, g = 0, b = 0;
        r = +("0x" + color[1] + color[2]);
        g = +("0x" + color[3] + color[4]);
        b = +("0x" + color[5] + color[6]);
        // Then to HSL
        r /= 255;
        g /= 255;
        b /= 255;
        let cmin = Math.min(r,g,b),
            cmax = Math.max(r,g,b),
            delta = cmax - cmin,
            h = 0,
            s = 0,
            l = 0;

        if (delta == 0)
          h = 0;
        else if (cmax == r)
          h = ((g - b) / delta) % 6;
        else if (cmax == g)
          h = (b - r) / delta + 2;
        else
          h = (r - g) / delta + 4;

        h = Math.round(h * 60);

        if (h < 0)
          h += 360;

        l = (cmax + cmin) / 2;
        s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
        s = +(s * 100).toFixed(0);
        l = +(l * 100).toFixed(0);

        ret = h + ", " + s + "%, " + l + "%";
      }
      return ret;
    }
  }
}
