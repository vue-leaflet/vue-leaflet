<template>
  <div style="width: 100%; height: 100%">
    <l-map ref="map" v-model:zoom="zoom" :center="[47.41322, -1.219482]">
      <l-tile-layer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        layer-type="base"
        name="OpenStreetMap"
      ></l-tile-layer>

      <l-marker :lat-lng="[47.41322, -1.219482]">
        <l-icon :icon-url="iconUrl" :icon-size="iconSize" />
      </l-marker>
      <l-marker :lat-lng="[47.41323, -1.219482]"></l-marker>

      <l-marker :lat-lng="[47.61322, -0.519482]">
        <l-icon :icon-size="[21, 21]">★</l-icon>
      </l-marker>
      <l-marker :lat-lng="[47.61322, -0.519482]"></l-marker>

      <l-marker :lat-lng="[47, -1]">
        <l-icon class-name="">Hello, Map!</l-icon>
      </l-marker>
      <l-marker :lat-lng="[47, -1]"></l-marker>
    </l-map>

    <button @click="changeIcon">New kitten icon</button>
  </div>
</template>
<script>
import { LMap, LTileLayer, LMarker, LIcon } from "./../../components";

export default {
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LIcon,
  },
  data() {
    return {
      zoom: 8,
      iconWidth: 21,
      iconHeight: 42,
    };
  },
  computed: {
    iconUrl() {
      return `https://placekitten.com/${this.iconWidth}/${this.iconHeight}`;
    },
    iconSize() {
      return [this.iconWidth, this.iconHeight];
    },
  },
  methods: {
    changeIcon() {
      this.iconWidth += 1;
      if (this.iconWidth > this.iconHeight) {
        this.iconWidth = Math.floor(this.iconHeight / 2);
      }
    },
  },
};
</script>

<style>
.leaflet-div-icon {
  background: steelblue;
  color: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  font-weight: bold;
  font-size: large;
  text-align: center;
  line-height: 21px;
}
</style>
