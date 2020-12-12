<template>
  <l-map ref="map" v-model:zoom="zoom" :center="[47.41322, -1.219482]">
    <l-tile-layer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      layer-type="base"
      name="OpenStreetMap"
    ></l-tile-layer>
    <l-feature-group>
      <l-marker :lat-lng="[50, 50]"> </l-marker>
    </l-feature-group>
  </l-map>
</template>
<script>
import { LMap, LTileLayer, LMarker, LFeatureGroup } from "./../../components";

export default {
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LFeatureGroup,
  },
  data() {
    return {
      zoom: 2,
    };
  },
};
</script>

<style></style>
