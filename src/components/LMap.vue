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

    const schematics = reactive({
      addLayer() {},
      removeLayer() {},
      registerLayerControl() {},
    });

    provide("leafLetMethods", schematics);

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
      const {
        map,
        CRS,
        Icon,
        latLngBounds,
        latLng,
        DomEvent,
        setOptions,
      } = await import("leaflet/dist/leaflet-src.esm");
      resetWebpackIcon(Icon);
      options.crs = options.crs || CRS.EPSG3857;

      const methods = {
        addLayer(layer) {
          if (layer.layerType !== undefined) {
            if (blueprint.layerControl === undefined) {
              blueprint.layersToAdd.push(layer);
            } else {
              const exist = blueprint.layersInControl.find(
                (l) => l.mapObject._leaflet_id === layer.mapObject._leaflet_id
              );
              if (!exist) {
                blueprint.layerControl.addLayer(layer);
                blueprint.layersInControl.push(layer);
              }
            }
          }
          if (layer.visible !== false) {
            blueprint.mapRef.addLayer(layer.mapObject);
          }
        },
        removeLayer(layer) {
          if (layer.layerType !== undefined) {
            if (blueprint.layerControl === undefined) {
              blueprint.layersToAdd = blueprint.layersToAdd.filter(
                (l) => l.name !== layer.name
              );
            } else {
              blueprint.layerControl.removeLayer(layer.mapObject);
              blueprint.layersInControl = blueprint.layersInControl.filter(
                (l) => l.mapObject._leaflet_id !== layer.mapObject._leaflet_id
              );
            }
          }
          blueprint.mapRef.removeLayer(layer.mapObject);
        },

        registerLayerControl(lControlLayer) {
          blueprint.layerControl = lControlLayer;
          blueprint.mapRef.addControl(lControlLayer.mapObject);
          blueprint.layersToAdd.forEach((layer) => {
            blueprint.layerControl.addLayer(layer);
          });
          blueprint.layersToAdd = [];
        },

        setZoom(newVal) {
          blueprint.mapRef.setZoom(newVal, {
            animate: props.noBlockingAnimations ? false : null,
          });
        },

        setPaddingBottomRight(newVal) {
          blueprint.paddingBottomRight = newVal;
        },
        setPaddingTopLeft(newVal) {
          blueprint.paddingTopLeft = newVal;
        },
        setPadding(newVal) {
          blueprint.padding = newVal;
        },
        setCrs(newVal) {
          const prevBounds = blueprint.mapRef.getBounds();
          blueprint.mapRef.options.crs = newVal;
          blueprint.mapRef.fitBounds(prevBounds, {
            animate: false,
            padding: [0, 0],
          });
        },
        fitBounds(bounds) {
          blueprint.mapRef.fitBounds(bounds, {
            animate: this.noBlockingAnimations ? false : null,
          });
        },
        setBounds(newVal) {
          if (!newVal) {
            return;
          }
          const newBounds = latLngBounds(newVal);
          if (!newBounds.isValid()) {
            return;
          }
          const oldBounds =
            blueprint.lastSetBounds || blueprint.mapRef.getBounds();
          const boundsChanged = !oldBounds.equals(newBounds, 0); // set maxMargin to 0 - check exact equals
          if (boundsChanged) {
            blueprint.lastSetBounds = newBounds;
            blueprint.mapRef.fitBounds(newBounds, this.fitBoundsOptions);
          }
        },

        setCenter(newVal) {
          if (newVal == null) {
            return;
          }
          const newCenter = latLng(newVal);
          const oldCenter =
            blueprint.lastSetCenter || blueprint.mapRef.getCenter();
          if (
            oldCenter.lat !== newCenter.lat ||
            oldCenter.lng !== newCenter.lng
          ) {
            blueprint.lastSetCenter = newCenter;
            blueprint.mapRef.panTo(newCenter, {
              animate: this.noBlockingAnimations ? false : null,
            });
          }
        },
      };

      schematics.addLayer = methods.addLayer;
      schematics.removeLayer = methods.removeLayer;
      schematics.registerLayerControl = methods.registerLayerControl;

      blueprint.mapRef = map(root.value, options);

      propsBinder(methods, blueprint.mapRef, props, setOptions);
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
