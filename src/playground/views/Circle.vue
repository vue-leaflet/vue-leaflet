<template>
  <l-map ref="map" v-model:zoom="zoom" :center="[35.865, 12.865]">
    <l-tile-layer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      layer-type="base"
      name="OpenStreetMap"
    ></l-tile-layer>

    <l-circle :lat-lng="[35.865, 12.865]" :radius="10000" color="green" />
  </l-map>
</template>
<script>
import { LMap, LTileLayer, LCircle } from "./../../components";

export default {
  components: {
    LMap,
    LTileLayer,
    LCircle,
  },
  data() {
    return {
      zoom: 8,
    };
  },
};
</script>

<style></style>
