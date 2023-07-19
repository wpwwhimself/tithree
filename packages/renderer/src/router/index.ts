import { createWebHistory, createRouter } from "vue-router";
import About from "../pages/About.vue";
import Sessions from "../pages/Sessions.vue";
import SessionMod from "../pages/SessionMod.vue";
import Students from "../pages/Students.vue";
import StudentMod from "../pages/StudentMod.vue";
import StudentsTally from "../pages/StudentsTally.vue";
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
        path: "/students/tally",
        name: "StudentsTally",
        component: StudentsTally,
    },
    {
        path: "/students/list",
        name: "StudentsList",
        component: Students,
    },
    {
        path: "/students/mod/:id?",
        name: "StudentsMod",
        component: StudentMod,
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
