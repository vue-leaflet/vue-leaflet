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
      <l-marker :lat-lng="[47.61322, -1.219482]">
        <l-icon><div class="div-icon">Custom HTML icon</div></l-icon>
      </l-marker>
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
      iconWidth: 45,
      iconHeight: 90,
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
.div-icon {
  background-color: skyblue;
  width: fit-content;
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: 1px blue solid;
}
</style>
