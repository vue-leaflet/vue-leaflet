<template>
  <l-map ref="map" :zoom="2" :center="[47.41322, -1.219482]">
    <l-tile-layer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      layer-type="base"
      name="OpenStreetMap"
    ></l-tile-layer>
    <l-control-zoom position="bottomright" zoom-in-text="*" zoom-out-text="/" />
  </l-map>
</template>
<script>
import { LMap, LTileLayer, LControlZoom } from "./../../components";

export default {
  components: {
    LMap,
    LTileLayer,
    LControlZoom,
  },
};
</script>

<style></style>
