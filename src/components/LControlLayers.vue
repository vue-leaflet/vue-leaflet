<script>
import { onMounted, ref, inject } from "vue";
import { props, setup as controlSetup } from "../functions/controlLayers";
import { propsBinder } from "../utils.js";

export default {
  name: "LControlLayers",
  props,
  setup(props) {
    const leafletRef = ref({});

    const lMethods = inject("leafLetMethods");
    const { options, methods } = controlSetup(props, leafletRef);
    onMounted(async () => {
      const { control, setOptions } = await import(
        "leaflet/dist/leaflet-src.esm"
      );

      leafletRef.value = control.layers(null, null, options);
      propsBinder(methods, leafletRef.value, props, setOptions);

      lMethods.registerLayerControl({
        ...props,
        ...methods,
        leafletObject: leafletRef.value,
      });
    });
  },
  render() {
    return null;
  },
};
</script>
