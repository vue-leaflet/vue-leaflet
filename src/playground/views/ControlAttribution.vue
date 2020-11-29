<template>
  <l-map ref="map" :zoom="2" :center="[47.41322, -1.219482]">
    <l-tile-layer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      layer-type="base"
      name="OpenStreetMap"
    ></l-tile-layer>
    <l-control-attribution
      position="bottomleft"
      :prefix="customAttributionPrefix"
    />
  </l-map>
</template>
<script>
import { LMap, LTileLayer, LControlAttribution } from "./../../components";

export default {
  components: {
    LMap,
    LTileLayer,
    LControlAttribution,
  },
  data() {
    return {
      customAttributionPrefix:
        "<strong>Custom bottom left attribution</strong>",
    };
  },
};
</script>

<style></style>
