<script>
import { onMounted, ref, inject } from "vue";
import {
  props,
  setup as attributionControlSetup,
} from "../functions/controlAttribution";
import { propsBinder } from "../utils.js";

export default {
  name: "LControlAttribution",
  props,
  setup(props) {
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
    });
  },
  render() {
    return null;
  },
};
</script>
