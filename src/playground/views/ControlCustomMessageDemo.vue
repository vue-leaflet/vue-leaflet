<template>
  <l-map ref="map" :zoom="2" :center="[47.41322, -1.219482]">
    <l-tile-layer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      layer-type="base"
      name="OpenStreetMap"
    ></l-tile-layer>
    <l-control
      class="leaflet-control leaflet-demo-control"
      position="bottomleft"
      >Hello, Map!</l-control
    >
  </l-map>
</template>
<script lang="ts">
import { LControl, LMap, LTileLayer } from "@src/components";

export default {
  components: {
    LMap,
    LTileLayer,
    LControl,
  },
};
</script>

<style>
.leaflet-demo-control {
  background: white;
  border: 1px solid steelblue;
  border-radius: 0.6em;
  padding: 1em;
  font-size: large;
  font-style: italic;
}
</style>
