<script>
import {
  onMounted,
  onBeforeUnmount,
  computed,
  reactive,
  ref,
  nextTick,
  h,
} from "vue";
import {
  remapEvents,
  propsBinder,
  debounce,
  resetWebpackIcon,
  provideLeafletWrapper,
  updateLeafletWrapper,
} from "../utils.js";
import {
  props as componentProps,
  setup as componentSetup,
} from "../functions/component";

export default {
  props: {
    ...componentProps,
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
     * The CRS to use for the map. Can be an object that defines a coordinate reference
     * system for projecting geographical points into screen coordinates and back
     * (see https://leafletjs.com/reference-1.7.1.html#crs-l-crs-base), or a string
     * name identifying one of Leaflet's defined CRSs, such as "EPSG4326".
     */
    crs: {
      type: [String, Object],
      default: "EPSG3857",
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
    const { options: componentOptions } = componentSetup(props);
    const options = {
      ...componentOptions,
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

    const addLayer = provideLeafletWrapper("addLayer");
    const removeLayer = provideLeafletWrapper("removeLayer");
    const registerControl = provideLeafletWrapper("registerControl");
    const registerLayerControl = provideLeafletWrapper("registerLayerControl");

    const eventHandlers = {
      moveEndHandler() {
        /**
         * Triggers when zoom is updated
         * @type {number,string}
         */
        context.emit("update:zoom", blueprint.leafletRef.getZoom());
        /**
         * Triggers when center is updated
         * @type {object,array}
         */
        context.emit("update:center", blueprint.leafletRef.getCenter());

        /**
         * Triggers when bounds are updated
         * @type {object}
         */
        context.emit("update:bounds", blueprint.leafletRef.getBounds());
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
      const { map, CRS, Icon, latLngBounds, latLng, DomEvent } = await import(
        "leaflet/dist/leaflet-src.esm"
      );
      await resetWebpackIcon(Icon);

      const optionsCrs =
        typeof options.crs == "string" ? CRS[options.crs] : options.crs;
      options.crs = optionsCrs || CRS.EPSG3857;

      const methods = {
        addLayer(layer) {
          if (layer.layerType !== undefined) {
            if (blueprint.layerControl === undefined) {
              blueprint.layersToAdd.push(layer);
            } else {
              const exist = blueprint.layersInControl.find(
                (l) =>
                  l.leafletObject._leaflet_id ===
                  layer.leafletObject._leaflet_id
              );
              if (!exist) {
                blueprint.layerControl.addLayer(layer);
                blueprint.layersInControl.push(layer);
              }
            }
          }
          if (layer.visible !== false) {
            blueprint.leafletRef.addLayer(layer.leafletObject);
          }
        },
        removeLayer(layer) {
          if (layer.layerType !== undefined) {
            if (blueprint.layerControl === undefined) {
              blueprint.layersToAdd = blueprint.layersToAdd.filter(
                (l) => l.name !== layer.name
              );
            } else {
              blueprint.layerControl.removeLayer(layer.leafletObject);
              blueprint.layersInControl = blueprint.layersInControl.filter(
                (l) =>
                  l.leafletObject._leaflet_id !==
                  layer.leafletObject._leaflet_id
              );
            }
          }
          blueprint.leafletRef.removeLayer(layer.leafletObject);
        },

        registerLayerControl(lControlLayer) {
          blueprint.layerControl = lControlLayer;
          blueprint.layersToAdd.forEach((layer) => {
            blueprint.layerControl.addLayer(layer);
          });
          blueprint.layersToAdd = [];

          registerControl(lControlLayer);
        },

        registerControl(lControl) {
          blueprint.leafletRef.addControl(lControl.leafletObject);
        },

        setZoom(newVal) {
          const zoom = blueprint.leafletRef.getZoom();
          if (newVal !== zoom) {
            blueprint.leafletRef.setZoom(newVal, {
              animate: props.noBlockingAnimations ? false : null,
            });
          }
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
          const prevBounds = blueprint.leafletRef.getBounds();
          blueprint.leafletRef.options.crs = newVal;
          blueprint.leafletRef.fitBounds(prevBounds, {
            animate: false,
            padding: [0, 0],
          });
        },
        fitBounds(bounds) {
          blueprint.leafletRef.fitBounds(bounds, {
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
            blueprint.lastSetBounds || blueprint.leafletRef.getBounds();
          const boundsChanged = !oldBounds.equals(newBounds, 0); // set maxMargin to 0 - check exact equals
          if (boundsChanged) {
            blueprint.lastSetBounds = newBounds;
            blueprint.leafletRef.fitBounds(newBounds, this.fitBoundsOptions);
          }
        },

        setCenter(newVal) {
          if (newVal == null) {
            return;
          }
          const newCenter = latLng(newVal);
          const oldCenter =
            blueprint.lastSetCenter || blueprint.leafletRef.getCenter();
          if (
            oldCenter.lat !== newCenter.lat ||
            oldCenter.lng !== newCenter.lng
          ) {
            blueprint.lastSetCenter = newCenter;
            blueprint.leafletRef.panTo(newCenter, {
              animate: this.noBlockingAnimations ? false : null,
            });
          }
        },
      };

      updateLeafletWrapper(addLayer, methods.addLayer);
      updateLeafletWrapper(removeLayer, methods.removeLayer);
      updateLeafletWrapper(registerControl, methods.registerControl);
      updateLeafletWrapper(registerLayerControl, methods.registerLayerControl);

      blueprint.leafletRef = map(root.value, options);

      propsBinder(methods, blueprint.leafletRef, props);
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
      nextTick(() => context.emit("ready", blueprint.leafletRef));
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
  render() {
    return h(
      "div",
      { style: { width: "100%", height: "100%" }, ref: "root" },
      this.ready ? this.$slots.default() : {}
    );
  },
};
</script>
