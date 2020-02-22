import 'vue/dist/vue.global.js';
import 'leaflet/dist/leaflet.css';
import LMap from './components/LMap';
import LTileLayer from './components/LTileLayer';

const { createApp } = window.Vue;
const App = {};
const app = createApp(App);
app.component('l-map', LMap);
app.component('l-tile-layer', LTileLayer);
app.mount('#app');
