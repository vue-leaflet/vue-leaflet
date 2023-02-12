<script>
import { onMounted, ref, inject, nextTick, markRaw } from "vue";
import {
  controlLayersProps,
  setupControlLayers,
} from "../functions/controlLayers";
import { propsBinder, WINDOW_OR_GLOBAL, GLOBAL_LEAFLET_OPT } from "../utils.js";

export default {
  name: "LControlLayers",
  props: controlLayersProps,
  setup(props, context) {
    const leafletObject = ref({});

    const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
    const registerLayerControl = inject("registerLayerControl");

    const { options, methods } = setupControlLayers(props, leafletObject);

    onMounted(async () => {
      const { control } = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import("leaflet/dist/leaflet-src.esm");

      leafletObject.value = markRaw(control.layers(null, null, options));

      propsBinder(methods, leafletObject.value, props);

      registerLayerControl({
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
