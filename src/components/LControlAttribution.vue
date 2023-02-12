<script>
import { onMounted, ref, inject, nextTick, markRaw } from "vue";
import {
  controlAttributionProps,
  setupControlAttribution,
} from "../functions/controlAttribution";
import { propsBinder, WINDOW_OR_GLOBAL, GLOBAL_LEAFLET_OPT } from "../utils.js";

export default {
  name: "LControlAttribution",
  props: controlAttributionProps,
  setup(props, context) {
    const leafletObject = ref({});

    const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
    const registerControl = inject("registerControl");

    const { options, methods } = setupControlAttribution(props, leafletObject);

    onMounted(async () => {
      const { control } = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import("leaflet/dist/leaflet-src.esm");

      leafletObject.value = markRaw(control.attribution(options));
      propsBinder(methods, leafletObject.value, props);
      registerControl({ leafletObject: leafletObject.value });
      nextTick(() => context.emit("ready", leafletObject.value));
    });

    return { leafletObject };
  },
  render() {
    return null;
  },
};
</script>
