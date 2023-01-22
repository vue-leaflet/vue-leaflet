<template>
  <l-map ref="map" v-model:zoom="zoom" :center="[47.41322, -1.219482]">
    <l-wms-tile-layer
      url="https://maps.heigit.org/osm-wms/service"
      attribution="HeiGIT <a href='osm-wms.de'>OSM WMS</a>"
      layer-type="base"
      name="osm-wms.de"
      :max-zoom="10"
      version="1.3.0"
      format="image/png"
      :transparent="true"
      layers="osm_auto:all"
    />
  </l-map>
</template>
<script>
import { LMap, LWmsTileLayer } from "./../../components";

export default {
  components: {
    LMap,
    LWmsTileLayer,
  },
  data() {
    return {
      zoom: 2,
    };
  },
};
</script>

<style></style>
