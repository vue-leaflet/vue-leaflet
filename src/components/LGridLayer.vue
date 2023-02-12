<script>
import {
  onMounted,
  onUnmounted,
  ref,
  inject,
  nextTick,
  h,
  render,
  markRaw,
} from "vue";
import {
  remapEvents,
  propsBinder,
  WINDOW_OR_GLOBAL,
  GLOBAL_LEAFLET_OPT,
} from "../utils.js";
import { gridLayerProps, setupGridLayer } from "../functions/gridLayer";

export default {
  props: {
    ...gridLayerProps,
    childRender: {
      type: Function,
      required: true,
    },
  },
  setup(props, context) {
    const leafletObject = ref({});
    const tileComponents = ref({});
    const root = ref(null);
    const ready = ref(false);

    const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
    const addLayer = inject("addLayer");

    const { options, methods } = setupGridLayer(props, leafletObject, context);

    onMounted(async () => {
      const { GridLayer, DomEvent, DomUtil } = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import("leaflet/dist/leaflet-src.esm");

      methods.onUnload = (e) => {
        const key = leafletObject.value._tileCoordsToKey(e.coords);
        if (tileComponents[key]) {
          tileComponents[key].innerHTML = "";
          tileComponents[key] = undefined;
        }
      };

      methods.setTileComponent = () => {
        leafletObject.value.redraw();
      };

      const GLayer = GridLayer.extend({
        createTile(coords) {
          const key = leafletObject.value._tileCoordsToKey(coords);
          tileComponents[key] = DomUtil.create("div");

          let vNode = h(
            { setup: props.childRender, props: ["coords"] },
            { coords }
          );
          render(vNode, tileComponents[key]);

          return tileComponents[key];
        },
      });

      leafletObject.value = markRaw(new GLayer(options));

      const listeners = remapEvents(context.attrs);
      DomEvent.on(leafletObject.value, listeners);

      leafletObject.value.on("tileunload", methods.onUnload);

      propsBinder(methods, leafletObject.value, props);
      addLayer({
        ...props,
        ...methods,
        leafletObject: leafletObject.value,
      });
      ready.value = true;
      nextTick(() => context.emit("ready", leafletObject.value));
    });

    onUnmounted(() => {
      leafletObject.value.off("tileunload", methods.onUnload);
    });

    return { root, ready, leafletObject };
  },
  render() {
    if (this.ready) {
      return h("div", { style: { display: "none" }, ref: "root" });
    }
    return null;
  },
};
</script>
