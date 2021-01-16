<template>
  <l-map ref="map" v-model:zoom="zoom" :center="[47.41322, -1.219482]">
    <l-tile-layer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    ></l-tile-layer>
    <l-grid-layer :child-render="childRender"></l-grid-layer>
  </l-map>
</template>
<script>
import { h } from "vue";
import { LMap, LTileLayer, LGridLayer } from "./../../components";

export default {
  components: {
    LMap,
    LTileLayer,
    LGridLayer,
  },
  data() {
    return {
      zoom: 2,
      childRender: (props) => () => {
        return h(
          "div",
          { style: "border: 1px solid grey; height: 100%;" },
          `x: ${props.coords.x} y: ${props.coords.y} z: ${props.coords.z}`
        );
      },
    };
  },
};
</script>

<style></style>
