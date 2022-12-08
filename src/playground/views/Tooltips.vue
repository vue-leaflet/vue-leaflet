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

    <l-layer-group>
      <l-marker :lat-lng="coordinates" draggable>
        <l-tooltip> Hi! You can drag me around! </l-tooltip>
      </l-marker>
    </l-layer-group>

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
<script>
import {
  LMap,
  LTileLayer,
  LMarker,
  LTooltip,
  LLayerGroup,
  LPolygon,
  LPolyline,
  LRectangle,
  LCircle,
  LCircleMarker,
} from "./../../components";

export default {
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LTooltip,
    LLayerGroup,
    LPolygon,
    LPolyline,
    LRectangle,
    LCircle,
    LCircleMarker,
  },
  data() {
    return {
      zoom: 9,
      coordinates: [41.75, -87.65],
    };
  },
};
</script>

<style></style>
