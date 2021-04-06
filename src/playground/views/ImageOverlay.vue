<template>
  <l-map
    ref="map"
    v-model:zoom="zoom"
    :crs="crs"
    :center="[height / 2, width / 2]"
    :minZoom="-5"
  >
    <l-image-overlay :url="imageOverlayUrl" :bounds="bounds"></l-image-overlay>

    <l-marker
      v-for="(marker, idx) in markers"
      :key="idx"
      :lat-lng="marker.coordinates"
      ><l-popup>{{ idx }}</l-popup></l-marker
    >
  </l-map>

  <!-- Map Settings -->
  <label for="imageOverlayUrl">Url to render: </label>
  <input
    type="text"
    id="imageOverlayUrl"
    placeholder="Url for image overlay"
    v-model="imageOverlayUrl"
  />
  <!-- Bounds settings -->
  <label for="width">Width: </label>
  <input type="number" id="width" placeholder="Width" v-model="width" />
  <label for="height">Height: </label>
  <input type="number" id="height" placeholder="Height" v-model="height" />

  <!-- Marker settings -->
  <div class="markers-list">
    <h4>Markers</h4>
    <ul>
      <li v-for="(marker, idx) in markers" :key="idx">
        {{ idx }} - lng (X): {{ marker.coordinates.lng }} - lat (Y):
        {{ marker.coordinates.lat }}
      </li>
    </ul>
  </div>
</template>
<script>
import { ref, computed } from "vue";
import { LMap, LImageOverlay, LMarker, LPopup } from "./../../components";
import { CRS } from "leaflet/dist/leaflet-src.esm";

export default {
  components: {
    LMap,
    LImageOverlay,
    LMarker,
    LPopup,
  },
  setup() {
    const imageOverlayUrl = ref(
      "https://www.printablee.com/postpic/2011/06/blank-100-square-grid-paper_405041.jpg"
    );
    const width = ref(100);
    const height = ref(100);
    const zoom = ref(1);

    const markers = ref([
      { coordinates: { lng: 0, lat: 0 } },
      { coordinates: { lng: 100, lat: 0 } },
      { coordinates: { lng: 0, lat: 100 } },
      { coordinates: { lng: 100, lat: 100 } },
      { coordinates: { lng: 0, lat: 50 } },
      { coordinates: { lng: 50, lat: 0 } },
      { coordinates: { lng: 50, lat: 100 } },
      { coordinates: { lng: 100, lat: 50 } },
    ]);

    const bounds = computed(() => [
      [0, 0],
      [height.value, width.value],
    ]);
    const crs = CRS.Simple;

    return {
      imageOverlayUrl,
      width,
      height,
      zoom,
      markers,
      bounds,
      crs,
    };
  },
};
</script>

<style></style>
