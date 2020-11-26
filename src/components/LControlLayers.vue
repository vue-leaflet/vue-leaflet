<script>
import { onMounted, ref, inject, nextTick } from "vue";
import { props, setup as layerControlSetup } from "../functions/controlLayers";
import { propsBinder } from "../utils.js";

export default {
  name: "LControlLayers",
  props,
  setup(props, context) {
    const leafletRef = ref({});

    const registerLayerControl = inject("registerLayerControl");
    const { options, methods } = layerControlSetup(props, leafletRef);
    onMounted(async () => {
      const { control } = await import("leaflet/dist/leaflet-src.esm");

      leafletRef.value = control.layers(null, null, options);

      propsBinder(methods, leafletRef.value, props);

      registerLayerControl({
        ...props,
        ...methods,
        leafletObject: leafletRef.value,
      });
      nextTick(() => context.emit("ready", leafletRef.value));
    });
    return { leafletObject: leafletRef.value };
  },
  render() {
    return null;
  },
};
</script>
