<script>
import { onMounted, ref, inject, nextTick, markRaw } from "vue";
import {
  remapEvents,
  propsBinder,
  WINDOW_OR_GLOBAL,
  GLOBAL_LEAFLET_OPT,
} from "../utils.js";
import {
  wmsTileLayerProps,
  setupWMSTileLayer,
} from "../functions/wmsTileLayer";

export default {
  props: wmsTileLayerProps,
  setup(props, context) {
    const leafletRef = ref({});

    const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
    const addLayer = inject("addLayer");

    const { options, methods } = setupWMSTileLayer(props, leafletRef);

    onMounted(async () => {
      const { tileLayer, DomEvent } = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import("leaflet/dist/leaflet-src.esm");

      leafletRef.value = markRaw(tileLayer.wms(props.url, options));

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
    return { leafletObject: leafletRef.value };
  },
  render() {
    return null;
  },
};
</script>
