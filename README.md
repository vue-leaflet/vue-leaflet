# vue-leaflet

Vue-leaflet, written and compatible with Vue 3!

This is a Beta version! And may yet be instable! If you want to help, please reach out in an
[issue](https://github.com/vue-leaflet/vue-leaflet/issues) or on [discord](https://discord.gg/uVZAfUf).

## What Works:

- LCircle
- LCircleMarker
- LControl
- LControlAttribution
- LControlLayers
- LControlScale
- LControlZoom
- LFeatureGroup
- LGeoJson
- LIcon
- LImageOverlay
- LMap
- LMarker
- LPolygon
- LPolyline
- LPopup
- LRectangle
- LTileLayer
- LTooltip
- LWmsTileLayer

> Note that unlike the [Vue 2 version](https://github.com/vue-leaflet/Vue2Leaflet), this library is fully compatible with SSR.

## Installation

`yarn add @vue-leaflet/vue-leaflet`

or

`npm i -D @vue-leaflet/vue-leaflet`

## Usage

Until the complete documentation is ready, please check the
[component playground](https://github.com/vue-leaflet/vue-leaflet/tree/master/src/playground/views) examples or the
[demo project](https://github.com/vue-leaflet/vue3-demo-project/blob/master/src/App.vue) for usage with Vue 3.
Most component props mimic the vanilla [Leaflet options](https://leafletjs.com/reference-1.7.1.html) as closely as
possible, and generally remain the same as in their [Vue2Leaflet counterparts](https://vue2-leaflet.netlify.app/components/).

### Working with Leaflet

> **N.B.** Using `import L from "leaflet"` or `import { ... } from "leaflet"` can lead to unexpected errors.

To provide server-side rendering and tree-shaking capabilities, vue-leaflet uses async imports from the Leaflet ESM.
This can lead to issues when importing additional methods from Leaflet, because the two instances of the Leaflet
classes are technically no longer the same. See [Issue 48](https://github.com/vue-leaflet/vue-leaflet/issues/48) for more.

To avoid these issues, import any Leaflet methods asynchronously in response to the LMap component's `@ready` event:
```vue
<template>
  <l-map style="height:50vh">
    <l-geo-json :geojson="geojson" :options="geojsonOptions" />
  </l-map>
</template>

<script>
// DON'T load Leaflet components here!
// Its CSS is needed though, if not imported elsewhere in your application.
import "leaflet/dist/leaflet.css"
import { LMap, LGeoJson } from "@vue-leaflet/vue-leaflet";

export default {
  components: {
    LMap,
    LGeoJson,
  },
  data() {
    return {
      geojson: {
        type: "FeatureCollection",
        features: [
          // ...
        ],
      },
      geojsonOptions: {
        // Options that don't rely on Leaflet methods.
      },
    };
  },
  async beforeMount() {
    // HERE is where to load Leaflet components!
    const { circleMarker } = await import("leaflet/dist/leaflet-src.esm");

    // And now the Leaflet circleMarker function can be used by the options:
    this.geojsonOptions.pointToLayer = (feature, latLng) =>
      circleMarker(latLng, { radius: 8 });
    this.mapIsReady = true;
  },
};
</script>
```