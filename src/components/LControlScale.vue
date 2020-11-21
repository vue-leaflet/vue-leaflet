<script>
import { onMounted, ref, inject, nextTick } from "vue";
import {
  props as controlScaleProps,
  setup as scaleControlSetup,
} from "../functions/controlScale";
import { propsBinder, optionsMerger } from "../utils.js";

export default {
  name: "LControlScale",
  props: {
    ...controlScaleProps,
    options: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props, context) {
    const leafletRef = ref({});

    const registerControl = inject("registerControl");
    const { options, methods } = scaleControlSetup(props, leafletRef);
    onMounted(async () => {
      const { control } = await import("leaflet/dist/leaflet-src.esm");

      leafletRef.value = control.scale(optionsMerger(options, props));
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
