<script>
import { onMounted, ref, inject, nextTick } from "vue";
import {
  props as zoomControlProps,
  setup as zoomControlSetup,
} from "../functions/controlZoom";
import { propsBinder, optionsMerger } from "../utils.js";

export default {
  name: "LControlZoom",
  props: {
    ...zoomControlProps,
    options: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props, context) {
    const leafletRef = ref({});

    const registerControl = inject("registerControl");
    const { options, methods } = zoomControlSetup(props, leafletRef);
    onMounted(async () => {
      const { control } = await import("leaflet/dist/leaflet-src.esm");

      leafletRef.value = control.zoom(optionsMerger(options, props));
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
