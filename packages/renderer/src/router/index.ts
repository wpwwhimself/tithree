import { createWebHistory, createRouter } from "vue-router";
import Home from "../pages/Home.vue";
import Today from "../pages/Today.vue";
import Students from "../pages/Students.vue";
import StudentMod from "../pages/StudentMod.vue";
import ActionSummary from "../pages/ActionSummary.vue";

const routes = [
    {
        path: "/",
        name: "Home",
        component: Home,
    },
    {
        path: "/today",
        name: "Today",
        component: Today,
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
