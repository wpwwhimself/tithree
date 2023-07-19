import { createWebHistory, createRouter } from "vue-router";
import About from "../pages/About.vue";
import Sessions from "../pages/Sessions.vue";
import SessionMod from "../pages/SessionMod.vue";
import Students from "../pages/Students.vue";
import StudentMod from "../pages/StudentMod.vue";
import Tally from "../pages/Tally.vue";
import TallyStudents from "../pages/TallyStudents.vue";
import TallyPeriods from "../pages/TallyPeriods.vue";
import Settings from "../pages/Settings.vue";
import ActionSummary from "../pages/ActionSummary.vue";
import HomeVue from "../pages/Home.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: HomeVue,
  },
  {
    path: "/about",
    name: "About",
    component: About,
  },
  {
    path: "/sessions",
    name: "Sessions",
    component: Sessions,
  },
  {
    path: "/sessions/mod/:id?",
    name: "SessionsMod",
    component: SessionMod,
  },
  {
    path: "/students/list",
    name: "Students",
    component: Students,
  },
  {
    path: "/students/mod/:id?",
    name: "StudentsMod",
    component: StudentMod,
  },
  {
    path: "/tally",
    name: "Tally",
    component: Tally,
  },
  {
    path: "/tally/students/:id?",
    name: "TallyStudents",
    component: TallyStudents,
  },
  {
    path: "/tally/periods/:monthsback?",
    name: "TallyPeriods",
    component: TallyPeriods,
  },
  {
    path: "/settings",
    name: "Settings",
    component: Settings,
  },
  {
    path: "/action-summary/:action/:target",
    name: "ActionSummary",
    component: ActionSummary,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
