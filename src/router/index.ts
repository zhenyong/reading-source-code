import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import CommitsView from "../views/CommitsView.vue";

console.log(import.meta.env);
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/commits",
      name: "commits",
      component: CommitsView,
    },
  ],
});

export default router;
