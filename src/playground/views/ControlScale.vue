<template>
  <l-map ref="map" :zoom="2" :center="[47.41322, -1.219482]">
    <l-tile-layer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      layer-type="base"
      name="OpenStreetMap"
    ></l-tile-layer>
    <l-control-scale position="bottomleft" />
  </l-map>
</template>
<script>
import { LMap, LTileLayer, LControlScale } from "./../../components";

export default {
  components: {
    LMap,
    LTileLayer,
    LControlScale,
  },
};
</script>

<style></style>
