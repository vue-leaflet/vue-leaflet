import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import "leaflet/dist/leaflet.css";
import Home from "./views/Home.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/marker", component: () => import("./views/Marker.vue") },
  { path: "/polyline", component: () => import("./views/Polyline.vue") },
  { path: "/popups", component: () => import("./views/Popups.vue") },
  { path: "/tooltips", component: () => import("./views/Tooltips.vue") },
  {
    path: "/circle-marker",
    component: () => import("./views/CircleMarker.vue"),
  },
  { path: "/polygon", component: () => import("./views/Polygon.vue") },
  { path: "/circle", component: () => import("./views/Circle.vue") },
  {
    path: "/control-scale",
    component: () => import("./views/ControlScale.vue"),
    path: "/control-layers",
    component: () => import("./views/ControlLayers.vue"),
  { path: "/control-zoom", component: () => import("./views/ControlZoom.vue") },
  {
    path: "/control-attribution",
    component: () => import("./views/ControlAttribution.vue"),
  { path: "/icon", component: () => import("./views/Icon.vue") },
  {
    path: "/control-custom-message",
    component: () => import("./views/ControlCustomMessage.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp(App);

app.use(router);

app.mount("#app");
