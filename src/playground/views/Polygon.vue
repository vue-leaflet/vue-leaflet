<template>
  <l-map ref="map" v-model:zoom="zoom" :center="[24.886, -70.268]">
    <l-tile-layer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      layer-type="base"
      name="OpenStreetMap"
    ></l-tile-layer>

    <l-polygon
      :lat-lngs="[
        [25.774, -80.19],
        [18.466, -66.118],
        [32.321, -64.757],
        [25.774, -80.19],
      ]"
      color="#41b782"
      :fill="true"
      :fillOpacity="0.5"
      fillColor="#41b782"
    />
  </l-map>
</template>
<script>
import { LMap, LTileLayer, LPolygon } from "./../../components";

export default {
  components: {
    LMap,
    LTileLayer,
    LPolygon,
  },
  data() {
    return {
      zoom: 5,
    };
  },
};
</script>

<style></style>
