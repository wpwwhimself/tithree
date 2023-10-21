import {createApp} from 'vue';
import App from '/@/App.vue';
import router from './router';

// custom helpers
import { toPlnPlugin, groupPlugin, roundNumberPlugin, colorConvertPlugin } from "./helpers";

// font awesome
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
// icons
import { faAnglesLeft, faArrowUp, faArrowDown, faCalculator, faCalendar, faChartLine, faCircleCheck, faCircleExclamation, faCheck, faChevronLeft, faClockRotateLeft, faCloudArrowUp, faCog, faDownload, faEye, faGraduationCap, faHouseChimney, faMinus, faPencil, faPlus, faTableCellsLarge, faTrash, faUpRightFromSquare, faUsers, faUserPen, faXmark, faCouch, faCopy } from '@fortawesome/free-solid-svg-icons';
library.add(
  faAnglesLeft,
  faArrowUp,
  faArrowDown,
  faCalculator,
  faCalendar,
  faChevronLeft,
  faChartLine,
  faCheck,
  faCircleCheck,
  faCircleExclamation,
  faClockRotateLeft,
  faCloudArrowUp,
  faCog,
  faCopy,
  faCouch,
  faDownload,
  faEye,
  faGraduationCap,
  faHouseChimney,
  faMinus,
  faPencil,
  faPlus,
  faTableCellsLarge,
  faTrash,
  faUpRightFromSquare,
  faUsers,
  faUserPen,
  faXmark,
);

createApp(App)
  .use(router)
  .use(toPlnPlugin)
  .use(groupPlugin)
  .use(roundNumberPlugin)
  .use(colorConvertPlugin)
  .component("fai", FontAwesomeIcon)
  .mount('#app')
;
