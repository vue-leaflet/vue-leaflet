<script lang="ts">
import type L from "leaflet";
import { debounce } from "ts-debounce";
import {
  type PropType,
  computed,
  defineComponent,
  h,
  markRaw,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  reactive,
  ref,
} from "vue";

import { componentProps, setupComponent } from "@src/functions/component";
import {
  AddLayerInjection,
  RegisterControlInjection,
  RegisterLayerControlInjection,
  RemoveLayerInjection,
  UseGlobalLeafletInjection,
} from "@src/types/injectionKeys";
import type {
  IControlDefinition,
  ILayerDefinition,
  IMapBlueprint,
  IMapOptions,
} from "@src/types/interfaces";
import {
  type Data,
  WINDOW_OR_GLOBAL,
  bindEventHandlers,
  cancelDebounces,
  propsBinder,
  propsToLeafletOptions,
  provideLeafletWrapper,
  remapEvents,
  resetWebpackIcon,
  updateLeafletWrapper,
} from "@src/utils.js";

type StyleableAttrs = Data & { style: Data };

const mapProps = {
  ...componentProps,
  /**
   * The center of the map, supports .sync modifier
   */
  center: {
    type: [Object, Array] as PropType<L.PointExpression>,
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
    type: [Object, Array] as PropType<L.PointExpression>,
  },
  /**
   * The paddingTopLeft of the map
   */
  paddingTopLeft: {
    type: Object as PropType<L.PointExpression>,
  },
  /**
   * The padding of the map
   */
  padding: {
    type: Object as PropType<L.PointExpression>,
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
    default: true,
    custom: true,
  },
};

