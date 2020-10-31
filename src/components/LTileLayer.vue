<script>
import { onMounted, ref, inject } from "vue";
import { remapEvents, propsBinder } from "../utils.js";
import { props, setup as tileLayerSetup } from "../functions/tileLayer";

export default {
  props,
  setup(props, context) {
    const leafletRef = ref({});

    const addLayer = inject("addLayer");

    const { options, methods } = tileLayerSetup(props, leafletRef);

    onMounted(async () => {
      const { tileLayer, DomEvent, setOptions } = await import(
        "leaflet/dist/leaflet-src.esm"
      );
      leafletRef.value = tileLayer(props.url, options);

      const listeners = remapEvents(context.attrs);
      DomEvent.on(leafletRef.value, listeners);

      propsBinder(methods, leafletRef.value, props, setOptions);
      addLayer({
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
