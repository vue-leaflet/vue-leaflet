<template>
  <l-map ref="map" v-model:zoom="zoom" :center="[41.8329, -87.7327]">
    <l-tile-layer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      layer-type="base"
      name="OpenStreetMap"
    ></l-tile-layer>

    <l-marker :lat-lng="[41.8329, -87.7327]">
      <l-tooltip> Hi! I'm staying here on this location! </l-tooltip>
    </l-marker>

    <l-marker :lat-lng="coordinates" draggable>
      <l-tooltip> Hi! You can drag me around! </l-tooltip>
    </l-marker>

    <l-marker :lat-lng="[41.7654, -87.219482]">
      <l-icon icon-url="https://placekitten.com/32/32" :icon-size="[32, 48]" />
      <l-tooltip> What a tiny kitten </l-tooltip>
    </l-marker>

    <l-marker :lat-lng="[41.61322, -87.219482]">
      <l-icon><div class="div-icon">Custom HTML icon</div></l-icon>
      <l-tooltip> And with a tooltip too! </l-tooltip>
    </l-marker>

    <l-polygon
      :lat-lngs="[
        [41.6329, -87.5327],
        [41.5329, -87.2327],
        [41.3329, -87.3327],
        [41.6329, -87.5327],
      ]"
      color="#41b782"
      :fill="true"
      :fillOpacity="0.5"
      fillColor="#41b782"
    >
      <l-tooltip> Hi! I'm a polygon, nice to meet you! </l-tooltip>
    </l-polygon>

    <l-polyline
      :lat-lngs="[
        [41.9329, -87.9327],
        [41.8329, -87.8327],
      ]"
      color="green"
    >
      <l-tooltip> Hey! Polyline here, at your service! </l-tooltip>
    </l-polyline>

    <l-rectangle
      :lat-lngs="[
        [41.734852, -86.809485],
        [41.742596, -86.628731],
        [41.641487, -86.590568],
        [41.634787, -86.658337],
      ]"
      :fill="true"
      color="#35495d"
    >
      <l-tooltip> Good day! Rectangle is my name! </l-tooltip>
    </l-rectangle>

    <l-circle :lat-lng="[41.4329, -87.7327]" :radius="10000" color="green">
      <l-tooltip> Hi! I'm a green Circle! </l-tooltip>
    </l-circle>

    <l-circle-marker :lat-lng="[41.4329, -87.95]" :radius="20">
      <l-tooltip> Hi! You can call me Circle Marker! </l-tooltip>
    </l-circle-marker>
  </l-map>
</template>
<script lang="ts">
import type L from "leaflet";

import {
  LCircle,
  LCircleMarker,
  LIcon,
  LMap,
  LMarker,
  LPolygon,
  LPolyline,
  LRectangle,
  LTileLayer,
  LTooltip,
} from "@src/components";

export default {
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LIcon,
    LTooltip,
    LPolygon,
    LPolyline,
    LRectangle,
    LCircle,
    LCircleMarker,
  },
  data() {
    return {
      zoom: 9,
      coordinates: [41.75, -87.65] as L.LatLngTuple,
    };
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
