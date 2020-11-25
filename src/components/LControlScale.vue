<script>
import { onMounted, ref, inject, nextTick } from "vue";
import { props, setup as scaleControlSetup } from "../functions/controlScale";
import { propsBinder } from "../utils.js";

export default {
  name: "LControlScale",
  props,
  setup(props, context) {
    const leafletRef = ref({});

    const registerControl = inject("registerControl");
    const { options, methods } = scaleControlSetup(props, leafletRef);
    onMounted(async () => {
      const { control } = await import("leaflet/dist/leaflet-src.esm");

      leafletRef.value = control.scale(options);
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
