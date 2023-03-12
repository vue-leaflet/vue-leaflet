<template>
  <l-map ref="map" v-model:zoom="zoom" :center="[47.41322, -1.219482]">
    <l-tile-layer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    ></l-tile-layer>
    <l-grid-layer :child-render="childRender"></l-grid-layer>
  </l-map>
</template>
<script lang="ts">
import { h } from "vue";

import { LGridLayer, LMap, LTileLayer } from "@src/components";

export default {
  components: {
    LMap,
    LTileLayer,
    LGridLayer,
  },
  /*
  TODO NEXT: While sorting out type errors in LGridLayer.vue, I realized I'm not sure
    how or even if its infrastructure is particularly used well. In Vue2Leaflet,
    you could pass an arbitrary Vue component to the LGridLayer, to be rendered
    for each tile with its coords passed as props. But that doesn't seem set up here.
    Should we replicate V2L exactly here? Set things up so that the LGridLayer's $slot
    can be where/how the component is setup/configured/passed/added? Simply stick with
    the `childRender` prop and simplify some of the logic in LGridLayer.vue?
  */
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
