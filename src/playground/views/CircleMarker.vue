<template>
  <l-map ref="map" v-model:zoom="zoom" :center="[41.89026, 12.49238]">
    <l-tile-layer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      layer-type="base"
      name="OpenStreetMap"
    ></l-tile-layer>

    <l-circle-marker :lat-lng="[41.89026, 12.49238]" :radius="50" />
  </l-map>
</template>
<script>
import { LMap, LTileLayer, LCircleMarker } from "./../../components";

export default {
  components: {
    LMap,
    LTileLayer,
    LCircleMarker,
  },
  data() {
    return {
      zoom: 16,
    };
  },
};
</script>

<style></style>
