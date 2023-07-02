import {createApp} from 'vue';
import App from '/@/App.vue';
import router from './router';

// custom helpers
import helper from "./helpers";

// font awesome
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
// icons
import { fas } from '@fortawesome/free-solid-svg-icons';
library.add(fas);

createApp(App)
  .use(router)
  .use(helper)
  .component("fai", FontAwesomeIcon)
  .mount('#app')
;
