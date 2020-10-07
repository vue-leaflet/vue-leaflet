<template>
  <div style="width: 100%; height: 100%;" ref="root">
    <slot v-if="ready"></slot>
  </div>
</template>

<script>
import { onMounted, onBeforeUnmount, computed, reactive, ref } from "vue";
import {
  remapEvents,
  propsBinder,
  debounce,
  resetWebpackIcon,
} from "../utils.js";
import { setup, buildMapEventHandlers } from "../functions/map";

export default {
  props: {
    /**
     * The center of the map, supports .sync modifier
     */
    center: {
      type: [Object, Array],
      default: () => [0, 0],
    },
    /**
     * The bounds of the map, supports .sync modifier
     */
    bounds: {
      type: [Array, Object],
      default: undefined,
    },
    /**
     * The max bounds of the map
     */
    maxBounds: {
      type: [Array, Object],
      default: undefined,
    },
    /**
     * The zoom of the map, supports .sync modifier
     */
    zoom: {
      type: Number,
      default: 0,
    },
    /**
     * The minZoom of the map
     */
    minZoom: {
      type: Number,
      default: undefined,
    },
    /**
     * The maxZoom of the map
     */
    maxZoom: {
      type: Number,
      default: undefined,
    },
    /**
     * The paddingBottomRight of the map
     */
    paddingBottomRight: {
      type: Array,
      default: undefined,
    },
    /**
     * The paddingTopLeft of the map
     */
    paddingTopLeft: {
      type: Array,
      default: undefined,
    },
    /**
     * The padding of the map
     */
    padding: {
      type: Array,
      default: undefined,
    },
    /**
     * The worldCopyJump option for the map
     */
    worldCopyJump: {
      type: Boolean,
      default: false,
    },
    /**
     * The crs option for the map
     * @values CRS.EPSG3857
     */
    crs: {
      type: Object,
    },
    maxBoundsViscosity: {
      type: Number,
      default: undefined,
    },
    inertia: {
      type: Boolean,
      default: undefined,
    },
    inertiaDeceleration: {
      type: Number,
      default: undefined,
    },
    inertiaMaxSpeed: {
      type: Number,
      default: undefined,
    },
    easeLinearity: {
      type: Number,
      default: undefined,
    },
    zoomAnimation: {
      type: Boolean,
      default: undefined,
    },
    zoomAnimationThreshold: {
      type: Number,
      default: undefined,
    },
    fadeAnimation: {
      type: Boolean,
      default: undefined,
    },
    markerZoomAnimation: {
      type: Boolean,
      default: undefined,
    },
    noBlockingAnimations: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, context) {
    const root = ref(null);
    const blueprint = reactive({
      ready: false,
      leafletRef: {},
      layersToAdd: [],
      layersInControl: [],
    });

    const eventHandlers = buildMapEventHandlers(blueprint, context);
    const { options, methods } = setup(props, blueprint);

    onMounted(async () => {
      const { map, CRS, Icon, DomEvent, setOptions } = await import(
        "leaflet/dist/leaflet-src.esm"
      );
      resetWebpackIcon(Icon);
      options.crs = options.crs || CRS.EPSG3857;

      blueprint.leafletRef = map(root.value, options);

      propsBinder(methods, blueprint.leafletRef, props, setOptions);
      const listeners = remapEvents(context.attrs);

      blueprint.leafletRef.on(
        "moveend",
        debounce(eventHandlers.moveEndHandler, 100)
      );
      blueprint.leafletRef.on("overlayadd", eventHandlers.overlayAddHandler);
      blueprint.leafletRef.on(
        "overlayremove",
        eventHandlers.overlayRemoveHandler
      );
      DomEvent.on(blueprint.leafletRef, listeners);
      blueprint.ready = true;
    });

    onBeforeUnmount(() => {
      if (blueprint.leafletRef) {
        blueprint.leafletRef.remove();
      }
    });

    const leafletObject = computed(() => blueprint.leafletRef);
    const ready = computed(() => blueprint.ready);
    return { root, ready, leafletObject };
  },
};
</script>
