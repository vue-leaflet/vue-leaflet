<template>
  <l-map ref="map" v-model:zoom="zoom" :center="[46.41322, 0.219482]">
    <l-tile-layer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      layer-type="base"
      name="OpenStreetMap"
    ></l-tile-layer>

    <l-rectangle
      :lat-lngs="[
        [46.334852, -1.509485],
        [46.342596, -1.328731],
        [46.241487, -1.190568],
        [46.234787, -1.358337],
        [46.294733, -1.234567],
      ]"
      :fill="true"
      color="#35495d"
    />
    <l-rectangle
      :bounds="[
        [46.5, -1],
        [46.6, -1.1],
      ]"
    ></l-rectangle>
  </l-map>
</template>
<script lang="ts">
import { LMap, LRectangle, LTileLayer } from "@src/components";

export default {
  components: {
    LMap,
    LTileLayer,
    LRectangle,
  },
  data() {
    return {
      zoom: 8,
    };
  },
};
</script>

<style></style>
