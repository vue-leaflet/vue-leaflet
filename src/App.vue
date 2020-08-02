<template>
  <div style="height: 50vh; width: 50vw;">
    <l-map :zoom="3" :center="[47.41322, -1.219482]" @move="log('move')">
      <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png">
      </l-tile-layer>
      <l-marker :lat-lng="[0, 0]" draggable></l-marker>
    </l-map>
  </div>
</template>
<script>
import LMap from "./components/LMap.vue";
import LTileLayer from "./components/LTileLayer.vue";
import LMarker from "./components/LMarker.vue";

export default {
  components: {
    LMap,
    LTileLayer,
    LMarker,
  },
  methods: {
    log(a) {
      console.log(a);
    },
  },
};
</script>
