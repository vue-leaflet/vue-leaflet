<template>
  <l-map ref="map" v-model:zoom="zoom" :center="[25, -110]">
    <l-tile-layer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      layer-type="base"
      name="OpenStreetMap"
      :max-zoom="10"
    />
    <l-video-overlay
      :url="url"
      :bounds="[
        [32, -130],
        [13, -100],
      ]"
    ></l-video-overlay>
  </l-map>
</template>
<script lang="ts">
import { LMap, LTileLayer, LVideoOverlay } from "@src/components";

export default {
  components: {
    LMap,
    LTileLayer,
    LVideoOverlay,
  },
  data() {
    return {
      zoom: 5,
      url: "https://www.mapbox.com/bites/00188/patricia_nasa.webm",
    };
  },
};
</script>

<style></style>
