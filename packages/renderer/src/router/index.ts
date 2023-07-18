import { createWebHistory, createRouter } from "vue-router";
import About from "../pages/About.vue";
import Sessions from "../pages/Sessions.vue";
import SessionMod from "../pages/SessionMod.vue";
import Students from "../pages/Students.vue";
import StudentMod from "../pages/StudentMod.vue";
import ActionSummary from "../pages/ActionSummary.vue";

const routes = [
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
        path: "/students",
        name: "Students",
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
