<script>
import { onMounted, ref, inject } from "vue";
import { props, setup as scaleControlSetup } from "../functions/controlScale";
import { propsBinder } from "../utils.js";

export default {
  name: "LControlScale",
  props,
  setup(props) {
    const leafletRef = ref({});

    const registerControl = inject("registerControl");
    const { options, methods } = scaleControlSetup(props, leafletRef);
    onMounted(async () => {
      const { control, setOptions } = await import(
        "leaflet/dist/leaflet-src.esm"
      );

      leafletRef.value = control.scale(options);
      propsBinder(methods, leafletRef.value, props, setOptions);
      registerControl({ leafletObject: leafletRef.value });
    });
  },
  render() {
    return null;
  },
};
</script>