export default defineComponent({
  name: "LMap",
  inheritAttrs: false,
  emits: ["ready", "update:zoom", "update:center", "update:bounds"],
  props: mapProps,
  setup(props, context) {
    const root = ref<HTMLElement>();
    const blueprint = reactive<IMapBlueprint>({
      ready: false,
      layersToAdd: [],
      layersInControl: [],
    });

    const { options: componentOptions } = setupComponent(props);

    const options: IMapOptions = propsToLeafletOptions(
      props,
      mapProps,
      componentOptions
    );
    const { listeners, attrs } = remapEvents(context.attrs);

    const addLayer = provideLeafletWrapper(AddLayerInjection);
    const removeLayer = provideLeafletWrapper(RemoveLayerInjection);
    const registerControl = provideLeafletWrapper(RegisterControlInjection);
    const registerLayerControl = provideLeafletWrapper(
      RegisterLayerControlInjection
    );
    provide(UseGlobalLeafletInjection, props.useGlobalLeaflet);

    const zoomPanOptions = computed(() => {
      const result: L.ZoomPanOptions = {};
      if (props.noBlockingAnimations) {
        result.animate = false;
      }

      return result;
    });

    const fitBoundsOptions = computed(() => {
      const result: L.FitBoundsOptions = zoomPanOptions.value;
      if (props.padding) {
        result.padding = props.padding;
      }
      if (props.paddingTopLeft) {
        result.paddingTopLeft = props.paddingTopLeft;
      }
      if (props.paddingBottomRight) {
        result.paddingBottomRight = props.paddingBottomRight;
      }

      return result;
    });

    const eventHandlers: L.LeafletEventHandlerFnMap = {
      moveend: debounce((_ev: L.LeafletEvent) => {
        if (!blueprint.leafletRef) return;

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
      overlayadd(ev) {
        const layer = blueprint.layersInControl.find((l) => l.name === ev.name);
        if (layer) {
          layer.updateVisibleProp(true);
        }
      },
      overlayremove(ev) {
        const layer = blueprint.layersInControl.find((l) => l.name === ev.name);
        if (layer) {
          layer.updateVisibleProp(false);
        }
      },
    };

    onMounted(async () => {
      if (props.useGlobalLeaflet) {
        WINDOW_OR_GLOBAL.L = WINDOW_OR_GLOBAL.L || (await import("leaflet"));
      }
      const { map, CRS, Icon, latLngBounds, latLng, stamp }: typeof L =
        props.useGlobalLeaflet
          ? WINDOW_OR_GLOBAL.L
          : await import("leaflet/dist/leaflet-src.esm");

      try {
        // TODO: Is beforeMapMount still needed?
        options.beforeMapMount && (await options.beforeMapMount());
      } catch (error: any) {
        console.error(
          `The following error occurred running the provided beforeMapMount hook ${error.message}`
        );
      }

      await resetWebpackIcon(Icon);

      const optionsCrs =
        typeof options.crs == "string" ? CRS[options.crs] : options.crs;
      options.crs = optionsCrs || CRS.EPSG3857;

      const methods = {
        addLayer(layer: ILayerDefinition) {
          if (layer.layerType !== undefined) {
            if (blueprint.layerControl === undefined) {
              blueprint.layersToAdd.push(layer);
            } else {
              const exist = blueprint.layersInControl.find(
                (l) => stamp(l.leafletObject) === stamp(layer.leafletObject)
              );
              if (!exist) {
                blueprint.layerControl.addLayer(layer);
                blueprint.layersInControl.push(layer);
              }
            }
          }
          if (layer.visible !== false) {
            blueprint.leafletRef!.addLayer(layer.leafletObject);
          }
        },
        removeLayer(layer: ILayerDefinition) {
          if (layer.layerType !== undefined) {
            if (blueprint.layerControl === undefined) {
              blueprint.layersToAdd = blueprint.layersToAdd.filter(
                (l) => l.name !== layer.name
              );
            } else {
              blueprint.layerControl.removeLayer(layer.leafletObject);
              blueprint.layersInControl = blueprint.layersInControl.filter(
                (l) => stamp(l.leafletObject) !== stamp(layer.leafletObject)
              );
            }
          }
          blueprint.leafletRef!.removeLayer(layer.leafletObject);
        },

        registerLayerControl(
          lControlLayer: IControlDefinition<L.Control.Layers>
        ) {
          blueprint.layerControl = lControlLayer;
          blueprint.layersToAdd.forEach((layer) => {
            blueprint.layerControl!.addLayer(layer);
          });
          blueprint.layersToAdd = [];

          registerControl(lControlLayer);
        },

        registerControl(lControl: IControlDefinition) {
          blueprint.leafletRef!.addControl(lControl.leafletObject);
        },

        setZoom(newVal) {
          const zoom = blueprint.leafletRef!.getZoom();
          if (newVal !== zoom) {
            blueprint.leafletRef!.setZoom(newVal, zoomPanOptions.value);
          }
        },

        setCrs(newVal) {
          const prevBounds = blueprint.leafletRef!.getBounds();
          blueprint.leafletRef!.options.crs = newVal;
          blueprint.leafletRef!.fitBounds(prevBounds, {
            animate: false,
            padding: [0, 0],
          });
        },
        fitBounds(bounds) {
          blueprint.leafletRef!.fitBounds(bounds, fitBoundsOptions.value);
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
            blueprint.lastSetBounds || blueprint.leafletRef!.getBounds();
          const boundsChanged = !oldBounds.equals(newBounds, 0); // set maxMargin to 0 - check exact equals
          if (boundsChanged) {
            blueprint.lastSetBounds = newBounds;
            blueprint.leafletRef!.fitBounds(newBounds);
          }
        },

        setCenter(newVal) {
          if (newVal == null) {
            return;
          }
          const newCenter = latLng(newVal);
          const oldCenter =
            blueprint.lastSetCenter || blueprint.leafletRef!.getCenter();
          if (
            oldCenter.lat !== newCenter.lat ||
            oldCenter.lng !== newCenter.lng
          ) {
            blueprint.lastSetCenter = newCenter;

            blueprint.leafletRef!.panTo(newCenter, zoomPanOptions.value);
          }
        },
      };

      updateLeafletWrapper(addLayer, methods.addLayer);
      updateLeafletWrapper(removeLayer, methods.removeLayer);
      updateLeafletWrapper(registerControl, methods.registerControl);
      updateLeafletWrapper(registerLayerControl, methods.registerLayerControl);

      blueprint.leafletRef = markRaw(map(root.value!, options));

      propsBinder(methods, blueprint.leafletRef, props);

      bindEventHandlers(blueprint.leafletRef, eventHandlers);
      bindEventHandlers(blueprint.leafletRef, listeners);
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

    return { root, ready, leafletObject, attrs };
  },
  render({ attrs }: { attrs: StyleableAttrs }) {
    if (!attrs.style) attrs.style = {};
    if (!attrs.style.width) attrs.style.width = "100%";
    if (!attrs.style.height) attrs.style.height = "100%";

    return h(
      "div",
      {
        ...attrs,
        ref: "root",
      },
      this.ready && this.$slots.default ? this.$slots.default() : {}
    );
  },
});
</script>
