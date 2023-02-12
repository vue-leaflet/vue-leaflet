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
    const leafletRef = ref({});

    const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
    const registerControl = inject("registerControl");

    const { options, methods } = setupControlScale(props, leafletRef);

    onMounted(async () => {
      const { control } = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import("leaflet/dist/leaflet-src.esm");

      leafletRef.value = markRaw(control.scale(options));
      propsBinder(methods, leafletRef.value, props);
      registerControl({ leafletObject: leafletRef.value });
      nextTick(() => context.emit("ready", leafletRef.value));
    });
    return { leafletObject: leafletRef.value };
  },
  render() {
    return null;
  },
};
</script>
