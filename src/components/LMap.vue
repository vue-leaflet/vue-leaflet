<script>
import {
  computed,
  h,
  markRaw,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  reactive,
  ref,
} from "vue";
import {
  remapEvents,
  propsBinder,
  debounce,
  resetWebpackIcon,
  provideLeafletWrapper,
  updateLeafletWrapper,
  WINDOW_OR_GLOBAL,
  GLOBAL_LEAFLET_OPT,
  propsToLeafletOptions,
  cancelDebounces,
} from "../utils.js";
import { componentProps, setupComponent } from "../functions/component";

const mapProps = {
  ...componentProps,
  /**
   * The center of the map, supports .sync modifier
   */
  center: {
    type: [Object, Array],
  },
  /**
   * The bounds of the map, supports .sync modifier
   */
  bounds: {
    type: [Array, Object],
  },
  /**
   * The max bounds of the map
   */
  maxBounds: {
    type: [Array, Object],
  },
  /**
   * The zoom of the map, supports .sync modifier
   */
  zoom: {
    type: Number,
  },
  /**
   * The minZoom of the map
   */
  minZoom: {
    type: Number,
  },
  /**
   * The maxZoom of the map
   */
  maxZoom: {
    type: Number,
  },
  /**
   * The paddingBottomRight of the map
   */
  paddingBottomRight: {
    type: Array,
  },
  /**
   * The paddingTopLeft of the map
   */
  paddingTopLeft: {
    type: Array,
  },
  /**
   * The padding of the map
   */
  padding: {
    type: Array,
  },
  /**
   * The worldCopyJump option for the map
   */
  worldCopyJump: {
    type: Boolean,
    default: undefined,
  },
  /**
   * The CRS to use for the map. Can be an object that defines a coordinate reference
   * system for projecting geographical points into screen coordinates and back
   * (see https://leafletjs.com/reference-1.7.1.html#crs-l-crs-base), or a string
   * name identifying one of Leaflet's defined CRSs, such as "EPSG4326".
   */
  crs: {
    type: [String, Object],
  },
  maxBoundsViscosity: {
    type: Number,
  },
  inertia: {
    type: Boolean,
    default: undefined,
  },
  inertiaDeceleration: {
    type: Number,
  },
  inertiaMaxSpeed: {
    type: Number,
  },
  easeLinearity: {
    type: Number,
  },
  zoomAnimation: {
    type: Boolean,
    default: undefined,
  },
  zoomAnimationThreshold: {
    type: Number,
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
    default: undefined,
  },
  useGlobalLeaflet: {
    type: Boolean,
    default: undefined,
  },
};

export default {
  emits: ["ready", "update:zoom", "update:center", "update:bounds"],
  props: mapProps,
  setup(props, context) {
    const root = ref(null);
    const blueprint = reactive({
      ready: false,
      leafletRef: {},
      layersToAdd: [],
      layersInControl: [],
    });

    const { options: componentOptions } = setupComponent(props);

    const options = propsToLeafletOptions(props, mapProps, componentOptions);

    const addLayer = provideLeafletWrapper("addLayer");
    const removeLayer = provideLeafletWrapper("removeLayer");
    const registerControl = provideLeafletWrapper("registerControl");
    const registerLayerControl = provideLeafletWrapper("registerLayerControl");
    provide(GLOBAL_LEAFLET_OPT, props.useGlobalLeaflet);

    const eventHandlers = {
      moveEndHandler: debounce(() => {
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
      }),
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
      if (props.useGlobalLeaflet) {
        WINDOW_OR_GLOBAL.L = WINDOW_OR_GLOBAL.L || (await import("leaflet"));
      }
      const {
        map,
        CRS,
        Icon,
        latLngBounds,
        latLng,
        DomEvent,
      } = props.useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import("leaflet/dist/leaflet-src.esm");

      try {
        options.beforeMapMount && (await options.beforeMapMount());
      } catch (error) {
        console.error(
          `The following error occurred running the provided beforeMapMount hook ${error.message}`
        );
      }

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

      blueprint.leafletRef = markRaw(map(root.value, options));

      propsBinder(methods, blueprint.leafletRef, props);
      const listeners = remapEvents(context.attrs);

      blueprint.leafletRef.on("moveend", eventHandlers.moveEndHandler);
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
      cancelDebounces(eventHandlers);
      if (blueprint.leafletRef) {
        blueprint.leafletRef.off();
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
      this.ready && this.$slots.default ? this.$slots.default() : {}
    );
  },
};
</script>
