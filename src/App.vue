<template>
  <div style="height: 50vh; width: 50vw;">
    <l-map :zoom="3" :center="[47.41322, -1.219482]">
      <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png">
      </l-tile-layer>
    </l-map>
  </div>
</template>
<script>
import "leaflet/dist/leaflet.css";
import LMap from "./components/LMap.vue";
import LTileLayer from "./components/LTileLayer.vue";

export default {
  components: {
    LMap,
    LTileLayer,
  },
};
</script>
