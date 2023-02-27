<script lang="ts">
import type L from "leaflet";
import {
  onMounted,
  ref,
  inject,
  nextTick,
  markRaw,
  defineComponent,
} from "vue";
import {
  remapEvents,
  propsBinder,
  WINDOW_OR_GLOBAL,
  assertInject,
} from "@src/utils.js";
import {
  wmsTileLayerProps,
  setupWMSTileLayer,
} from "@src/functions/wmsTileLayer";
import {
  AddLayerInjection,
  UseGlobalLeafletInjection,
} from "@src/types/injectionKeys";

export default defineComponent({
  props: wmsTileLayerProps,
  setup(props, context) {
    const leafletObject = ref<L.TileLayer.WMS>();

    const useGlobalLeaflet = inject(UseGlobalLeafletInjection);
    const addLayer = assertInject(AddLayerInjection);

    const { options, methods } = setupWMSTileLayer(props, leafletObject);

    onMounted(async () => {
      const { tileLayer, DomEvent }: typeof L = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import("leaflet/dist/leaflet-src.esm");

      leafletObject.value = markRaw<L.TileLayer.WMS>(
        tileLayer.wms(props.url, options)
      );

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
});
</script>
