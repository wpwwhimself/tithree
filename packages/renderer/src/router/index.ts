import { createWebHistory, createRouter } from "vue-router";
import Home from "../pages/Home.vue";
import Today from "../pages/Today.vue";
import Students from "../pages/Students.vue";
import StudentMod from "../pages/StudentMod.vue";

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
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
