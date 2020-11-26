---
sidebar: auto
---

# Quick Start

## Installation

### Npm

```bash
npm install leaflet @vue-leaflet/vue-leaflet --save
```

### Yarn

```bash
yarn add leaflet @vue-leaflet/vue-leaflet
```

## Usage

### In a webpack / rollup build system

#### System-wide components

```js
import Vue from "vue";
import { LMap, LTileLayer, LMarker } from "vue-leaflet";
import "leaflet/dist/leaflet.css";

Vue.component("l-map", LMap);
Vue.component("l-tile-layer", LTileLayer);
Vue.component("l-marker", LMarker);
```

If you need a globally available `L`, such as for compatibility
with some plugins, be sure to explicitly import Leaflet from the
ES2015 module used by vue-leaflet.
```js
import * as L from "leaflet/dist/leaflet-src.esm";

window.L = L;
```

#### Locally installed components

##### In your component:

```js
// If you need to reference 'L', such as to create latLng instances,
// then be sure to explicitly import 'leaflet' from the ES2015
// module used by vue-leaflet.
import { latLng } from "leaflet/dist/leaflet-src.esm";
import { LMap, LTileLayer, LMarker } from "vue-leaflet";

export default {
  name: "MyAwesomeMap",
  components: {
    LMap,
    LTileLayer,
    LMarker,
  },
};
```

##### In your entry point: ie: `main.js`

```js
import "leaflet/dist/leaflet.css";
```

## Accessing `leaflet` api

Leaflet inner methods and properties can always be accessed by the `leafletObject` attribute, to do so a simple ref is necessary:

```html
<template>
  <l-map ref="myMap"> </l-map>
</template>

<script>
  export default {
    mounted() {
      this.$nextTick(() => {
        this.$refs.myMap.leafletObject.ANY_LEAFLET_MAP_METHOD();
      });
    },
  };
</script>
```

::: tip
`leafletObject` is not going to be available immediately that is why `$nextTick` method is used.
:::

**Note:** You can also use [l-map](/components/LMap.md) component `ready` event to ensure that you access `leafletObject` after it's loaded:

```html
<l-map ref="myMap" @ready="doSomethingOnReady()"></l-map>
```

```javascript
methods: {
    doSomethingOnReady() {
        this.map = this.$refs.myMap.leafletObject
    },
},
```
