<template>
  <l-map ref="map" v-model:zoom="zoom" :center="[25, -110]">
    <l-svg-overlay
      :url="svg"
      :bounds="[
        [32, -130],
        [13, -100],
      ]"
    ></l-svg-overlay>
    <l-tile-layer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      layer-type="base"
      name="OpenStreetMap"
      :max-zoom="10"
    />
  </l-map>
</template>
<script lang="ts">
import { LMap, LSVGOverlay, LTileLayer } from "@src/components";

const svgElement = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "svg"
);
svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
svgElement.setAttribute("viewBox", "0 0 200 200");
svgElement.innerHTML = `
  <rect width="200"
    height="200"/>
  <rect x="75"
    y="23"
    width="50"
    height="50"
    style="fill:red"/>
  <rect x="75"
    y="123"
    width="50"
    height="50"
    style="fill:#0013ff"/>`;

console.log({ svgElement });

export default {
  components: {
    LMap,
    "l-svg-overlay": LSVGOverlay,
    LTileLayer,
  },
  data() {
    return {
      zoom: 4,
      svg: svgElement,
    };
  },
};
</script>

<style></style>
