<script>
import { onMounted, ref, inject } from "vue";
import { props, setup as zoomControlSetup } from "../functions/controlZoom";
import { propsBinder } from "../utils.js";

export default {
  name: "LControlLayers",
  props,
  setup(props) {
    const leafletRef = ref({});

    const registerControl = inject("registerControl");
    const { options, methods } = zoomControlSetup(props, leafletRef);
    onMounted(async () => {
      const { control, setOptions } = await import(
        "leaflet/dist/leaflet-src.esm"
      );

      leafletRef.value = control.zoom(options);
      propsBinder(methods, leafletRef.value, props, setOptions);
      registerControl({ leafletObject: leafletRef.value });
    });
  },
  render() {
    return null;
  },
};
</script>
