<script>
import { onMounted, ref, inject } from "vue";
import { remapEvents, propsBinder } from "../utils.js";
import { props, setup as wmsLayerSetup } from "../functions/wmsTileLayer";

console.log(props);

export default {
  props,
  setup(props, context) {
    const leafletRef = ref({});

    const addLayer = inject("addLayer");

    const { options, methods } = wmsLayerSetup(props, leafletRef);

    onMounted(async () => {
      const { tileLayer, DomEvent, setOptions } = await import(
        "leaflet/dist/leaflet-src.esm"
      );

      leafletRef.value = tileLayer.wms(props.baseUrl, options);

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