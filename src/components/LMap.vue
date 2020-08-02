<template>
  <div style="width: 100%; height: 100%;" ref="root">
    <slot v-if="ready"></slot>
  </div>
</template>

<script>
import { onMounted, onBeforeUnmount, ref, computed, provide } from "vue";
import { remapEvents, propsBinder, debounce } from "../utils.js";

export default {
  props: {
    /**
     * The center of the map, supports .sync modifier
     */
    center: {
      type: [Object, Array],
      custom: true,
      default: () => [0, 0],
    },
    /**
     * The bounds of the map, supports .sync modifier
     */
    bounds: {
      type: [Array, Object],
      custom: true,
      default: null,
    },
    /**
     * The max bounds of the map
     */
    maxBounds: {
      type: [Array, Object],
      default: null,
    },
    /**
     * The zoom of the map, supports .sync modifier
     */
    zoom: {
      type: Number,
      custom: true,
      default: 0,
    },
    /**
     * The minZoom of the map
     */
    minZoom: {
      type: Number,
      default: null,
    },
    /**
     * The maxZoom of the map
     */
    maxZoom: {
      type: Number,
      default: null,
    },
    /**
     * The paddingBottomRight of the map
     */
    paddingBottomRight: {
      type: Array,
      custom: true,
      default: null,
    },
    /**
     * The paddingTopLeft of the map
     */
    paddingTopLeft: {
      type: Array,
      custom: true,
      default: null,
    },
    /**
     * The padding of the map
     */
    padding: {
      type: Array,
      custom: true,
      default: null,
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
      custom: true,
    },
    maxBoundsViscosity: {
      type: Number,
      default: null,
    },
    inertia: {
      type: Boolean,
      default: null,
    },
    inertiaDeceleration: {
      type: Number,
      default: null,
    },
    inertiaMaxSpeed: {
      type: Number,
      default: null,
    },
    easeLinearity: {
      type: Number,
      default: null,
    },
    zoomAnimation: {
      type: Boolean,
      default: null,
    },
    zoomAnimationThreshold: {
      type: Number,
      default: null,
    },
    fadeAnimation: {
      type: Boolean,
      default: null,
    },
    markerZoomAnimation: {
      type: Boolean,
      default: null,
    },
    noBlockingAnimations: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, context) {
    const root = ref(null);
    const ready = ref(false);
    const mapRef = ref(null);
    const layerControl = ref(null);
    const layersToAdd = ref([]);
    const layersInControl = ref([]);
    const lastSetCenter = ref(null);
    const lastSetBounds = ref(null);
    const paddingBottomRight = ref(null);
    const paddingTopLeft = ref(null);
    const padding = ref(null);

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

    const methods = {
      addLayer(layer) {
        mapRef.value.addLayer(layer);
      },
      removeLayer(layer, alreadyRemoved) {
        if (layer.layerType !== undefined) {
          if (layerControl.value === undefined) {
            layersToAdd.value = layersToAdd.value.filter(
              (l) => l.name !== layer.name
            );
          } else {
            layerControl.value.removeLayer(layer);
            layersInControl.value = layersInControl.value.filter(
              (l) => l.mapObject._leaflet_id !== layer.mapObject._leaflet_id
            );
          }
        }
        if (!alreadyRemoved) {
          mapRef.value.removeLayer(layer.mapObject);
        }
      },

      registerLayerControl(lControlLayers) {
        layerControl.value = lControlLayers;
        mapRef.value.addControl(lControlLayers.mapObject);
        layersToAdd.value.forEach((layer) => {
          layerControl.value.addLayer(layer);
        });
        layersToAdd.value = [];
      },

      setZoom(newVal) {
        mapRef.value.setZoom(newVal, {
          animate: props.noBlockingAnimations ? false : null,
        });
      },

      setPaddingBottomRight(newVal) {
        paddingBottomRight.value = newVal;
      },
      setPaddingTopLeft(newVal) {
        paddingTopLeft.value = newVal;
      },
      setPadding(newVal) {
        padding.value = newVal;
      },
      setCrs(newVal) {
        const prevBounds = mapRef.value.getBounds();
        mapRef.value.options.crs = newVal;
        mapRef.value.fitBounds(prevBounds, { animate: false, padding: [0, 0] });
      },
      fitBounds(bounds) {
        mapRef.value.fitBounds(bounds, {
          animate: this.noBlockingAnimations ? false : null,
        });
      },
    };

    provide("addLayer", methods.addLayer);
    provide("removeLayer", methods.removeLayer);

    const eventHandlers = {
      moveEndHandler() {
        /**
         * Triggers when zoom is updated
         * @type {number,string}
         */
        context.emit("update:zoom", mapRef.value.getZoom());
        const center = mapRef.value.getCenter();
        /**
         * Triggers when center is updated
         * @type {object,array}
         */
        context.emit("update:center", center);
        const bounds = mapRef.value.getBounds();
        /**
         * Triggers when bounds are updated
         * @type {object}
         */
        context.emit("update:bounds", bounds);
      },
      overlayAddHandler(e) {
        const layer = layersInControl.value.find((l) => l.name === e.name);
        if (layer) {
          layer.updateVisibleProp(true);
        }
      },
      overlayRemoveHandler(e) {
        const layer = layersInControl.value.find((l) => l.name === e.name);
        if (layer) {
          layer.updateVisibleProp(false);
        }
      },
    };

    onMounted(async () => {
      const { map, CRS, Icon, latLngBounds, latLng, DomEvent } = await import(
        "leaflet/dist/leaflet-src.esm"
      );
      delete Icon.Default.prototype._getIconUrl;

      Icon.Default.mergeOptions({
        iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
        iconUrl: require("leaflet/dist/images/marker-icon.png"),
        shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
      });

      options.crs = options.crs || CRS.EPSG3857;

      const methodsWithDependencies = {
        setBounds(newVal) {
          if (!newVal) {
            return;
          }
          const newBounds = latLngBounds(newVal);
          if (!newBounds.isValid()) {
            return;
          }
          const oldBounds = lastSetBounds.value || mapRef.value.getBounds();
          const boundsChanged = !oldBounds.equals(newBounds, 0); // set maxMargin to 0 - check exact equals
          if (boundsChanged) {
            lastSetBounds.value = newBounds;
            mapRef.value.fitBounds(newBounds, this.fitBoundsOptions);
          }
        },

        setCenter(newVal) {
          if (newVal == null) {
            return;
          }
          const newCenter = latLng(newVal);
          const oldCenter = lastSetCenter.value || mapRef.value.getCenter();
          if (
            oldCenter.lat !== newCenter.lat ||
            oldCenter.lng !== newCenter.lng
          ) {
            lastSetCenter.value = newCenter;
            mapRef.value.panTo(newCenter, {
              animate: this.noBlockingAnimations ? false : null,
            });
          }
        },
      };

      mapRef.value = map(root.value, options);

      propsBinder({ ...methods, methodsWithDependencies }, mapRef.value, props);
      const listeners = remapEvents(context.attrs);

      mapRef.value.on("moveend", debounce(eventHandlers.moveEndHandler, 100));
      mapRef.value.on("overlayadd", eventHandlers.overlayAddHandler);
      mapRef.value.on("overlayremove", eventHandlers.overlayRemoveHandler);
      DomEvent.on(mapRef.value, listeners);
      ready.value = true;
    });

    onBeforeUnmount(() => {
      if (mapRef.value) {
        mapRef.value.remove();
      }
    });

    const mapObject = computed(() => mapRef.value);
    return { root, ready, mapObject };
  },
};
</script>
