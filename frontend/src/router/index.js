import {
    createRouter,
    createWebHistory,
    isNavigationFailure,
} from "vue-router";
import NRoom from "@/views/Room.vue";
import NotFound from "@/views/Errors/NotFound.vue";
import Home from "@/views/Home.vue";
import Emotes from "@/views/emotes.vue";

const routes = [
    {
        path: "/",
        name: "Home",
        component: Home,
        meta: {
            title: "Sync",
        },
    },
    {
        path: "/room/:id/",
        name: "Room",
        component: NRoom,
        meta: {
            title: "Sync | Room",
        },
    },
    {
        path: "/:pathMatch(.*)*",
        name: "NotFound",
        component: NotFound,
        meta: {
            title: "Not found",
        },
    },
    {
        path: "/emotes/",
        name: "emotes",
        component: Emotes,
        meta: {
            title: "Emotes",
        },
    },
];

const router = createRouter({
    history: createWebHistory(),
    mode: "history",
    routes,
});

router.afterEach((to, from, fail) => {
    if (!isNavigationFailure(fail)) {
        document.title = to.meta.title;
    }
});

export default router;
