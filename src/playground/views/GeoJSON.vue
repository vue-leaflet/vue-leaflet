<template>
  <l-map ref="map" v-model:zoom="zoom" :center="[47.41322, -1.219482]">
    <l-tile-layer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      layer-type="base"
      name="OpenStreetMap"
    ></l-tile-layer>
    <l-geo-json :geojson="geojson" :options-style="geoStyler"></l-geo-json>
  </l-map>
</template>
<script>
import { LMap, LTileLayer, LGeoJson } from "./../../components";

export default {
  components: {
    LMap,
    LTileLayer,
    LGeoJson,
  },
  data() {
    return {
      zoom: 8,
      geojson: null,
      geoStyler: (feature) => ({
        opacity: feature.properties.code / 100000,
      }),
    };
  },
  async created() {
    const response = await fetch(
      "https://rawgit.com/gregoiredavid/france-geojson/master/regions/pays-de-la-loire/communes-pays-de-la-loire.geojson"
    );
    this.geojson = await response.json();
  },
};
</script>

<style></style>
