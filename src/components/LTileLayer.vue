<script>
import { onMounted, ref } from "vue";
import { remapEvents, propsBinder, injectLeafletMethod } from "../utils.js";
import { props, setup as tileLayerSetup } from "../functions/tileLayer";

export default {
  props,
  setup(props, context) {
    const leafletRef = ref({});
    console.log("injecting addLayer to LTileLayer");
    const addLayer = injectLeafletMethod("addLayer");

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
