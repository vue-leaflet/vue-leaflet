<script>
import { onMounted, ref, inject, nextTick, markRaw } from "vue";
import {
  controlScaleProps,
  setupControlScale,
} from "../functions/controlScale";
import { propsBinder, WINDOW_OR_GLOBAL, GLOBAL_LEAFLET_OPT } from "../utils.js";

export default {
  name: "LControlScale",
  props: controlScaleProps,
  setup(props, context) {
    const leafletObject = ref({});

    const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
    const registerControl = inject("registerControl");

    const { options, methods } = setupControlScale(props, leafletObject);

    onMounted(async () => {
      const { control } = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import("leaflet/dist/leaflet-src.esm");

      leafletObject.value = markRaw(control.scale(options));
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
