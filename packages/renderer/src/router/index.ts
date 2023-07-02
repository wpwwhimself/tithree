import { createWebHistory, createRouter } from "vue-router";
import Home from "../pages/Home.vue";
import Today from "../pages/Today.vue";
import Students from "../pages/Students.vue";

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
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
