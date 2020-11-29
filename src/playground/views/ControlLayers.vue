<template>
  <l-map ref="map" :zoom="2" :center="[47.41322, -1.219482]">
    <l-tile-layer
      url="http://tile.stamen.com/watercolor/{z}/{x}/{y}.jpg"
      layer-type="base"
      name="Stamen Watercolor"
      attribution="Map tiles by <a href='http://stamen.com'>Stamen Design</a>, under <a href='http://creativecommons.org/licenses/by/3.0'>CC BY 3.0</a>. Data by <a href='http://openstreetmap.org'>OpenStreetMap</a>, under <a href='http://creativecommons.org/licenses/by-sa/3.0'>CC BY SA</a>."
    />
    <l-tile-layer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      layer-type="base"
      name="OpenStreetMap"
    ></l-tile-layer>
    <l-control-layers />
  </l-map>
</template>
<script>
import { LMap, LTileLayer, LControlLayers } from "./../../components";

export default {
  components: {
    LMap,
    LTileLayer,
    LControlLayers,
  },
};
</script>

<style></style>
