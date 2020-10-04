<template>
  <div style="height: 75vh; width: 50vw;">
    <l-map
      v-model="zoom"
      v-model:zoom="zoom"
      :center="[47.41322, -1.219482]"
      @move="log('move')"
    >
      <l-tile-layer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      ></l-tile-layer>
      <l-control-layers />
      <l-marker :lat-lng="[0, 0]" draggable @moveend="log('moveend')">
        <l-tooltip>
          lol
        </l-tooltip>
      </l-marker>
    </l-map>
  </div>
</template>
<script>
import LMap from "./components/LMap.vue";
import LTileLayer from "./components/LTileLayer.vue";
import LMarker from "./components/LMarker.vue";
import LControlLayers from "./components/LControlLayers.vue";
import LTooltip from "./components/LTooltip.vue";

export default {
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LControlLayers,
    LTooltip,
  },
  data() {
    return {
      zoom: 2,
    };
  },
  methods: {
    log(a) {
      console.log(a);
    },
  },
};
</script>
