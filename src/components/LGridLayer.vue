<script>
import { onMounted, onUnmounted, ref, inject, nextTick, h, render } from "vue";
import { remapEvents, propsBinder } from "../utils.js";
import {
  props as gridLayerProps,
  setup as gridLayerSetup,
} from "../functions/gridLayer";

export default {
  props: {
    ...gridLayerProps,
    childRender: {
      type: Function,
      required: true,
    },
  },
  setup(props, context) {
    const leafletRef = ref({});
    const tileComponents = ref({});
    const root = ref(null);
    const ready = ref(false);

    const addLayer = inject("addLayer");

    const { options, methods } = gridLayerSetup(props, leafletRef);

    onMounted(async () => {
      const { GridLayer, DomEvent, DomUtil } = await import(
        "leaflet/dist/leaflet-src.esm"
      );

      methods.onUnload = (e) => {
        const key = leafletRef.value._tileCoordsToKey(e.coords);
        if (tileComponents[key]) {
          tileComponents[key].innerHTML = "";
          tileComponents[key] = undefined;
        }
      };

      methods.setTileComponent = () => {
        leafletRef.value.redraw();
      };

      const GLayer = GridLayer.extend({
        createTile(coords) {
          const key = leafletRef.value._tileCoordsToKey(coords);
          tileComponents[key] = DomUtil.create("div");

          let vNode = h(
            { setup: props.childRender, props: ["coords"] },
            { coords }
          );
          render(vNode, tileComponents[key]);

          return tileComponents[key];
        },
      });

      leafletRef.value = new GLayer(options);

      const listeners = remapEvents(context.attrs);
      DomEvent.on(leafletRef.value, listeners);

      leafletRef.value.on("tileunload", methods.onUnload);

      propsBinder(methods, leafletRef.value, props);
      addLayer({
        ...props,
        ...methods,
        leafletObject: leafletRef.value,
      });
      ready.value = true;
      nextTick(() => context.emit("ready", leafletRef.value));
    });

    onUnmounted(() => {
      leafletRef.value.off("tileunload", methods.unLoad);
    });

    return { root, ready, leafletObject: leafletRef };
  },
  render() {
    if (this.ready) {
      return h("div", { style: { display: "none" }, ref: "root" });
    }
    return null;
  },
};
</script>
