<template>
  <div style="width:100%; height: 100%" ref="root">
    <slot v-if="ready"></slot>
  </div>
</template>

<script>
import { onMounted, ref, computed, provide } from 'vue';

export default {
  props: {
    /**
     * The center of the map, supports .sync modifier
     */
    center: {
      type: [Object, Array],
      custom: true,
      default: () => [0, 0]
    },
    /**
     * The bounds of the map, supports .sync modifier
     */
    bounds: {
      type: [Array, Object],
      custom: true,
      default: null
    },
    /**
     * The max bounds of the map
     */
    maxBounds: {
      type: [Array, Object],
      default: null
    },
    /**
     * The zoom of the map, supports .sync modifier
     */
    zoom: {
      type: Number,
      custom: true,
      default: 0
    },
    /**
     * The minZoom of the map
     */
    minZoom: {
      type: Number,
      default: null
    },
    /**
     * The maxZoom of the map
     */
    maxZoom: {
      type: Number,
      default: null
    },
    /**
     * The paddingBottomRight of the map
     */
    paddingBottomRight: {
      type: Array,
      custom: true,
      default: null
    },
    /**
     * The paddingTopLeft of the map
     */
    paddingTopLeft: {
      type: Array,
      custom: true,
      default: null
    },
    /**
     * The padding of the map
     */
    padding: {
      type: Array,
      custom: true,
      default: null
    },
    /**
     * The worldCopyJump option for the map
     */
    worldCopyJump: {
      type: Boolean,
      default: false
    },
    /**
     * The crs option for the map
     * @values CRS.EPSG3857
     */
    crs: {
      type: Object,
      custom: true
    },
    maxBoundsViscosity: {
      type: Number,
      default: null
    },
    inertia: {
      type: Boolean,
      default: null
    },
    inertiaDeceleration: {
      type: Number,
      default: null
    },
    inertiaMaxSpeed: {
      type: Number,
      default: null
    },
    easeLinearity: {
      type: Number,
      default: null
    },
    zoomAnimation: {
      type: Boolean,
      default: null
    },
    zoomAnimationThreshold: {
      type: Number,
      default: null
    },
    fadeAnimation: {
      type: Boolean,
      default: null
    },
    markerZoomAnimation: {
      type: Boolean,
      default: null
    },
    noBlockingAnimations: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const root = ref(null);
    const ready = ref(false);
    const mapRef = ref(null);

    const options = {
      minZoom: props.minZoom,
      maxZoom: props.maxZoom,
      maxBounds: props.maxBounds,
      maxBoundsViscosity: props.maxBoundsViscosity,
      worldCopyJump: props.worldCopyJump,
      crs: props.crs,
      center: props.center,
      zoom: props.zoom,
      inertia: props.inertia,
      inertiaDeceleration: props.inertiaDeceleration,
      inertiaMaxSpeed: props.inertiaMaxSpeed,
      easeLinearity: props.easeLinearity,
      zoomAnimation: props.zoomAnimation,
      zoomAnimationThreshold: props.zoomAnimationThreshold,
      fadeAnimation: props.fadeAnimation,
      markerZoomAnimation: props.markerZoomAnimation
    };

    const addLayer = layer => {
      mapRef.value.addLayer(layer);
    };
    const removeLayer = layer => {
      mapRef.value.removeLayer(layer);
    };
    provide('addLayer', addLayer);
    provide('removeLayer', removeLayer);

    onMounted(async () => {
      const { map, CRS } = await import('leaflet/dist/leaflet-src.esm');
      options.crs = options.crs || CRS.EPSG3857;
      mapRef.value = map(root.value, options);
      ready.value = true;
    });

    const mapObject = computed(() => mapRef.value);
    return { root, ready, mapObject };
  }
};
</script>
