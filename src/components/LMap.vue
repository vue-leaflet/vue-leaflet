<template>
  <div style="width: 100%; height: 100%;" ref="root">
    <slot v-if="ready"></slot>
  </div>
</template>

<script>
import {
  onMounted,
  onBeforeUnmount,
  computed,
  provide,
  reactive,
  ref,
} from "vue";
import {
  remapEvents,
  propsBinder,
  debounce,
  resetWebpackIcon,
} from "../utils.js";
import {
  buildAddMapLayer,
  buildRegisterLayerControl,
  buildRemoveMapLayer,
  buildMapPropSetters,
} from "../functions/map";

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
      mapRef: {},
      layersToAdd: [],
      layersInControl: [],
    });

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
      markerZoomAnimation: props.markerZoomAnimation,
    };

    provide("addMapLayer", buildAddMapLayer(blueprint));
    provide("removeMapLayer", buildRemoveMapLayer(blueprint));
    provide("registerLayerControl", buildRegisterLayerControl(blueprint));

    const eventHandlers = {
      moveEndHandler() {
        /**
         * Triggers when zoom is updated
         * @type {number,string}
         */
        context.emit("update:zoom", blueprint.mapRef.getZoom());
        /**
         * Triggers when center is updated
         * @type {object,array}
         */
        context.emit("update:center", blueprint.mapRef.getCenter());

        /**
         * Triggers when bounds are updated
         * @type {object}
         */
        context.emit("update:bounds", blueprint.mapRef.getBounds());
      },
      overlayAddHandler(e) {
        const layer = blueprint.layersInControl.find((l) => l.name === e.name);
        if (layer) {
          layer.updateVisibleProp(true);
        }
      },
      overlayRemoveHandler(e) {
        const layer = blueprint.layersInControl.find((l) => l.name === e.name);
        if (layer) {
          layer.updateVisibleProp(false);
        }
      },
    };

    onMounted(async () => {
      const { map, CRS, Icon, DomEvent, setOptions } = await import(
        "leaflet/dist/leaflet-src.esm"
      );
      resetWebpackIcon(Icon);
      options.crs = options.crs || CRS.EPSG3857;

      /*
      const methods = {
        fitBounds(bounds) {
          blueprint.mapRef.fitBounds(bounds, {
            animate: this.noBlockingAnimations ? false : null,
          });
        },
      };
      */

      blueprint.mapRef = map(root.value, options);

      const setters = buildMapPropSetters(blueprint, props);
      propsBinder(setters, blueprint.mapRef, props, setOptions);
      const listeners = remapEvents(context.attrs);

      blueprint.mapRef.on(
        "moveend",
        debounce(eventHandlers.moveEndHandler, 100)
      );
      blueprint.mapRef.on("overlayadd", eventHandlers.overlayAddHandler);
      blueprint.mapRef.on("overlayremove", eventHandlers.overlayRemoveHandler);
      DomEvent.on(blueprint.mapRef, listeners);
      blueprint.ready = true;
    });

    onBeforeUnmount(() => {
      if (blueprint.mapRef) {
        blueprint.mapRef.remove();
      }
    });

    const mapObject = computed(() => blueprint.mapRef);
    const ready = computed(() => blueprint.ready);
    return { root, ready, mapObject };
  },
};
</script>
