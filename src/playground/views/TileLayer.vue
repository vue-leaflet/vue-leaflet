<template>
  <l-map ref="map" v-model:zoom="zoom" :center="[47.41322, -1.219482]">
    <l-tile-layer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      layer-type="base"
      name="OpenStreetMap"
      :max-zoom="10"
    />
    <l-tile-layer
      url="https://s3.amazonaws.com/te512.safecast.org/{z}/{x}/{y}.png"
      attribution="<a href='https://blog.safecast.org/about/'>SafeCast</a> (<a href='https://creativecommons.org/licenses/by-sa/3.0/'>CC-BY-SA</a>"
      :min-zoom="5"
      :max-zoom="7"
    />
  </l-map>
</template>
<script>
import { LMap, LTileLayer } from "./../../components";

export default {
  components: {
    LMap,
    LTileLayer,
  },
  data() {
    return {
      zoom: 2,
    };
  },
};
</script>

<style></style>
