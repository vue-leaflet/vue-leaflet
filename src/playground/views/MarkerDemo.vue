<template>
  <l-map ref="map" v-model:zoom="zoom" :center="[47.41322, -1.219482]">
    <l-tile-layer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      layer-type="base"
      name="OpenStreetMap"
    ></l-tile-layer>

    <l-marker :lat-lng="coordinates" draggable> </l-marker>
  </l-map>
</template>
<script lang="ts">
import type L from "leaflet";

import { LMap, LMarker, LTileLayer } from "@src/components";

export default {
  components: {
    LMap,
    LTileLayer,
    LMarker,
  },
  data() {
    return {
      zoom: 2,
      coordinates: [50, 50] as L.LatLngExpression,
    };
  },
};
</script>

<style></style>
