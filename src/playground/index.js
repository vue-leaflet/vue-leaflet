import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import "leaflet/dist/leaflet.css";
import Home from "./views/Home.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/grid-layer", component: () => import("./views/GridLayer.vue") },
  { path: "/tile-layer", component: () => import("./views/TileLayer.vue") },
  {
    path: "/wms-tile-layer",
    component: () => import("./views/WmsTileLayer.vue"),
  },
  {
    path: "/feature-group",
    component: () => import("./views/FeatureGroup.vue"),
  },
  { path: "/circle", component: () => import("./views/Circle.vue") },
  {
    path: "/circle-marker",
    component: () => import("./views/CircleMarker.vue"),
  },
  {
    path: "/control-attribution",
    component: () => import("./views/ControlAttribution.vue"),
  },
  {
    path: "/control-custom-message",
    component: () => import("./views/ControlCustomMessage.vue"),
  },
  {
    path: "/control-layers",
    component: () => import("./views/ControlLayers.vue"),
  },
  {
    path: "/control-scale",
    component: () => import("./views/ControlScale.vue"),
  },
  { path: "/control-zoom", component: () => import("./views/ControlZoom.vue") },
  { path: "/geo-json", component: () => import("./views/GeoJSON.vue") },
  { path: "/icon", component: () => import("./views/Icon.vue") },
  { path: "/marker", component: () => import("./views/Marker.vue") },
  { path: "/tile-layer", component: () => import("./views/TileLayer.vue") },
  {
    path: "/image-overlay",
    component: () => import("./views/ImageOverlay.vue"),
  },
  { path: "/polygon", component: () => import("./views/Polygon.vue") },
  { path: "/polyline", component: () => import("./views/Polyline.vue") },
  { path: "/popups", component: () => import("./views/Popups.vue") },
  { path: "/rectangle", component: () => import("./views/Rectangle.vue") },
  { path: "/tooltips", component: () => import("./views/Tooltips.vue") },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp(App);

app.use(router);

app.mount("#app");
