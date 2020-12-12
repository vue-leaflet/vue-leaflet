<template>
  <l-map ref="map" v-model:zoom="zoom" :center="[47.41322, -1.219482]">
    <l-tile-layer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      layer-type="base"
      name="OpenStreetMap"
    ></l-tile-layer>

    <l-polyline
      :lat-lngs="[
        [47.334852, -1.509485],
        [47.342596, -1.328731],
        [47.241487, -1.190568],
        [47.234787, -1.358337],
      ]"
      color="green"
    />
  </l-map>
</template>
<script>
import { LMap, LTileLayer, LPolyline } from "./../../components";

export default {
  components: {
    LMap,
    LTileLayer,
    LPolyline,
  },
  data() {
    return {
      zoom: 9,
    };
  },
};
</script>

<style></style>
