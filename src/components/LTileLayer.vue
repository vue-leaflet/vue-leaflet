<script>
import { onMounted, ref, inject, nextTick, markRaw } from "vue";
import {
  remapEvents,
  propsBinder,
  WINDOW_OR_GLOBAL,
  GLOBAL_LEAFLET_OPT,
} from "../utils.js";
import { tileLayerProps, setupTileLayer } from "../functions/tileLayer";

export default {
  props: tileLayerProps,
  setup(props, context) {
    const leafletRef = ref({});

    const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
    const addLayer = inject("addLayer");

    const { options, methods } = setupTileLayer(props, leafletRef, context);

    onMounted(async () => {
      const { tileLayer, DomEvent } = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import("leaflet/dist/leaflet-src.esm");

      leafletRef.value = markRaw(tileLayer(props.url, options));

      const listeners = remapEvents(context.attrs);
      DomEvent.on(leafletRef.value, listeners);

      propsBinder(methods, leafletRef.value, props);
      addLayer({
        ...props,
        ...methods,
        leafletObject: leafletRef.value,
      });
      nextTick(() => context.emit("ready", leafletRef.value));
    });

    return { leafletObject: leafletRef };
  },
  render() {
    return null;
  },
};
</script>
