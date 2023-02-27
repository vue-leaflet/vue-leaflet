<script lang="ts">
import type L from "leaflet";
import { onMounted, ref, inject, nextTick, markRaw } from "vue";
import {
  remapEvents,
  propsBinder,
  WINDOW_OR_GLOBAL,
  assertInject,
} from "../utils.js";
import { tileLayerProps, setupTileLayer } from "../functions/tileLayer";
import {
  AddLayerInjection,
  UseGlobalLeafletInjection,
} from "../types/injectionKeys";

export default {
  props: tileLayerProps,
  setup(props, context) {
    const leafletObject = ref<L.TileLayer>();

    const useGlobalLeaflet = inject(UseGlobalLeafletInjection);
    const addLayer = assertInject(AddLayerInjection);

    const { options, methods } = setupTileLayer(props, leafletObject, context);

    onMounted(async () => {
      const { tileLayer, DomEvent }: typeof L = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import("leaflet/dist/leaflet-src.esm");

      leafletObject.value = markRaw<L.TileLayer>(tileLayer(props.url, options));

      const listeners = remapEvents(context.attrs);
      DomEvent.on(leafletObject.value, listeners);

      propsBinder(methods, leafletObject.value, props);
      addLayer({
        ...props,
        ...methods,
        leafletObject: leafletObject.value,
      });
      nextTick(() => context.emit("ready", leafletObject.value));
    });

    return { leafletObject };
  },
  render() {
    return null;
  },
};
</script>
