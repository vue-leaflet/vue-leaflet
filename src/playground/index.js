import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import "leaflet/dist/leaflet.css";
import Home from "./views/Home.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/marker", component: () => import("./views/Marker.vue") },
  { path: "/polyline", component: () => import("./views/Polyline.vue") },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp(App);

app.use(router);

app.mount("#app");
