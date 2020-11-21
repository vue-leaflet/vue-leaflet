<script>
import { onMounted, ref, inject, nextTick } from "vue";
import {
  props as attributionControlProps,
  setup as attributionControlSetup,
} from "../functions/controlAttribution";
import { propsBinder } from "../utils.js";

export default {
  name: "LControlAttribution",
  props: {
    ...attributionControlProps,
    options: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props, context) {
    const leafletRef = ref({});

    const registerControl = inject("registerControl");
    const { options, methods } = attributionControlSetup(props, leafletRef);
    onMounted(async () => {
      const { control, setOptions } = await import(
        "leaflet/dist/leaflet-src.esm"
      );

      leafletRef.value = control.attribution(options);
      propsBinder(methods, leafletRef.value, props, setOptions);
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
