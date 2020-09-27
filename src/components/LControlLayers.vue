<script>
import { onMounted, ref, inject } from "vue";
import { props, setup as controlSetup } from "../functions/controlLayers";
import { propsBinder } from "../utils.js";

export default {
  name: "LControlLayers",
  props,
  setup(props) {
    const mapRef = ref({});

    const lMethods = inject("leafLetMethods");
    const { options, methods } = controlSetup(props, mapRef);
    onMounted(async () => {
      const { control, setOptions } = await import(
        "leaflet/dist/leaflet-src.esm"
      );

      mapRef.value = control.layers(null, null, options);
      propsBinder(methods, mapRef.value, props, setOptions);

      lMethods.registerLayerControl({
        ...props,
        ...methods,
        mapObject: mapRef.value,
      });
    });
  },
  render() {
    return null;
  },
};
</script>
